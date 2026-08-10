import { useState, useEffect, useRef } from 'react';
import { LINE_ITEMS, formatINR } from '@/lib/claimgpt-data';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText, ShieldCheck, FileCheck, Stethoscope, FileSearch, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClaimDocumentPreview, INGRESS_API } from '@/lib/api-client';

interface DocumentViewerProps {
  zoom: number;
  setZoom: (z: number) => void;
  hoveredField: string | null;
  filename?: string;
  className?: string;
  dark?: boolean;
  documents?: ClaimDocumentPreview[];
  activeDocumentId?: string | null;
  onSelectDocument?: (docId: string) => void;
  onOpenDocModal?: () => void;
  claimId?: string | null;
}

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

const cleanFallback = 'original_claim_document.pdf';

const getDocIcon = (docType?: string | null) => {
  if (!docType) return FileText;
  if (docType.includes('discharge')) return ShieldCheck;
  if (docType.includes('bill')) return FileCheck;
  if (docType.includes('diagnostic') || docType.includes('lab')) return Stethoscope;
  return FileSearch;
};

function getBadgeColor(type: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('aadhaar') || t.includes('pan') || t.includes('identity')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (t.includes('discharge')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  if (t.includes('lab')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
}

export function DocumentViewer({
  zoom,
  setZoom,
  hoveredField,
  filename,
  className,
  dark = false,
  documents = [],
  activeDocumentId = null,
  onSelectDocument,
  onOpenDocModal,
  claimId,
}: DocumentViewerProps) {
  const getDocKey = (doc: ClaimDocumentPreview | undefined, index: number) =>
    doc?.document_id || doc?.id || `doc-${index}`;

  const hasActiveClaim = Boolean(claimId || (documents && documents.length > 0));
  const effectiveDocs: any[] = documents.length > 0
    ? documents
    : (hasActiveClaim ? [{
      document_id: 'doc_default',
      id: 'doc_default',
      original_filename: filename || cleanFallback,
      file_name: filename || cleanFallback,
      display_title: filename || cleanFallback,
      doc_type: 'hospital_bill',
      page_count: 1,
      pages: []
    }] : []);

  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    activeDocumentId || getDocKey(effectiveDocs[0], 0)
  );
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [imgError, setImgError] = useState<boolean>(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Serialize document IDs to avoid resetting tab selections during parent background polling ticks
  const serializedDocIds = effectiveDocs.map((d, index) => getDocKey(d, index)).join(',');

  // Sync selected document state when the list of document IDs actually changes
  useEffect(() => {
    setSelectedDocId(activeDocumentId || getDocKey(effectiveDocs[0], 0));
    setImgError(false);
    setPageIndex(0);
  }, [activeDocumentId, serializedDocIds]);

  const selectedKey = activeDocumentId || selectedDocId;
  const activeDoc = effectiveDocs.find((d, index) => getDocKey(d, index) === selectedKey) || effectiveDocs[0];
  const pageUrls = activeDoc?.pages || [];
  const currentPageUrl = pageUrls[pageIndex] ? `http://localhost:8000/ingress${pageUrls[pageIndex]}` : null;
  const pageCount = activeDoc?.page_count || pageUrls.length || 1;

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartDistRef = useRef<number>(0);
  const touchStartZoomRef = useRef<number>(1);

  // Mouse wheel zoom (Ctrl + Mouse Wheel) and trackpad pinch
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        const zoomStep = 0.08;
        const nextZoom = Math.max(0.5, Math.min(2.5, zoom + (delta > 0 ? zoomStep : -zoomStep)));
        setZoom(nextZoom);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [setZoom, zoom]);

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

  let displayTitle = activeDoc?.display_title || activeDoc?.original_filename || activeDoc?.file_name || cleanFallback;
  if (isUUID(displayTitle)) {
    displayTitle = 'Medical Claim Document';
  }

  let originalFileTag = activeDoc?.original_filename || activeDoc?.file_name || filename || 'uploaded_document.pdf';
  if (isUUID(originalFileTag)) {
    originalFileTag = 'original_claim_file.pdf';
  }

  // Fetch document bytes inline inside the tab
  useEffect(() => {
    let active = true;
    const isRealClaimId = claimId && claimId !== 'latest' && !claimId.startsWith('CLM-') && !claimId.startsWith('demo-') && claimId.length > 10;
    const activeDocId = activeDoc?.document_id || activeDoc?.id;

    // If no active claim or mock claim without real document, clear stale blobUrl and skip fetch
    if (!hasActiveClaim || (!isRealClaimId && !currentPageUrl && (!activeDocId || activeDocId === 'doc_default'))) {
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setLoading(false);
      setError(null);
      return;
    }

    let fileUrl = currentPageUrl || '';
    if (!fileUrl && isRealClaimId) {
      if (activeDocId && activeDocId !== 'doc_default') {
        fileUrl = `${INGRESS_API}/claims/${claimId}/documents/${activeDocId}/file?view=true`;
      } else {
        fileUrl = `${INGRESS_API}/claims/${claimId}/file?view=true`;
      }
    }

    if (!fileUrl) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(fileUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
          setError("Failed to render preview. Click 'Full Screen View' below to open the full modal.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [claimId, selectedDocId, currentPageUrl, documents]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, []);

  const handleDocChange = (docId: string) => {
    setSelectedDocId(docId);
    setPageIndex(0);
    setImgError(false);
    if (onSelectDocument) onSelectDocument(docId);
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Multi-Document Carousel Bar */}
      <div
        className={cn(
          'flex items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-thin',
          dark ? 'border-b border-white/10 bg-slate-900/80' : 'border-b border-slate-200 bg-slate-100/70'
        )}
      >
        <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Documents ({effectiveDocs.length}):</span>
        {effectiveDocs.map((doc, index) => {
          const docId = getDocKey(doc, index);
          const fileName = doc.original_filename || doc.file_name || 'Document';
          const isSelected = selectedKey === docId;
          const DocBadgeIcon = getDocIcon(doc.doc_type);
          let titleText = doc.display_title || fileName;
          if (isUUID(titleText)) titleText = 'Claim Document';

          return (
            <button
              key={docId}
              type="button"
              onClick={() => handleDocChange(docId)}
              data-doc-id={docId}
              data-selected-doc-id={selectedDocId}
              data-is-selected={isSelected ? "true" : "false"}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer whitespace-nowrap',
                isSelected
                  ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 shadow-sm ring-1 ring-teal-500/30 font-bold'
                  : dark
                    ? 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
              )}
            >
              <DocBadgeIcon className="h-3.5 w-3.5" />
              <span>{titleText}</span>
            </button>
          );
        })}
      </div>

      {/* PDF-like Control Toolbar for Page Image Viewer */}
      {currentPageUrl && !imgError && (
        <div
          className={cn(
            'flex items-center justify-between px-4 py-2 border-b text-xs select-none flex-none',
            dark ? 'border-white/10 bg-slate-900/60 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'
          )}
        >
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pageIndex <= 0}
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed',
                dark ? 'hover:bg-white/10' : 'hover:bg-slate-200'
              )}
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium">
              Page <span className={cn('px-2 py-0.5 rounded border font-mono mx-1', dark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900')}>{pageIndex + 1}</span> of {pageCount}
            </span>
            <button
              type="button"
              disabled={pageIndex >= pageCount - 1}
              onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed',
                dark ? 'hover:bg-white/10' : 'hover:bg-slate-200'
              )}
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
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                dark ? 'hover:bg-white/10' : 'hover:bg-slate-200'
              )}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="w-12 text-center font-mono font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(Math.min(2.5, zoom + 0.1))}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                dark ? 'hover:bg-white/10' : 'hover:bg-slate-200'
              )}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Document Preview Canvas */}
      <div
        className={cn(
          'w-full relative flex flex-col items-center justify-center border-t border-slate-200 dark:border-slate-800 overflow-hidden',
          dark ? 'bg-slate-950' : 'bg-slate-900'
        )}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-slate-400 p-12 w-full h-[550px] justify-center bg-slate-950">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
            <span className="text-xs font-medium">Loading document preview inline...</span>
          </div>
        ) : error && !currentPageUrl ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 m-6 max-w-md">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-200">
              <FileText className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-800">{displayTitle}</h4>
              <p className="text-xs text-slate-500 max-w-xs">{error}</p>
            </div>
            <button
              type="button"
              onClick={onOpenDocModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors cursor-pointer"
            >
              View Full Screen
            </button>
          </div>
        ) : currentPageUrl && !imgError ? (
          /* Custom Premium Image Viewer with Zoom Transform */
          <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full h-[580px] overflow-auto flex items-start justify-center p-4 scrollbar-thin"
          >
            <div
              className="transition-transform duration-200 origin-top"
              style={{ transform: `scale(${zoom})` }}
            >
              <img
                src={currentPageUrl}
                alt={displayTitle}
                onError={() => setImgError(true)}
                className="shadow-2xl border border-slate-300 dark:border-slate-800 rounded max-w-full h-auto bg-white"
                style={{ minWidth: '480px' }}
              />
            </div>
            {/* Quick full-screen preview button overlay */}
            <button
              type="button"
              onClick={onOpenDocModal}
              className="absolute bottom-4 right-4 bg-teal-600/90 backdrop-blur text-white rounded-full px-4 py-2 text-xs font-bold shadow-lg hover:bg-teal-700 transition-colors z-10 cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Full Screen View</span>
            </button>
          </div>
        ) : blobUrl ? (
          <div className="w-full relative">
            <iframe
              src={blobUrl}
              title={displayTitle}
              className="w-full h-[580px] border-0 bg-slate-900"
            />
            {/* Quick full-screen preview button overlay */}
            <button
              type="button"
              onClick={onOpenDocModal}
              className="absolute bottom-4 right-4 bg-teal-600 text-white rounded-full px-4 py-2 text-xs font-bold shadow-lg hover:bg-teal-700 transition-colors z-10 cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Full Screen View</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 w-full h-[580px] bg-slate-950 text-slate-100 border border-dashed border-slate-800/80 rounded-b-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 shadow-inner mb-1">
              <FileSearch className="h-8 w-8" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h4 className="font-bold text-base text-slate-100">No Claim Uploaded</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Please upload a claim document to check AI audit, OCR extraction, and verification.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
