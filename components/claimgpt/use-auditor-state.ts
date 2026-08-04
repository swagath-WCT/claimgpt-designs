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
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [edited, setEdited] = useState<Record<string, boolean>>({});

  /* Modal state for full report preview — default FALSE */
  const [showReportModal, setShowReportModal] = useState(false);

  /* File(s) pending analysis */
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  /* Real Backend State */
  const [claimId, setClaimId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [realPreview, setRealPreview] = useState<RealClaimPreview | null>(null);

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

  /* Select any previous claim from history list */
  const selectClaim = async (targetId: string) => {
    if (!targetId) return;
    setClaimId(targetId);
    setIsUploadOpen(false); // Auto-collapse upload dropdown when selecting old claims
    try {
      const prevData = await fetchClaimPreview(targetId);
      if (prevData) {
        setRealPreview(prevData);
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
      const res = await uploadClaimDocument(targetFiles);
      if (res.claim_id) {
        activeClaimId = res.claim_id;
        setClaimId(res.claim_id);

        // Try immediate prefetch for this claim ID
        const initialPreview = await fetchClaimPreview(res.claim_id);
        if (initialPreview) {
          setRealPreview(initialPreview);
        }
      }
    } catch (err) {
      console.warn("Backend API upload error:", err);
    } finally {
      setUploading(false);
    }

    runProgressSequence(activeClaimId);
  };

  /* Smooth 2.5-second progress sequence with background data sync */
  const runProgressSequence = (targetClaimId: string | null) => {
    let p = 15;

    // Start background polling for the active claim ID
    const pollInterval = setInterval(async () => {
      const idToQuery = targetClaimId || claimId;
      if (idToQuery) {
        try {
          const freshData = await fetchClaimPreview(idToQuery);
          if (freshData && (freshData.summary || freshData.parsed_fields)) {
            setRealPreview(freshData);
            setClaimId(idToQuery);
          }
        } catch {
          /* ignore poll error */
        }
      }
    }, 400);

    const timer = setInterval(async () => {
      p += 25;
      const currentPct = Math.min(p, 100);
      setProgress(currentPct);

      if (currentPct >= 85) setActiveStage('scoring');
      else if (currentPct >= 60) setActiveStage('coding');
      else if (currentPct >= 35) setActiveStage('parsing');
      else if (currentPct >= 15) setActiveStage('ocr');

      if (currentPct >= 100) {
        clearInterval(timer);
        clearInterval(pollInterval);
        setProgress(100);
        setActiveStage('scoring');
        setAnalyzing(false);
        setIsLiveSessionCompleted(true);

        // Final sync after Celery finishes writing to Postgres
        const fetchAndUpdate = async () => {
          try {
            await reloadRecentClaims();
            const idToQuery = targetClaimId || claimId || (await fetchLatestClaimId());
            if (idToQuery) {
              const prevData = await fetchClaimPreview(idToQuery);
              if (prevData) {
                setRealPreview(prevData);
                setClaimId(idToQuery);
              }
            }
          } catch {
            /* Ignore async prefetch error */
          }
        };

        fetchAndUpdate();
        setTimeout(fetchAndUpdate, 500);
        setTimeout(fetchAndUpdate, 1500);
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
    reloadRecentClaims,
  };
}

export type AuditorState = ReturnType<typeof useAuditorState>;

export { LINE_ITEMS, PIPELINE, formatINR };
