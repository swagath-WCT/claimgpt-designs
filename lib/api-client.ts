/**
 * API client to connect bolt 3-design UI to ClaimGPT Docker backend (http://localhost:8000)
 */

import { getStoredAuthSession } from '@/lib/auth';

export const INGRESS_API = "http://localhost:8000/ingress";
export const SUBMISSION_API = "http://localhost:8000/submission";
export const CHAT_API = "http://localhost:8000/chat";

export interface ClaimDocumentPreview {
  document_id?: string;
  id?: string;
  original_filename?: string;
  file_name?: string;
  doc_type: string;
  display_title: string;
  page_count: number;
  pages: string[];
}

export interface RealClaimPreview {
  claim_id: string;
  status: string;
  documents?: ClaimDocumentPreview[];
  parsed_fields: Record<string, string>;
  icd_codes: Array<{ code: string; description: string; confidence: number; estimated_cost?: number }>;
  cpt_codes: Array<{ code: string; description: string; confidence: number; estimated_cost?: number }>;
  expenses: Array<{ category: string; description?: string; amount: number }>;
  expense_total?: number;
  billed_total?: number;
  predictions: Array<{ rejection_score: number; top_reasons: Array<{ reason: string; weight: number }> }>;
  validations: Array<{ rule_name: string; severity: string; message: string; passed: boolean }>;
  ocr_excerpt?: string;
  summary: {
    patient_name: string;
    age: string;
    gender: string;
    hospital: string;
    doctor: string;
    admission_date: string;
    discharge_date: string;
    diagnosis: string;
    total_amount: string;
    icd_count: number;
    cpt_count: number;
    risk_score: number | null;
  };
}

export interface RecentClaimSummary {
  id: string;
  patient_name?: string;
  status?: string;
  created_at?: string;
  total_amount?: string;
}

export function getAuthHeaders() {
  const session = getStoredAuthSession();
  const headers: Record<string, string> = {};
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return headers;
}

/**
 * Upload a document to the local Docker backend ingress service
 */
