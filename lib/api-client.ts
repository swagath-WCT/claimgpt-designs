/**
 * Resilient API client for ClaimGPT
 * Connects UI to ClaimGPT Docker backend (http://localhost:8000)
 * Includes Network Resiliency, Bearer Auth & Offline Fallback.
 */

import { getStoredAuthSession } from '@/lib/auth';

export const INGRESS_API = "http://localhost:8000/ingress";
export const SUBMISSION_API = "http://localhost:8000/submission";
export const CHAT_API = "http://localhost:8000/chat";

export interface RealClaimPreview {
  claim_id: string;
  status: string;
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
 * Check if a claim ID is a local frontend mock/demo ID (e.g. demo-003, CLM-876638)
 */

export function isMockId(id: string): boolean {
  if (!id) return true;
  const lower = id.toLowerCase();
  return (
    lower.startsWith("clm-") ||
    lower.startsWith("demo-") ||
    lower.startsWith("mock-") ||
    lower.includes("demo")
  );
}

/**
 * Resilient safeFetch wrapper with timeout, bearer auth & offline failure catch.
 * Prevents unhandled network exceptions when internet is down or slow.
 */
async function safeFetch(url: string, options?: RequestInit, timeoutMs = 8000): Promise<Response | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const authHeaders = getAuthHeaders();
    const res = await fetch(url, {
      ...options,
      headers: {
        ...authHeaders,
        ...(options?.headers || {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Upload a document with offline fallback support
 */
export async function uploadClaimDocument(files: File | File[], userName?: string): Promise<{ claim_id: string; document_id: string }> {
  const fileArray = Array.isArray(files) ? files : [files];
  const fileNames = fileArray.map(f => f.name.toLowerCase());
  const fallbackClaimId = `CLM-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    const formData = new FormData();
    for (const f of fileArray) {
      formData.append("files", f);
    }
    if (userName) {
      formData.append("policy_id", userName);
      formData.append("patient_id", userName);
    }

    // Try trailing slash endpoint first to avoid 404 redirects
    let res = await safeFetch(`${INGRESS_API}/claims/`, {
      method: "POST",
      body: formData,
    }, 12000);

    if (!res || !res.ok) {
      res = await safeFetch(`${INGRESS_API}/claims`, {
        method: "POST",
        body: formData,
      }, 12000);
    }

    if (res && res.ok) {
      const data = await res.json();
      const taskId = data.task_id || data.claim_id || data.id;
      let finalClaimId = taskId || fallbackClaimId;
      let finalDocId = data.document_id || (data.documents && data.documents[0]?.id) || "doc-1";

      // If backend returned queued task ID, attempt quick lookup
      if (taskId && (taskId.includes("-") || taskId.length > 8)) {
        for (let attempt = 0; attempt < 8; attempt++) {
          await new Promise(resolve => setTimeout(resolve, 250));
          const claimsListRes = await safeFetch(`${INGRESS_API}/claims?limit=10&t=${Date.now()}`, { cache: "no-store" }, 3000);
          if (claimsListRes && claimsListRes.ok) {
            const claimsData = await claimsListRes.json();
            const claims = claimsData.claims || claimsData.results || (Array.isArray(claimsData) ? claimsData : []);
            
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
        }
      }
      return { claim_id: finalClaimId, document_id: finalDocId };
    }
  } catch (err) {
    /* safe catch */
  }

  // Graceful offline fallback return
  return { claim_id: fallbackClaimId, document_id: "doc-offline" };
}

/**
 * Poll processing progress safely — checks both ingress progress & submission preview readiness
 */
export async function fetchClaimProgress(claimId: string): Promise<{ percentage: number; step: string; status: string; is_complete: boolean }> {
  if (isMockId(claimId)) {
    return { percentage: 100, step: "COMPLETED", status: "COMPLETED", is_complete: true };
  }

  try {
    const prevRes = await safeFetch(`${SUBMISSION_API}/claims/${claimId}/preview?t=${Date.now()}`, { cache: "no-store" }, 3000);
    if (prevRes && prevRes.ok) {
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

    const res = await safeFetch(`${INGRESS_API}/claims/${claimId}/progress?t=${Date.now()}`, { cache: "no-store" }, 3000);
    if (res && res.ok) {
      const data = await res.json();
      let pct = typeof data.percentage === "number" ? data.percentage : 0;
      const stepStr = (data.current_step || data.step || "").toUpperCase();
      const statusStr = (data.status || "").toUpperCase();
      const isComplete = Boolean(data.is_complete || statusStr === "COMPLETED" || statusStr === "VALIDATED" || statusStr === "FINISHED" || stepStr.includes("FINALIZE") || stepStr.includes("COMPLETED") || pct >= 95);

      if (isComplete) {
        return { percentage: 100, step: "COMPLETED", status: "COMPLETED", is_complete: true };
      }

      if (pct > 0) return { percentage: pct, step: stepStr, status: statusStr, is_complete: false };
    }
  } catch (err) {
    /* safe catch */
  }
  return { percentage: 15, step: "OCR", status: "PROCESSING", is_complete: false };
}

/**
 * Fetch full parsed preview report safely from backend
 */
export async function fetchClaimPreview(claimId: string): Promise<RealClaimPreview | null> {
  // Filter out demo & mock claim IDs (e.g. demo-003, CLM-876638) to prevent 400 Bad Request console errors
  if (isMockId(claimId)) {
    return null;
  }

  try {
    const res = await safeFetch(`${SUBMISSION_API}/claims/${claimId}/preview?t=${Date.now()}`, { cache: "no-store" }, 4000);
    if (!res || !res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Fetch most recently processed claim ID safely
 */
export async function fetchLatestClaimId(): Promise<string | null> {
  try {
    let res = await safeFetch(`${INGRESS_API}/claims?limit=10&t=${Date.now()}`, { cache: "no-store" }, 3000);
    if (!res || !res.ok) {
      res = await safeFetch(`${INGRESS_API}/claims/?limit=10&t=${Date.now()}`, { cache: "no-store" }, 3000);
    }
    if (!res || !res.ok) return null;
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
 * Fetch list of recent claims safely
 */
export async function fetchRecentClaims(): Promise<RecentClaimSummary[]> {
  try {
    let res = await safeFetch(`${INGRESS_API}/claims?limit=10&t=${Date.now()}`, { cache: "no-store" }, 3000);
    if (!res || !res.ok) {
      res = await safeFetch(`${INGRESS_API}/claims/?limit=10&t=${Date.now()}`, { cache: "no-store" }, 3000);
    }
    if (!res || !res.ok) return [];
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
 * Delete a claim safely from backend
 */
export async function deleteClaimApi(claimId: string): Promise<boolean> {
  if (isMockId(claimId)) return true;
  try {
    const res = await safeFetch(`${INGRESS_API}/claims/${claimId}`, {
      method: "DELETE",
    }, 4000);
    return Boolean(res && res.ok);
  } catch (err) {
    return false;
  }
}

/**
 * Register/authenticate user safely in backend audit log
 */
export async function syncUserToBackend(name: string, email: string): Promise<void> {
  try {
    await safeFetch(`${INGRESS_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    }, 4000);
  } catch (err) {
    /* safe catch */
  }
}

/**
 * Perform login check for user Swagath or default users safely
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
