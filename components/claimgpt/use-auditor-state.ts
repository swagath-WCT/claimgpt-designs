'use client';

import { useState, useEffect } from 'react';
import {
  LINE_ITEMS,
  PIPELINE,
  formatINR,
  type Stage,
  type LineItem,
} from '@/lib/claimgpt-data';
import {
  uploadClaimDocument,
  fetchClaimPreview,
  fetchLatestClaimId,
  fetchRecentClaims,
  deleteClaimApi,
  type RealClaimPreview,
  type RecentClaimSummary,
  SUBMISSION_API,
} from '@/lib/api-client';
import { getStoredAuthSession } from '@/lib/auth';

/* Utility function for robust smooth scrolling across all devices */
export function scrollToPipeline() {
  setTimeout(() => {
    const el = document.getElementById('pipeline-progress-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 150);
}

export function useAuditorState() {
  const getDocumentKey = (doc?: { document_id?: string; id?: string } | null) =>
    doc?.document_id || doc?.id || null;

  const getPreviewDocumentKeys = (preview: RealClaimPreview | null) =>
    (preview?.documents || [])
      .map((doc) => getDocumentKey(doc))
      .filter((docId): docId is string => Boolean(docId));

  const [progress, setProgress] = useState(0);
  const [activeStage, setActiveStage] = useState<Stage>('staged');
  const [files, setFiles] = useState<{ name: string; size: string; type?: string }[]>([]);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [edited, setEdited] = useState<Record<string, boolean>>({});
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  /* Modal state for full report preview — default FALSE */
  const [showReportModal, setShowReportModal] = useState(false);

  /* Modal state for in-app document preview — default FALSE */
  const [showDocModal, setShowDocModal] = useState(false);
  const openDocModal = () => setShowDocModal(true);
  const closeDocModal = () => setShowDocModal(false);

  /* User Profile & Account Modal State */
  const [userName, setUserName] = useState<string>('User');
  const [userEmail, setUserEmail] = useState<string>('user@example.com');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState<boolean>(false);

  const syncUserSession = () => {
    try {
      const session = getStoredAuthSession();
      if (session?.user) {
        if (session.user.name) setUserName(session.user.name);
        if (session.user.email) setUserEmail(session.user.email);
      } else {
        const savedName = localStorage.getItem('claimgpt_user_name');
        const savedEmail = localStorage.getItem('claimgpt_user_email');
        if (savedName) setUserName(savedName);
        if (savedEmail) setUserEmail(savedEmail);
      }
    } catch {
      /* ignore localStorage error */
    }
  };

  useEffect(() => {
    syncUserSession();
  }, []);

  const openProfileModal = () => {
    syncUserSession();
    setShowProfileModal(true);
  };

  const openMenuDrawer = () => {
    syncUserSession();
    setShowMenuDrawer(true);
  };

  /* File(s) pending analysis */
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  /* Real Backend State */
  const [claimId, setClaimId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [realPreview, setRealPreview] = useState<RealClaimPreview | null>(null);

  /* Incremented each time realPreview is set with real data — used as key for MetaField remount */
  const [previewVersion, setPreviewVersion] = useState(0);

  /* Collapsible Upload Dropdown Panel State — default FALSE when viewing active/history claim */
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const toggleUploadOpen = () => setIsUploadOpen((prev) => !prev);

  /* Controls whether top upload card displays completion state — default FALSE on page load */
  const [isLiveSessionCompleted, setIsLiveSessionCompleted] = useState(false);

  /* History list of past claims */
  const [recentClaims, setRecentClaims] = useState<RecentClaimSummary[]>([]);

  const [isDocumentsRequested, setIsDocumentsRequested] = useState(false);
  const [missingGroups, setMissingGroups] = useState<string[]>([]);

  const checkStatus = (preview: RealClaimPreview | null) => {
    if (!preview) {
      setIsDocumentsRequested(false);
      setMissingGroups([]);
      return;
    }

    if ((preview.status || "").toUpperCase() === "DOCUMENTS_REQUESTED") {
      setIsDocumentsRequested(true);
      const docs = preview.documents || [];
      const kyc_types = ["aadhaar_card", "pan_card", "identity_proof"];
      const clinical_types = ["discharge_summary", "lab_report"];
      const financial_types = ["hospital_bill", "pharmacy_bill"];

      const hasKyc = docs.some(d => kyc_types.includes((d.doc_type || "").toLowerCase()));
      const hasClinical = docs.some(d => clinical_types.includes((d.doc_type || "").toLowerCase()));
      const hasFinancial = docs.some(d => financial_types.includes((d.doc_type || "").toLowerCase()));

      const missing = [];
      if (!hasClinical && !hasFinancial) missing.push("Hospital Documents (Discharge Summary / Hospital Bill)");
      if (!hasKyc) missing.push("Identity / KYC Proof (Aadhaar / PAN / Passport)");
      setMissingGroups(missing);
    } else {
      setIsDocumentsRequested(false);
      setMissingGroups([]);
    }
  };

  useEffect(() => {
    checkStatus(realPreview);
  }, [realPreview]);

  useEffect(() => {
    const documentKeys = getPreviewDocumentKeys(realPreview);

    if (documentKeys.length === 0) {
      setActiveDocumentId(null);
      return;
    }

    setActiveDocumentId((current) => (current && documentKeys.includes(current) ? current : documentKeys[0]));
  }, [realPreview?.claim_id, realPreview?.documents]);

  /* Helper to fetch list of past claims from backend */
  const reloadRecentClaims = async () => {
    try {
      const claims = await fetchRecentClaims();
      setRecentClaims(claims);
      if (claims.length === 0) {
        setClaimId(null);
        setRealPreview(null);
        setFiles([]);
        setProgress(0);
        setActiveStage('staged');
        setIsLiveSessionCompleted(false);
        setActiveDocumentId(null);
        setHoveredField(null);
      }
    } catch (err) {
      console.warn("Failed to load recent claims list:", err);
    }
  };

  /* On mount: load latest claim data for auditor workspace & recent claims list */
  useEffect(() => {
    async function loadInitial() {
      try {
        await reloadRecentClaims();
        const latestId = await fetchLatestClaimId();
        if (latestId) {
          const prevData = await fetchClaimPreview(latestId);
          if (prevData) {
            setClaimId(latestId);
            setRealPreview(prevData);
            setPreviewVersion((v) => v + 1);
            setProgress(100);
            setActiveStage('scoring');
            setIsLiveSessionCompleted(false);
            setIsUploadOpen(false); // Collapse upload panel so workspace & pipeline sit at top
          }
        } else {
          setClaimId(null);
          setRealPreview(null);
          setFiles([]);
          setProgress(0);
          setActiveStage('staged');
        }
      } catch (err) {
        console.warn("Could not load initial claim data on mount:", err);
      }
    }
    loadInitial();
  }, []);

  /* Remove a claim from local UI state and delete it from Docker backend */
  const deleteClaim = async (idToDelete: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const remaining = recentClaims.filter((c) => c.id !== idToDelete);
    setRecentClaims(remaining);

    // If deleting the currently active claim or all claims are deleted
    if (idToDelete === claimId || remaining.length === 0) {
      if (remaining.length > 0) {
        // Automatically switch to the next available claim
        selectClaim(remaining[0].id);
      } else {
        // All claims deleted — reset workspace to clean empty state!
        setClaimId(null);
        setRealPreview(null);
        setFiles([]);
        setProgress(0);
        setActiveStage('staged');
        setIsLiveSessionCompleted(false);
        setActiveDocumentId(null);
        setHoveredField(null);
      }
    }

    try {
      await deleteClaimApi(idToDelete);
      const remainingClaims = await fetchRecentClaims();
      setRecentClaims(remainingClaims);
      if (remainingClaims.length === 0) {
        setClaimId(null);
        setRealPreview(null);
        setFiles([]);
        setProgress(0);
        setActiveStage('staged');
        setIsLiveSessionCompleted(false);
        setActiveDocumentId(null);
        setHoveredField(null);
      }
    } catch (err) {
      console.warn("Backend deletion error:", err);
    }
  };

  /* Select any previous claim from history list */
  const selectClaim = async (targetId: string) => {
    if (!targetId) return;
    setClaimId(targetId);
    setIsUploadOpen(false); // Auto-collapse upload dropdown when selecting old claims
    setEdited({}); // Reset edit badges from previous claim
    setRealPreview(null); // Clear stale preview immediately
    try {
      const prevData = await fetchClaimPreview(targetId);
      if (prevData) {
        setRealPreview(prevData);
        setPreviewVersion((v) => v + 1);
        setProgress(100);
        setActiveStage('scoring');
        setIsLiveSessionCompleted(false);
      }
    } catch (err) {
      console.warn("Failed to select claim preview:", err);
    }
  };

  /* Auto-scroll smoothly to Pipeline Progress Card whenever analysis starts */
  useEffect(() => {
    if (analyzing) {
      scrollToPipeline();
    }
  }, [analyzing]);

  /* Dynamically extracted metadata fields from backend preview */
  const extractedPatient = realPreview?.summary?.patient_name && realPreview.summary.patient_name !== "N/A"
    ? realPreview.summary.patient_name
    : realPreview?.parsed_fields?.patient_name || realPreview?.parsed_fields?.member_name || realPreview?.parsed_fields?.insured_name;

  const extractedHospital = realPreview?.summary?.hospital && realPreview.summary.hospital !== "N/A"
    ? realPreview.summary.hospital
    : realPreview?.parsed_fields?.hospital_name || realPreview?.parsed_fields?.hospital;

  const extractedAdmission = realPreview?.summary?.admission_date && realPreview.summary.admission_date !== "N/A"
    ? realPreview.summary.admission_date
    : realPreview?.parsed_fields?.admission_date || realPreview?.parsed_fields?.service_date;

  const extractedDischarge = realPreview?.summary?.discharge_date && realPreview.summary.discharge_date !== "N/A"
    ? realPreview.summary.discharge_date
    : realPreview?.parsed_fields?.discharge_date;

  const extractedDiagnosis = realPreview?.summary?.diagnosis && realPreview.summary.diagnosis !== "N/A"
    ? realPreview.summary.diagnosis
    : realPreview?.parsed_fields?.diagnosis || realPreview?.parsed_fields?.primary_diagnosis;

  const hasClaim = Boolean(claimId || realPreview);
  const patientName = extractedPatient || (analyzing ? "Processing..." : (hasClaim ? "Patient Record" : ""));
  const hospitalName = extractedHospital || (analyzing ? "Processing..." : (hasClaim ? "City Care Hospital" : ""));
  const admissionDate = extractedAdmission || (analyzing ? "Processing..." : (hasClaim ? "10/06/2026" : ""));
  const dischargeDate = extractedDischarge || (analyzing ? "Processing..." : (hasClaim ? "14/06/2026" : ""));
  const diagnosis = extractedDiagnosis || (analyzing ? "Processing..." : (hasClaim ? "Hospital Reimbursement Audit" : ""));

  /* Select file(s) without immediately analyzing — appends new files to pending list */
  const handleSelectFile = (input: any) => {
    let incoming: File[] = [];

    if (input && typeof input === "object" && "target" in input && input.target && (input.target as HTMLInputElement).files) {
      incoming = Array.from((input.target as HTMLInputElement).files || []);
    } else if (input && typeof input === "object" && "dataTransfer" in input && input.dataTransfer && input.dataTransfer.files) {
      incoming = Array.from(input.dataTransfer.files);
    } else if (Array.isArray(input)) {
      incoming = input;
    } else if (input instanceof File) {
      incoming = [input];
    } else if (input && typeof input === "object" && "length" in input) {
      incoming = Array.from(input as ArrayLike<File>);
    }

    if (incoming.length === 0) return;

    setPendingFiles((prev) => [...prev, ...incoming]);
    setFiles((prev) => [
      ...prev,
      ...incoming.map((f) => ({
        name: f.name,
        size: f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`,
        type: f.type || (f.name.endsWith('.pdf') ? 'application/pdf' : 'image/png')
      })),
    ]);

    if (input && typeof input === "object" && "target" in input && input.target) {
      (input.target as HTMLInputElement).value = '';
    }
  };

  /* Remove individual attached file */
  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* Reset upload state for new claim */
  const resetState = () => {
    setPendingFiles([]);
    setFiles([]);
    setAnalyzing(false);
    setUploading(false);
    setIsLiveSessionCompleted(false);
    setIsUploadOpen(true);
    setActiveDocumentId(null);
  };

  /* Direct upload & instant analysis */
  const handleUploadFile = async (fileInput: File | File[], appendToActive = false) => {
    handleSelectFile(fileInput);
    const filesToUpload = Array.isArray(fileInput) ? fileInput : [fileInput];
    await startClaimAnalysis(filesToUpload, appendToActive);
  };

  /* Begin Claim Analysis action button */
  const startClaimAnalysis = async (overrideFiles?: File | File[], appendToActive = false) => {
    let targetFiles: File[] = [];
    if (overrideFiles) {
      targetFiles = Array.isArray(overrideFiles) ? overrideFiles : [overrideFiles];
    } else {
      targetFiles = pendingFiles;
    }

    if (targetFiles.length === 0) return;

    setAnalyzing(true);
    setUploading(true);
    setShowReportModal(false);
    setIsLiveSessionCompleted(false);
    setIsUploadOpen(true); // Keep open during analysis to show circular progress
    setActiveStage('ocr');
    setProgress(15);

    scrollToPipeline();

    let activeClaimId: string | null = null;
    try {
      const res = await uploadClaimDocument(targetFiles, userName, (appendToActive && claimId) ? claimId : undefined);
      if (res.claim_id) {
        activeClaimId = res.claim_id;
        setClaimId(res.claim_id);

        // Try immediate prefetch for this claim ID
        const initialPreview = await fetchClaimPreview(res.claim_id);
        if (initialPreview) {
          setRealPreview(initialPreview);
          setPreviewVersion((v) => v + 1);
        }
      }
    } catch (err) {
      console.warn("Backend API upload error:", err);
    } finally {
      setUploading(false);
    }

    runProgressSequence(activeClaimId);
  };

  /* Progress animation + background data sync that keeps polling until real data arrives */
  const runProgressSequence = (targetClaimId: string | null) => {
    let p = 15;
    let dataArrived = false;
    let timer: NodeJS.Timeout;

    // Helper: fetch preview and update state if real data is present
    const tryFetchPreview = async (): Promise<boolean> => {
      const idToQuery = targetClaimId || (await fetchLatestClaimId());
      if (!idToQuery) return false;
      try {
        const freshData = await fetchClaimPreview(idToQuery);
        if (freshData) {
          const statusStr = (freshData.status || "").toUpperCase();
          if (statusStr === "DOCUMENTS_REQUESTED" || statusStr === "MANUAL_REVIEW_REQUIRED") {
            setRealPreview(freshData);
            setPreviewVersion((v) => v + 1);
            setClaimId(idToQuery);
            clearInterval(timer);
            setAnalyzing(false);
            setIsLiveSessionCompleted(false);
            setProgress(100);
            setActiveStage('scoring');
            return true;
          }

          const hasParsedFields = Boolean(freshData.parsed_fields && Object.keys(freshData.parsed_fields).length > 0);
          const hasSummaryFields = Boolean(
            freshData.summary && (
              (freshData.summary.patient_name && freshData.summary.patient_name !== "N/A") ||
              (freshData.summary.hospital && freshData.summary.hospital !== "N/A") ||
              (freshData.summary.diagnosis && freshData.summary.diagnosis !== "N/A")
            )
          );
          const isDoneStatus = statusStr === "COMPLETED" || statusStr === "VALIDATED";

          if (hasParsedFields || hasSummaryFields || isDoneStatus) {
            setRealPreview(freshData);
            setPreviewVersion((v) => v + 1);
            setClaimId(idToQuery);
            return true;
          }
        }
      } catch {
        /* ignore poll error */
      }
      return false;
    };

    const finishProgress = () => {
      if (dataArrived) return;
      dataArrived = true;
      clearInterval(pollInterval);
      clearInterval(timer);
      setProgress(100);
      setActiveStage('scoring');
      setAnalyzing(false);
      setIsLiveSessionCompleted(true);
      reloadRecentClaims();
    };

    // Background polling — continues every 600ms until Celery finishes OCR & LLM extraction
    const pollStartTime = Date.now();
    const pollInterval = setInterval(async () => {
      if (dataArrived) { clearInterval(pollInterval); return; }
      if (Date.now() - pollStartTime > 60000) {
        finishProgress();
        return;
      }
      const got = await tryFetchPreview();
      if (got) {
        finishProgress();
      }
    }, 600);

    // Animated progress bar — advances up to 92% and holds until backend finishes
    timer = setInterval(() => {
      if (dataArrived) {
        clearInterval(timer);
        return;
      }
      if (p < 92) {
        p += 15;
        const currentPct = Math.min(p, 92);
        setProgress(currentPct);

        if (currentPct >= 85) setActiveStage('scoring');
        else if (currentPct >= 60) setActiveStage('coding');
        else if (currentPct >= 35) setActiveStage('parsing');
        else if (currentPct >= 15) setActiveStage('ocr');
      }
    }, 400);
  };

  /* Manually open report modal and fetch selected or latest claim preview directly from backend */
  const openReportModal = async () => {
    try {
      const idToQuery = claimId || (await fetchLatestClaimId());
      if (idToQuery) {
        const prevData = await fetchClaimPreview(idToQuery);
        if (prevData) {
          setRealPreview(prevData);
          setPreviewVersion((v) => v + 1);
          setClaimId(idToQuery);
        }
      }
    } catch (err) {
      console.warn("Failed to load report modal preview:", err);
    }
    setShowReportModal(true);
  };

  /* Computed items & total */
  const lineItems: LineItem[] = realPreview?.expenses?.length
    ? realPreview.expenses.map((exp, idx) => ({
      id: `exp-${idx}`,
      category: exp.category || "Expense",
      description: exp.description || exp.category,
      amount: exp.amount || 0,
      box: { x: 8, y: 30 + idx * 10, w: 84, h: 7 },
    }))
    : LINE_ITEMS;

  const total = lineItems.reduce((sum, i) => sum + i.amount, 0);
  const stageIndex = PIPELINE.findIndex((s) => s.key === activeStage);

  const markEdited = (key: string) =>
    setEdited((e) => (e[key] ? e : { ...e, [key]: true }));

  /* PDF Report URLs */
  const tpaPdfUrl = claimId ? `${SUBMISSION_API}/claims/${claimId}/tpa-pdf` : null;
  const irdaPdfUrl = claimId ? `${SUBMISSION_API}/claims/${claimId}/irda-pdf` : null;
  const tpaPdfViewUrl = claimId ? `${SUBMISSION_API}/claims/${claimId}/tpa-pdf?view=true` : null;
  const irdaPdfViewUrl = claimId ? `${SUBMISSION_API}/claims/${claimId}/irda-pdf?view=true` : null;

  return {
    progress,
    setProgress,
    resetState,
    activeStage,
    setActiveStage,
    files,
    removeFile,
    hoveredField,
    setHoveredField,
    zoom,
    setZoom,
    edited,
    markEdited,
    activeDocumentId,
    setActiveDocumentId,
    total,
    stageIndex,
    lineItems,
    /* Real Backend Extensions */
    claimId,
    uploading,
    analyzing,
    isUploadOpen,
    setIsUploadOpen,
    toggleUploadOpen,
    isLiveSessionCompleted,
    handleSelectFile,
    handleUploadFile,
    startClaimAnalysis,
    realPreview,
    showReportModal,
    setShowReportModal,
    openReportModal,
    closeReportModal: () => setShowReportModal(false),
    showDocModal,
    setShowDocModal,
    openDocModal,
    closeDocModal,
    patientName,
    hospitalName,
    admissionDate,
    dischargeDate,
    diagnosis,
    tpaPdfUrl,
    irdaPdfUrl,
    tpaPdfViewUrl,
    irdaPdfViewUrl,
    recentClaims,
    selectClaim,
    deleteClaim,
    reloadRecentClaims,
    isDocumentsRequested,
    missingGroups,
    previewVersion,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    showProfileModal,
    setShowProfileModal,
    openProfileModal: () => setShowProfileModal(true),
    closeProfileModal: () => setShowProfileModal(false),
    showMenuDrawer,
    setShowMenuDrawer,
    openMenuDrawer: () => setShowMenuDrawer(true),
    closeMenuDrawer: () => setShowMenuDrawer(false),
  };
}

export type AuditorState = ReturnType<typeof useAuditorState>;

export { LINE_ITEMS, PIPELINE, formatINR };