export async function uploadClaimDocument(files: File | File[], userName?: string): Promise<{ claim_id: string; document_id: string }> {
  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : [files];
  const fileNames = fileArray.map(f => f.name.toLowerCase());
  for (const f of fileArray) {
    formData.append("files", f);
  }
  if (userName) {
    formData.append("policy_id", userName);
    formData.append("patient_id", userName);
  }

  const res = await fetch(`${INGRESS_API}/claims`, {
    method: "POST",
    body: formData,
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.statusText}`);
  }

  const data = await res.json();
  const taskId = data.task_id || data.claim_id || data.id;
  let finalClaimId = taskId;
  let finalDocId = data.document_id || (data.documents && data.documents[0]?.id) || "doc-1";

  // If the backend returned a queued Celery task ID, poll the claims list to resolve it to the database claim UUID.
  if (taskId && (taskId.includes("-") || taskId.length > 8)) {
    // Poll up to 15 times (approx 4.5 seconds max) to allow Celery worker to insert the DB record
    for (let attempt = 0; attempt < 15; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      try {
        const claimsListRes = await fetch(`${INGRESS_API}/claims?limit=10&t=${Date.now()}`, { cache: "no-store" });
        if (claimsListRes.ok) {
          const claimsData = await claimsListRes.json();
          const claims = claimsData.claims || claimsData.results || (Array.isArray(claimsData) ? claimsData : []);
          
          // Find the claim that matches one of our uploaded file names
          const matchingClaim = claims.find((c: any) => 
            c.documents && c.documents.some((d: any) => 
              d.file_name && fileNames.includes(d.file_name.toLowerCase())
            )
          );

          if (matchingClaim) {
            finalClaimId = matchingClaim.id || matchingClaim.claim_id;
            if (matchingClaim.documents && matchingClaim.documents.length > 0) {
              finalDocId = matchingClaim.documents[0].id;
            }
            break;
          }
        }
      } catch (err) {
        console.warn("Error resolving claim ID from list:", err);
      }
    }
  }

  return { claim_id: finalClaimId, document_id: finalDocId };
}

/**
 * Poll processing progress from backend — checks both ingress progress & submission preview readiness
 */
export async function fetchClaimProgress(claimId: string): Promise<{ percentage: number; step: string; status: string; is_complete: boolean }> {
  try {
    const prevRes = await fetch(`${SUBMISSION_API}/claims/${claimId}/preview?t=${Date.now()}`, { cache: "no-store", headers: getAuthHeaders() });
    if (prevRes.ok) {
      const prevData = await prevRes.json();
      const statusStr = (prevData.status || "").toUpperCase();
      const hasSummary = Boolean(
        (prevData.parsed_fields && Object.keys(prevData.parsed_fields).length > 0) ||
        (prevData.summary && prevData.summary.patient_name && prevData.summary.patient_name !== "N/A")
      );
      if (statusStr === "COMPLETED" || statusStr === "VALIDATED" || hasSummary) {
        return { percentage: 100, step: "COMPLETED", status: "COMPLETED", is_complete: true };
      }
    }

    const res = await fetch(`${INGRESS_API}/claims/${claimId}/progress?t=${Date.now()}`, { cache: "no-store", headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      let pct = typeof data.percentage === "number" ? data.percentage : 0;
      const stepStr = (data.current_step || data.step || "").toUpperCase();
      const statusStr = (data.status || "").toUpperCase();
      const isComplete = Boolean(data.is_complete || statusStr === "COMPLETED" || statusStr === "VALIDATED" || statusStr === "FINISHED" || stepStr.includes("FINALIZE") || stepStr.includes("COMPLETED") || pct >= 95);

      if (isComplete) {
        return { percentage: 100, step: "COMPLETED", status: "COMPLETED", is_complete: true };
      }

      if (pct > 0) return { percentage: pct, step: stepStr, status: statusStr, is_complete: false };
      if (stepStr.includes("VALIDAT")) return { percentage: 92, step: "VALIDATION", status: "PROCESSING", is_complete: false };
      if (stepStr.includes("RISK")) return { percentage: 86, step: "RISK", status: "PROCESSING", is_complete: false };
      if (stepStr.includes("CODING")) return { percentage: 78, step: "CODING", status: "PROCESSING", is_complete: false };
      if (stepStr.includes("PARSING")) return { percentage: 55, step: "PARSING", status: "PROCESSING", is_complete: false };
      if (stepStr.includes("OCR")) return { percentage: 25, step: "OCR", status: "PROCESSING", is_complete: false };
    }
  } catch (err) {
    console.error("Progress fetch error:", err);
  }
  return { percentage: 15, step: "OCR", status: "PROCESSING", is_complete: false };
}

/**
 * Fetch full parsed preview report from the submission service
 */
export async function fetchClaimPreview(claimId: string): Promise<RealClaimPreview | null> {
  try {
    const res = await fetch(`${SUBMISSION_API}/claims/${claimId}/preview?t=${Date.now()}`, { cache: "no-store", headers: getAuthHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch claim preview:", err);
    return null;
  }
}

/**
 * Fetch most recently processed claim ID from backend
 */
export async function fetchLatestClaimId(): Promise<string | null> {
  try {
    const res = await fetch(`${INGRESS_API}/claims?limit=10&t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const claims = data.claims || data.results || (Array.isArray(data) ? data : []);
    if (claims.length > 0) {
      return claims[0].id || claims[0].claim_id || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch list of recent claims for the history selector dropdown/pills
 */
export async function fetchRecentClaims(): Promise<RecentClaimSummary[]> {
  try {
    const res = await fetch(`${INGRESS_API}/claims?limit=10&t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const claims = data.claims || data.results || (Array.isArray(data) ? data : []);
    return claims.map((c: any) => ({
      id: c.id || c.claim_id || "CLM-001",
      patient_name: c.patient_name || c.name || c.summary?.patient_name || "Claim Record",
      status: c.status || "COMPLETED",
      created_at: c.created_at || "Recent",
      total_amount: c.total_amount || c.amount || "",
    }));
  } catch {
    return [];
  }
}

/**
 * Delete a claim permanently from the Docker backend
 */
export async function deleteClaimApi(claimId: string): Promise<boolean> {
  try {
    const res = await fetch(`${INGRESS_API}/claims/${claimId}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to delete claim from backend:", err);
    return false;
  }
}

/**
 * Register/authenticate user in backend PostgreSQL database audit log
 */
export async function syncUserToBackend(name: string, email: string): Promise<void> {
  try {
    await fetch(`${INGRESS_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
  } catch (err) {
    console.warn("Backend user sync warning:", err);
  }
}

/**
 * Perform login check for user Swagath or default users
 */
export function authenticateUser(userOrEmail: string, pass: string): { success: boolean; user?: { name: string; email: string; role: string }; error?: string } {
  const cleanUser = userOrEmail.trim().toLowerCase();
  
  if (cleanUser.includes("swagath") || cleanUser === "swagath" || cleanUser === "swagath@example.com") {
    if (pass === "123455" || pass === "123456" || pass.length >= 4) {
      return {
        success: true,
        user: { name: "Swagath", email: "swagath@example.com", role: "patient" },
      };
    } else {
      return { success: false, error: "Invalid password for Swagath account." };
    }
  }

  if (cleanUser && pass) {
    return {
      success: true,
      user: { name: userOrEmail.split("@")[0] || "Patient", email: userOrEmail, role: "patient" },
    };
  }

  return { success: false, error: "Please enter your username/email and password." };
}
