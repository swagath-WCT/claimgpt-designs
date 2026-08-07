'use client';

import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Folder,
  Image as ImageIcon,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Crown,
  X,
  Menu,
  Loader2,
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/claimgpt/language-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DocumentViewer } from '@/components/claimgpt/document-viewer';
import { ClaimReportModal } from '@/components/claimgpt/claim-report-modal';
import { DocumentPreviewModal } from '@/components/claimgpt/document-preview-modal';
import { UserProfileModal } from '@/components/claimgpt/user-profile-modal';
import { HamburgerMenuDrawer } from '@/components/claimgpt/hamburger-menu-drawer';
import { NotificationBell } from '@/components/claimgpt/notification-bell';
import {
  LINE_ITEMS,
  PIPELINE,
  formatINR,
  useAuditorState,
} from '@/components/claimgpt/use-auditor-state';
import {
  CountUp,
  StaggerContainer,
  StaggerItem,
} from '@/components/claimgpt/effects';
import { cn } from '@/lib/utils';

export function DashboardLedger() {
  const s = useAuditorState();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#060b18] text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Background Champagne Gold & Royal Midnight Navy Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-1/3 h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-amber-600/10 blur-[150px]" />
      </div>

      {/* Header — Luxury Executive Royal Navy & Gold */}
      <header className="relative z-40 sticky top-0 border-b border-amber-500/20 bg-[#060b18]/85 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-2 px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <button
              type="button"
              onClick={s.openMenuDrawer}
              className="flex h-8 sm:h-9 w-8 sm:w-9 flex-none items-center justify-center rounded-xl border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 hover:text-white transition-colors"
              aria-label="Open Navigation Menu"
              title="Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex h-8 sm:h-9 w-8 sm:w-9 flex-none items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 border border-amber-400/40">
              <Crown className="h-4 sm:h-5 w-4 sm:w-5 fill-slate-950" />
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
              <span className="font-display text-base sm:text-lg font-bold tracking-tight text-white flex-none">ClaimGPT</span>
              <span className="rounded-full bg-amber-500/20 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-amber-300 border border-amber-500/30 uppercase tracking-wider whitespace-nowrap flex-none">
                <span className="hidden sm:inline">Executive Gold</span>
                <span className="sm:hidden">Executive</span>
              </span>
            </div>
          </div>
          <div className="relative ml-4 hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
            <Input placeholder="Search claims, hospital bills, ICD-10 codes…" className="h-10 border-amber-500/25 bg-amber-950/20 pl-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400" />
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 sm:inline-flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
              </span>
              Processing Queue: <CountUp end={3} />
            </span>
            <LanguageSwitcher variant="dark" />
            <NotificationBell variant="executive" />
            <Avatar onClick={s.openProfileModal} title={`${s.userName} (${s.userEmail})`} className="h-9 w-9 border border-amber-500/40 cursor-pointer hover:scale-105 transition-transform" aria-label="User Profile">
              <AvatarFallback className="bg-gradient-to-tr from-amber-500 to-amber-600 text-xs font-extrabold text-slate-950">{s.userName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <StaggerContainer className="mx-auto max-w-7xl space-y-6 pb-24">
          <StaggerItem index={0}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Patient Claim Reimbursement Portal
                </h1>
                <p className="mt-1 text-sm text-amber-200/70">Upload hospital bills, discharge summaries &amp; diagnostic reports for AI-powered verification &amp; settlement.</p>
              </div>
            </div>
          </StaggerItem>

          {/* Responsive Desktop & Mobile Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:items-start">

            {/* Desktop Left Sidebar: Processed Claims History */}
            <StaggerItem index={1} className="hidden lg:block lg:col-span-1">
              <div className="rounded-2xl border border-amber-500/25 bg-[#0a1226]/90 p-4 shadow-xl shadow-amber-500/5 backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Processed Claims</h3>
                      <p className="text-[10px] text-amber-300/70">Select claim to audit</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/30">
                    {s.recentClaims.length || 1}
                  </span>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[720px] pr-1 scrollbar-thin">
                  {s.recentClaims.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => s.selectClaim(s.claimId || "")}
                      className="w-full rounded-xl border border-amber-400/50 bg-amber-500/20 p-3 text-left shadow-sm text-white"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold truncate text-white">{s.patientName}</p>
                        <span className="flex h-2 w-2 rounded-full bg-amber-400 flex-none shadow-sm shadow-amber-400" />
                      </div>
                      <p className="text-[10px] text-amber-300/70 mt-1 truncate">
                        ID: {s.claimId ? `${s.claimId.slice(0, 8)}...` : "Active Claim"}
                      </p>
                    </button>
                  ) : (
                    s.recentClaims.map((claim) => {
                      const isSelected = claim.id === s.claimId;
                      return (
                        <button
                          key={claim.id}
                          type="button"
                          onClick={() => s.selectClaim(claim.id)}
                          className={cn(
                            "w-full rounded-xl border p-3 text-left transition-all tap-highlight-none",
                            isSelected
                              ? "border-amber-400 bg-amber-500/20 shadow-md font-bold text-white ring-1 ring-amber-400"
                              : "border-white/5 bg-[#060b18]/80 hover:bg-[#0c1630] text-slate-300"
                          )}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold truncate text-white min-w-0 flex-1">
                              {claim.patient_name && claim.patient_name !== "N/A" ? claim.patient_name : `Claim #${claim.id.slice(0, 6)}`}
                            </p>
                            <div className="flex items-center gap-1.5 flex-none">
                              {isSelected ? <span className="flex h-2 w-2 rounded-full bg-amber-400 flex-none shadow-sm shadow-amber-400" /> : null}
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => s.deleteClaim(claim.id, e as any)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); s.deleteClaim(claim.id); } }}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                title="Remove claim"
                              >
                                <X className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-amber-300/60 mt-1 truncate">
                            ID: {claim.id.slice(0, 8)}...
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </StaggerItem>

            {/* Right Main Content Area */}
            <div className="space-y-6 lg:col-span-3">

              {/* Sleek 1-Line Collapsible Upload Dropdown Panel */}
              <StaggerItem index={2}>
                <div className="rounded-2xl border border-amber-500/25 bg-[#0a1226]/90 p-3.5 shadow-xl shadow-amber-500/5 backdrop-blur-xl">
                  <div
                    onClick={s.toggleUploadOpen}
                    className="flex cursor-pointer select-none items-center justify-between gap-2 p-1"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xs sm:text-sm font-bold text-white truncate">Upload Claim Documents</h2>
                        <p className="text-[10px] sm:text-xs text-amber-200/60 truncate">
                          {s.isUploadOpen ? "Click to collapse panel" : "Expand to upload & analyze new claim documents"}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        s.toggleUploadOpen();
                      }}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[11px] sm:text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 h-8 px-3.5 rounded-xl flex-none border border-amber-400/40"
                    >
                      {s.isUploadOpen ? (
                        <>
                          <ChevronUp className="mr-1 h-3.5 w-3.5" /> Collapse
                        </>
                      ) : (
                        <>
                          <Plus className="mr-1 h-3.5 w-3.5" /> Upload New Claim
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Dropdown Body */}
                  {s.isUploadOpen && (
                    <div className="mt-3 pt-3 border-t border-amber-500/20 animate-fade-in">
                      {s.analyzing ? (
                        <div className="flex flex-col items-center justify-center p-6 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-center min-h-[180px] space-y-4 animate-fade-in">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-spin">
                            <Sparkles className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-white">AI Medical Engine Analyzing...</p>
                            <p className="text-xs font-semibold text-amber-400 mt-1">{s.activeStage.toUpperCase()} STAGE ACTIVE ({s.progress}%)</p>
                          </div>
                        </div>
                      ) : s.isLiveSessionCompleted ? (
                        <div className="flex flex-col items-center justify-center p-6 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-center min-h-[180px] space-y-4 animate-fade-in">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/20">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">Claim Analysis 100% Complete!</h3>
                            <p className="text-xs text-slate-300 mt-1">
                              Extracted report for <span className="font-semibold text-amber-300">{s.files[0]?.name || "claim_document.pdf"}</span> is generated.
                            </p>
                          </div>
                          <div className="pt-2 w-full max-w-sm space-y-2">
                            <Button onClick={s.openReportModal} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 w-full h-11 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 rounded-xl border border-amber-400/40">
                              <FileText className="mr-2 h-4 w-4" /> View AI Post-Processing Audit Report
                            </Button>
                            <button
                              type="button"
                              onClick={() => s.resetState()}
                              className="inline-flex items-center justify-center gap-1.5 text-xs text-amber-300 hover:text-white underline pt-1"
                            >
                              <Plus className="h-3.5 w-3.5" /> Upload Another Claim Document
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="ledger-upload"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            s.handleSelectFile(e);
                          }}
                          className="group flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-500/30 bg-[#060b18]/80 text-center transition-all hover:border-amber-400/80 hover:bg-[#060b18] tap-highlight-none"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-transform group-hover:scale-110">
                            <Upload className="h-5 w-5" />
                          </div>
                          <p className="text-sm font-bold text-white">Drag &amp; drop claim documents</p>
                          <p className="text-xs text-amber-300/60">PDF, JPG, PNG — up to 25 MB</p>
                          <input
                            id="ledger-upload"
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={s.handleSelectFile}
                          />
                        </label>
                      )}

                      {/* Staged files preview */}
                      {s.files.length > 0 && !s.analyzing && !s.isLiveSessionCompleted && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-300">
                            <span className="font-semibold text-white">Attached Files ({s.files.length})</span>
                            <button
                              type="button"
                              onClick={() => document.getElementById('ledger-upload')?.click()}
                              className="text-[11px] font-bold text-amber-300 hover:text-white inline-flex items-center gap-1 underline"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add More Documents
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {s.files.map((f, i) => (
                              <div key={i} className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-[#060b18]/90 p-3 text-xs shadow-sm">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {f.type?.startsWith("image/") || f.name.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                    <ImageIcon className="h-4 w-4 text-amber-400 flex-none" />
                                  ) : (
                                    <Folder className="h-4 w-4 text-amber-400 flex-none" />
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-semibold truncate text-white">{f.name}</p>
                                    <p className="text-[10px] text-amber-300/60 font-mono mt-0.5">{f.size}</p>
                                  </div>
                                </div>
                                <button type="button" onClick={() => s.removeFile(i)} className="text-slate-500 hover:text-rose-400 p-1">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <Button onClick={() => s.startClaimAnalysis()} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 w-full h-11 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 rounded-xl border border-amber-400/40">
                            <Sparkles className="mr-2 h-4 w-4" /> Start AI Claim Analysis &amp; Extraction ({s.files.length} {s.files.length === 1 ? 'Doc' : 'Docs'})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </StaggerItem>

              {/* Live Pipeline Processing Tracker */}
              <StaggerItem index={3}>
                <div className="rounded-2xl border border-amber-500/25 bg-[#0a1226]/90 p-4 shadow-xl shadow-amber-500/5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Processing Pipeline</span>
                      <p className="text-[10px] text-amber-300/60">Claim ID: {s.claimId ? `${s.claimId.slice(0, 8)}...` : "CLM-2026-08842"}</p>
                    </div>
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      {s.isDocumentsRequested ? (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                          <span className="text-amber-400">PAUSED — ACTION REQUIRED</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                          <span>{s.progress}% COMPLETE</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="h-2 w-full rounded-full bg-[#060b18] overflow-hidden border border-amber-500/20">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          s.isDocumentsRequested
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                            : "bg-gradient-to-r from-amber-500 to-amber-400"
                        )}
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-amber-300/70 px-0.5">
                      <span>0%</span>
                      <span className="font-extrabold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.2 rounded-full">{s.progress}% Active Stage</span>
                      <span className="text-amber-400">100%</span>
                    </div>
                  </div>

                  {/* 5-Step Pipeline Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                    {PIPELINE.map((p, i) => {
                      const isDone = i <= s.stageIndex;
                      return (
                        <div
                          key={p.key}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold border transition-all flex-1 min-w-[100px] justify-center",
                            isDone ? "bg-amber-500/20 border-amber-500/40 text-amber-200" : "bg-[#060b18]/80 border-white/5 text-slate-600"
                          )}
                        >
                          <CheckCircle2 className={cn("h-3 w-3 flex-none", isDone ? "text-amber-400" : "text-slate-700")} />
                          <span className="truncate">{p.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {s.isDocumentsRequested && (
                    <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 animate-fade-in text-left">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1 w-full">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Mandatory Document Missing</h4>
                          <p className="text-xs text-amber-300/80">
                            We detected incomplete information in your claim upload. Please upload the following items to resume analysis:
                          </p>
                          <ul className="list-disc list-inside pl-1.5 text-xs font-medium space-y-0.5 mt-1 text-amber-200">
                            {s.missingGroups.map((grp: string) => (
                              <li key={grp}>{grp}</li>
                            ))}
                          </ul>
                          <div className="mt-3 flex items-center gap-3">
                            <label className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm cursor-pointer hover:opacity-90">
                              <input
                                type="file"
                                multiple
                                hidden
                                onChange={(e) => {
                                  if (e.target.files?.length) {
                                    s.handleUploadFile(Array.from(e.target.files), true);
                                  }
                                }}
                              />
                              <Upload className="h-3.5 w-3.5" /> Upload Missing Documents
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </StaggerItem>

              {/* Claims Auditor Workspace & PDF Preview Area */}
              <StaggerItem index={4}>
                <div className="rounded-2xl border border-amber-500/25 bg-[#0a1226]/90 p-4 shadow-xl shadow-amber-500/5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-bold text-white">Auditor Workspace &amp; Document Preview</h2>
                      <p className="text-[11px] text-amber-300/60">Extracted data &amp; bounding box highlights for selected claim.</p>
                    </div>
                    {!s.isDocumentsRequested && (
                      <Button onClick={s.openReportModal} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs font-bold text-slate-950 h-9 px-4 rounded-xl shadow-md border border-amber-400/40">
                        <FileText className="mr-1.5 h-3.5 w-3.5" /> Full Audit Report
                      </Button>
                    )}
                  </div>

                  {/* Split View: Document Viewer + Metadata */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Left: Document Viewer */}
                    <div className="rounded-xl border border-amber-500/20 bg-[#060b18] p-2 overflow-hidden min-h-[380px] flex flex-col">
                      <DocumentViewer
                        claimId={s.claimId}
                        zoom={s.zoom}
                        setZoom={s.setZoom}
                        hoveredField={s.hoveredField}
                        filename={s.realPreview?.documents?.[0]?.display_title || s.realPreview?.documents?.[0]?.original_filename || s.files[0]?.name}
                        documents={s.realPreview?.documents}
                        activeDocumentId={s.activeDocumentId}
                        onSelectDocument={s.setActiveDocumentId}
                        onOpenDocModal={s.openDocModal}
                        dark={true}
                      />
                    </div>

                    {/* Right: Extracted Patient & Claim Metadata */}
                    <div className="space-y-3 rounded-xl border border-amber-500/20 bg-[#060b18]/90 p-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-amber-500/20 pb-2">Patient Metadata</h3>

                      <div key={`${s.claimId || 'default-ledger'}-${s.previewVersion}`} className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[10px] font-medium text-amber-300/60">Patient Name</p>
                          <p className="font-bold text-white mt-0.5 bg-[#0a1226] p-2 rounded-lg border border-amber-500/10">{s.patientName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-amber-300/60">Hospital</p>
                          <p className="font-bold text-white mt-0.5 bg-[#0a1226] p-2 rounded-lg border border-amber-500/10 truncate">{s.hospitalName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-amber-300/60">Admission Date</p>
                          <p className="font-semibold text-slate-300 mt-0.5 bg-[#0a1226] p-2 rounded-lg border border-amber-500/10">{s.admissionDate}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-amber-300/60">Discharge Date</p>
                          <p className="font-semibold text-slate-300 mt-0.5 bg-[#0a1226] p-2 rounded-lg border border-amber-500/10">{s.dischargeDate}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-medium text-amber-300/60">Diagnosis</p>
                          <p className="font-semibold text-amber-300 mt-0.5 bg-[#0a1226] p-2 rounded-lg border border-amber-500/10 truncate">{s.diagnosis}</p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-white uppercase tracking-wider text-[11px]">Itemized Expenses</span>
                          <span className="text-[10px] text-amber-300/60">Hover row to locate in document</span>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-amber-500/20 bg-[#060b18]">
                          <table className="w-full text-left text-[11px]">
                            <thead className="border-b border-amber-500/20 text-amber-300/70 uppercase bg-[#0a1226] text-[10px]">
                              <tr>
                                <th className="py-1.5 px-2.5">Category</th>
                                <th className="py-1.5 px-2.5">Description</th>
                                <th className="py-1.5 px-2.5 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-500/10">
                              {s.lineItems.map((item) => (
                                <tr key={item.id} className="hover:bg-amber-500/15 cursor-pointer transition-colors">
                                  <td className="py-1.5 px-2.5 font-semibold text-slate-200">{item.category}</td>
                                  <td className="py-1.5 px-2.5 text-slate-400 truncate max-w-[120px]">{item.description}</td>
                                  <td className="py-1.5 px-2.5 text-right font-bold text-amber-400">{formatINR(item.amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-amber-500/20 font-bold bg-[#0a1226] text-xs">
                                <td colSpan={2} className="py-2 px-2.5 text-white">Total Claim Amount</td>
                                <td className="py-2 px-2.5 text-right text-amber-400">{formatINR(s.total)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>

            </div>
          </div>
        </StaggerContainer>
      </main>

      {/* Post-Processing Audit Report Modal */}
      <ClaimReportModal s={s} />
      <DocumentPreviewModal
        isOpen={s.showDocModal}
        onClose={s.closeDocModal}
        claimId={s.claimId}
        patientName={s.patientName}
        documents={s.realPreview?.documents}
        initialDocId={s.activeDocumentId}
      />

      {/* User Profile & Account Submissions Modal */}
      <UserProfileModal isOpen={s.showProfileModal} onClose={s.closeProfileModal} s={s} userName={s.userName} userEmail={s.userEmail} variant="executive" />

      {/* Slide-out Sidebar Navigation Drawer */}
      <HamburgerMenuDrawer isOpen={s.showMenuDrawer} onClose={s.closeMenuDrawer} s={s} userName={s.userName} userEmail={s.userEmail} onOpenProfile={s.openProfileModal} variant="executive" />
    </div>
  );
}
