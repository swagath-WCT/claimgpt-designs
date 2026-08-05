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
  const [progress, setProgress] = useState(0);
  const [activeStage, setActiveStage] = useState<Stage>('staged');
  const [files, setFiles] = useState<{ name: string; size: string; type?: string }[]>([]);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [edited, setEdited] = useState<Record<string, boolean>>({});

  /* Modal state for full report preview — default FALSE */
  const [showReportModal, setShowReportModal] = useState(false);

  /* User Profile & Account Modal State */
  const [userName, setUserName] = useState<string>('Nivas');
  const [userEmail, setUserEmail] = useState<string>('nivas@example.com');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedName = localStorage.getItem('claimgpt_user_name');
      const savedEmail = localStorage.getItem('claimgpt_user_email');
      if (savedName) setUserName(savedName);
      if (savedEmail) setUserEmail(savedEmail);
    } catch {
      /* ignore localStorage error */
    }
  }, []);

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

  /* Helper to fetch list of past claims from backend */
  const reloadRecentClaims = async () => {
    try {
      const claims = await fetchRecentClaims();
      if (claims.length > 0) {
        setRecentClaims(claims);
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
    setRecentClaims((prev) => prev.filter((c) => c.id !== idToDelete));
    try {
      await deleteClaimApi(idToDelete);
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

  const patientName = extractedPatient || (analyzing ? "Processing..." : "Patient Record");
  const hospitalName = extractedHospital || (analyzing ? "Processing..." : "City Care Hospital");
  const admissionDate = extractedAdmission || (analyzing ? "Processing..." : "10/06/2026");
  const dischargeDate = extractedDischarge || (analyzing ? "Processing..." : "14/06/2026");
  const diagnosis = extractedDiagnosis || (analyzing ? "Processing..." : "Hospital Reimbursement Audit");

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
  };

  /* Direct upload & instant analysis */
  const handleUploadFile = async (fileInput: File | File[]) => {
    handleSelectFile(fileInput);
    const filesToUpload = Array.isArray(fileInput) ? fileInput : [fileInput];
    await startClaimAnalysis(filesToUpload);
  };

  /* Begin Claim Analysis action button */
  const startClaimAnalysis = async (overrideFiles?: File | File[]) => {
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
      const res = await uploadClaimDocument(targetFiles, userName);
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

    // Helper: fetch preview and update state if real data is present
    const tryFetchPreview = async (): Promise<boolean> => {
      const idToQuery = targetClaimId || (await fetchLatestClaimId());
      if (!idToQuery) return false;
      try {
        const freshData = await fetchClaimPreview(idToQuery);
        if (freshData) {
          const hasParsedFields = Boolean(freshData.parsed_fields && Object.keys(freshData.parsed_fields).length > 0);
          const hasSummaryFields = Boolean(
            freshData.summary && (
              (freshData.summary.patient_name && freshData.summary.patient_name !== "N/A") ||
              (freshData.summary.hospital && freshData.summary.hospital !== "N/A") ||
              (freshData.summary.diagnosis && freshData.summary.diagnosis !== "N/A")
            )
          );
          const statusStr = (freshData.status || "").toUpperCase();
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

    // Background polling — continues until real data arrives or 60s timeout
    const pollStartTime = Date.now();
    const pollInterval = setInterval(async () => {
      if (dataArrived) { clearInterval(pollInterval); return; }
      if (Date.now() - pollStartTime > 60000) { clearInterval(pollInterval); return; }
      const got = await tryFetchPreview();
      if (got) {
        dataArrived = true;
        clearInterval(pollInterval);
        setAnalyzing(false);
        setIsLiveSessionCompleted(true);
        reloadRecentClaims();
      }
    }, 1500);

    // Animated progress bar (purely visual, completes in ~2s)
    const timer = setInterval(() => {
      p += 25;
      const currentPct = Math.min(p, 100);
      setProgress(currentPct);

      if (currentPct >= 85) setActiveStage('scoring');
      else if (currentPct >= 60) setActiveStage('coding');
      else if (currentPct >= 35) setActiveStage('parsing');
      else if (currentPct >= 15) setActiveStage('ocr');

      if (currentPct >= 100) {
        clearInterval(timer);
        setProgress(100);
        setActiveStage('scoring');
        // NOTE: Do NOT set analyzing=false here.
        // The poll interval above will set it once real data arrives.
        // If data already arrived during animation, clean up.
        if (dataArrived) {
          clearInterval(pollInterval);
        }
      }
    }, 500);
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
    previewVersion,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    showProfileModal,
    setShowProfileModal,
    openProfileModal: () => setShowProfileModal(true),
    closeProfileModal: () => setShowProfileModal(false),
  };
}

export type AuditorState = ReturnType<typeof useAuditorState>;

export { LINE_ITEMS, PIPELINE, formatINR };
