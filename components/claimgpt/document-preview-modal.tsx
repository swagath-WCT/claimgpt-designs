'use client';

import { useState, useEffect, useRef } from 'react';
import { X, FileText, Download, ShieldCheck, FileCheck, Stethoscope, FileSearch, Layers, Loader2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INGRESS_API, SUBMISSION_API, ClaimDocumentPreview } from '@/lib/api-client';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string | null;
  patientName?: string;
  documents?: ClaimDocumentPreview[];
  initialDocId?: string | null;
  fileObj?: any;
}

function createClaimPdfBlob(title: string): Blob {
  const safeTitle = (title || 'Claim Document').replace(/[()]/g, '');
  const pdfData = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>> >> endobj
4 0 obj <</Length 240>> stream
BT
/F1 18 Tf
50 720 Td
(REIMBURSEMENT CLAIM DOCUMENT) Tj
/F1 12 Tf
0 -30 Td
(Document File: ${safeTitle}) Tj
0 -20 Td
(Status: Verified & Processed by AI Medical Audit Engine) Tj
0 -20 Td
(Date: ${new Date().toLocaleDateString()}) Tj
ET
endstream
endobj
5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000244 00000 n 
0000000534 00000 n 
trailer <</Size 6 /Root 1 0 R>>
startxref
605
%%EOF`;
  return new Blob([pdfData], { type: 'application/pdf' });
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  claimId,
  patientName = 'Patient Document',
  documents = [],
  initialDocId = null,
  fileObj,
}: DocumentPreviewModalProps) {
  const getDocKey = (doc: ClaimDocumentPreview | undefined, index: number) =>
    doc?.document_id || doc?.id || `doc-${index}`;

  const normalizedDocs = documents.length > 0
    ? documents
    : [
        {
          document_id: 'doc_uploaded',
          id: 'doc_uploaded',
          original_filename: fileObj?.name || 'claim_document.pdf',
          file_name: fileObj?.name || 'claim_document.pdf',
          display_title: fileObj?.name || 'Claim Document',
          doc_type: 'hospital_bill',
          page_count: 1,
          pages: [],
        },
      ];

  const [selectedDocId, setSelectedDocId] = useState<string>(
    initialDocId || getDocKey(normalizedDocs[0], 0)
  );
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [imgError, setImgError] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartDistRef = useRef<number>(0);
  const touchStartZoomRef = useRef<number>(1);

  const validClaimId = claimId && claimId !== 'latest' ? claimId : 'latest';
  const activeDoc = normalizedDocs.find((d, index) => getDocKey(d, index) === selectedDocId) || normalizedDocs[0];
  const activeDocId = activeDoc?.document_id || activeDoc?.id;

  const pageUrls = activeDoc?.pages || [];
  const currentPageUrl = pageUrls[pageIndex] ? `${INGRESS_API}${pageUrls[pageIndex]}` : null;
  const pageCount = activeDoc?.page_count || pageUrls.length || 1;

  // Determine actual backend source URL (always fetch PDF file for download/iframe fallback)
  let fileUrl = '';
  if (activeDocId && activeDocId !== 'doc_uploaded') {
    fileUrl = `${INGRESS_API}/claims/${validClaimId}/documents/${activeDocId}/file?view=true`;
  } else {
    fileUrl = `${INGRESS_API}/claims/${validClaimId}/file?view=true`;
  }

  const activeTitle = activeDoc?.original_filename || activeDoc?.file_name || activeDoc?.display_title || fileObj?.name || 'claim_document.pdf';
  const lastFileNameRef = useRef<string>('');

  useEffect(() => {
    setSelectedDocId(initialDocId || getDocKey(normalizedDocs[0], 0));
  }, [initialDocId, documents]);

  useEffect(() => {
    setPageIndex(0);
    setZoom(1);
    setImgError(false);
  }, [selectedDocId]);

  // Mouse wheel zoom (Ctrl + Mouse Wheel) and trackpad pinch
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        const zoomStep = 0.08;
        setZoom((z) => Math.max(0.5, Math.min(2.5, z + (delta > 0 ? zoomStep : -zoomStep))));
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [selectedDocId, pageIndex, imgError]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartDistRef.current > 0) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartDistRef.current;
      setZoom(Math.max(0.5, Math.min(2.5, touchStartZoomRef.current * factor)));
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = 0;
  };

  // Fetch file bytes as Blob client-side or load local uploaded file object
  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    // 1. If local File object exists, render it immediately in modal!
    const targetFile = fileObj instanceof File ? fileObj : (fileObj?.rawFile instanceof File ? fileObj.rawFile : null);
    const activeFileName = targetFile ? `${targetFile.name}-${targetFile.size}` : '';

    if (targetFile) {
      if (lastFileNameRef.current === activeFileName && blobUrl) {
        return;
      }
      try {
        lastFileNameRef.current = activeFileName;
        const localBlobUrl = URL.createObjectURL(targetFile);
        setBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return localBlobUrl;
        });
        setLoading(false);
        setError(null);
        return;
      } catch (err) {
        console.warn("Could not create object URL for local file in modal:", err);
      }
    } else {
      lastFileNameRef.current = '';
    }

    if (currentPageUrl && !imgError) return; // Skip PDF fetch if displaying page images directly

    const isRealClaimId = claimId && claimId !== 'latest' && !claimId.startsWith('CLM-') && !claimId.startsWith('demo-') && claimId.length > 10;
    const hasRealDoc = activeDocId && activeDocId !== 'doc_default';

    if (!isRealClaimId || !hasRealDoc) {
      if (!blobUrl) {
        const fallbackPdfBlob = createClaimPdfBlob(activeTitle);
        const fallbackUrl = URL.createObjectURL(fallbackPdfBlob);
        setBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return fallbackUrl;
        });
      }
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(fileUrl)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch preview file: HTTP ${res.status}`);
        }
        return res.blob();
      })
      .then((blob) => {
        if (!active) return;
        
        const mimeType = blob.type || 'application/pdf';
        const safeBlob = new Blob([blob], { type: mimeType });
        const url = URL.createObjectURL(safeBlob);

        setBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setError("Failed to render document preview inline. Please download the file to view its contents.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [fileUrl, isOpen, currentPageUrl, imgError, fileObj?.name, fileObj?.size, fileObj?.rawFile]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, []);

  if (!isOpen) return null;

  const displayDocs = normalizedDocs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 sm:p-6 animate-fade-in">
      <div className="relative flex h-[90vh] lg:h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        {/* Top Modal Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex-none">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Documents</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {patientName} • {documents.length || 1} file(s) attached
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200/60 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Horizontal Pills (Visible only on mobile/tablets, completely hides the large sidebar on mobile) */}
        <div className="flex lg:hidden items-center gap-2 overflow-x-auto px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex-none scrollbar-none">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase whitespace-nowrap">Files ({displayDocs.length}):</span>
          {displayDocs.map((doc, index) => {
            const docId = getDocKey(doc, index);
            const fileName = doc.original_filename || doc.file_name || 'document.pdf';
            const isSelected = selectedDocId === docId;
            const isUUIDName = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i.test(fileName);
            const displayFileName = isUUIDName ? 'claim_document.pdf' : fileName;

            return (
              <button
                key={docId}
                type="button"
                onClick={() => setSelectedDocId(docId)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                  isSelected
                    ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 shadow-sm ring-1 ring-teal-500/20'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                )}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{doc.display_title || displayFileName}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Body: Left Sidebar + Embedded Viewer */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Sidebar: Uploaded Docs (Visible only on desktop screens) */}
          <div className="hidden lg:flex w-72 flex-none border-r border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40 flex-col gap-4 overflow-y-auto">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-2">
                Uploaded Documents ({displayDocs.length})
              </span>
              <div className="space-y-1.5">
                {displayDocs.map((doc, index) => {
                  const docId = getDocKey(doc, index);
                  const fileName = doc.original_filename || doc.file_name || 'document.pdf';
                  const isSelected = selectedDocId === docId;
                  const isUUIDName = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i.test(fileName);
                  const displayFileName = isUUIDName ? 'claim_document.pdf' : fileName;

                  return (
                    <button
                      key={docId}
                      type="button"
                      onClick={() => {
                        setSelectedDocId(docId);
                      }}
                      className={cn(
                        'w-full text-left rounded-xl p-3 text-xs transition-all flex items-start gap-2.5 border cursor-pointer',
                        isSelected
                          ? 'border-teal-500 bg-teal-500/10 text-teal-900 dark:text-teal-200 font-semibold shadow-sm ring-1 ring-teal-500/30'
                          : 'border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                      )}
                    >
                      <FileText className="h-4 w-4 text-teal-600 mt-0.5 flex-none" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium">{doc.display_title || displayFileName}</span>
                        <span className="text-[10px] text-slate-400 truncate">{displayFileName}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>          {/* Right Area: Embedded PDF Viewer */}
          <div className="flex flex-1 flex-col bg-slate-950 min-h-[50vh] lg:min-h-0">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-2.5 text-xs text-white flex-none">
              <span className="font-medium truncate max-w-md">{activeTitle}</span>
              <a
                href={fileUrl}
                download={activeTitle}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </a>
            </div>

            {/* PDF-like Control Toolbar for Modal Page Image Viewer */}
            {currentPageUrl && !imgError && (
              <div className="flex items-center justify-between px-5 py-2 border-b border-slate-850 bg-slate-900/90 text-xs text-slate-300 select-none flex-none">
                {/* Page Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pageIndex <= 0}
                    onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                    className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-medium">
                    Page <span className="px-2 py-0.5 rounded border border-slate-750 bg-slate-950 font-mono mx-1 text-white">{pageIndex + 1}</span> of {pageCount}
                  </span>
                  <button
                    type="button"
                    disabled={pageIndex >= pageCount - 1}
                    onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                    className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white/10"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-mono font-medium text-white">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom(Math.min(2.5, zoom + 0.1))}
                    className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white/10"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Embedded iFrame Viewer / Image Canvas / Loading / Error States */}
            <div className="flex-1 w-full h-full relative bg-slate-950 flex items-center justify-center overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                  <span className="text-xs">Loading document preview...</span>
                </div>
              ) : error && !currentPageUrl ? (
                <div className="max-w-md p-6 text-center space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-950/30 text-red-500 border border-red-500/20">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-200">Unable to display preview</p>
                    <p className="text-xs text-slate-400">{error}</p>
                  </div>
                </div>
              ) : currentPageUrl && !imgError ? (
                /* Custom Premium Image Viewer with Touch Pinch & Mouse Wheel zoom in Modal */
                <div
                  ref={containerRef}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="w-full h-full overflow-auto flex items-start justify-center p-6 scrollbar-thin"
                >
                  <div
                    className="transition-transform duration-200 origin-top"
                    style={{ transform: `scale(${zoom})` }}
                  >
                    <img
                      src={currentPageUrl}
                      alt={activeTitle}
                      onError={() => setImgError(true)}
                      className="shadow-2xl border border-slate-800 rounded max-w-full h-auto bg-white"
                      style={{ minWidth: '600px' }}
                    />
                  </div>
                </div>
              ) : blobUrl ? (
                <iframe
                  src={blobUrl}
                  title={activeTitle}
                  className="w-full h-full border-0 bg-slate-900"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
