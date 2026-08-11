'use client';

import { useState, useEffect } from 'react';

import {
  AlertTriangle,
  Bell,
  Camera,
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
  X,
  Menu,
  Loader2,
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/claimgpt/language-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  MagneticButton,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '@/components/claimgpt/effects';
import { cn } from '@/lib/utils';

export function DashboardClinical() {
  const s = useAuditorState();
  const [claimToDelete, setClaimToDelete] = useState<{ id: string; name: string } | null>(null);

  const processingInList = s.recentClaims.filter((c) => {
    const st = (c.status || "").toUpperCase();
    return st === "PENDING" || st === "PROCESSING" || st === "IN_PROGRESS" || st === "QUEUED" || (st !== "COMPLETED" && st !== "VALIDATED" && st !== "FINISHED" && st !== "REJECTED");
  });

  const isCurrentClaimProcessing = (s.progress > 0 && s.progress < 100) || s.uploading || s.analyzing;
  const currentInList = processingInList.some((c) => c.id === s.claimId);

  const activeQueueCount = processingInList.length + (isCurrentClaimProcessing && !currentInList ? 1 : 0);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-100/80 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between gap-2 px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <button
              type="button"
              onClick={s.openMenuDrawer}
              className="flex h-8 sm:h-9 w-8 sm:w-9 flex-none items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Open Navigation Menu"
              title="Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex h-8 sm:h-9 w-8 sm:w-9 flex-none items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
              <ShieldCheck className="h-4 sm:h-5 w-4 sm:w-5" />
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
              <span className="font-display text-base sm:text-lg font-bold tracking-tight flex-none">ClaimGPT</span>
              <span className="rounded bg-teal-50 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-teal-700 whitespace-nowrap flex-none">
                <span className="hidden sm:inline">Self-Service Portal</span>
                <span className="sm:hidden">Clinical</span>
              </span>
            </div>
          </div>
          <div className="relative ml-4 hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search claims, hospital bills, ICD-10 codes…" className="h-10 border-slate-200 bg-slate-50 pl-10 text-sm" />
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 sm:inline-flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
              </span>
              Processing Queue: <CountUp end={activeQueueCount} />
            </span>
            <LanguageSwitcher variant="light" />
            <NotificationBell variant="clinical" />
            <Avatar onClick={s.openProfileModal} title={`${s.userName} (${s.userEmail})`} className="h-9 w-9 border border-slate-200 cursor-pointer hover:scale-105 transition-transform" aria-label="User Profile">
              <AvatarFallback className="bg-teal-600 text-xs font-semibold text-white">{s.userName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <StaggerContainer className="mx-auto max-w-7xl space-y-6 pb-24">
          <StaggerItem index={0}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Patient Claim Reimbursement Portal</h1>
                <p className="mt-1 text-sm text-slate-600">Upload hospital bills, discharge summaries &amp; diagnostic reports for AI-powered verification &amp; settlement.</p>
              </div>
            </div>
          </StaggerItem>

          {/* Responsive Desktop & Mobile Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:items-start">

            {/* Desktop Left Sidebar: Processed Claims History */}
            <StaggerItem index={1} className="hidden lg:block lg:col-span-1">
              <div className="rounded-xl border border-border bg-white p-4 shadow-elevation-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Processed Claims</h3>
                      <p className="text-[10px] text-muted-foreground">Select claim to audit</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                    {s.recentClaims.length || 1}
                  </span>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[720px] pr-1 scrollbar-thin">
                  {s.recentClaims.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => s.selectClaim(s.claimId || "")}
                      className="w-full rounded-xl border border-accent bg-accent/10 p-3 text-left shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold truncate text-foreground">{s.patientName}</p>
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 flex-none" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate">
                        ID: {s.claimId ? `${s.claimId.slice(0, 8)}...` : "Active Claim"}
                      </p>
                    </button>
                  ) : (
                    s.recentClaims.map((claim) => {
                      const isSelected = claim.id === s.claimId;
                      const claimName = claim.patient_name && claim.patient_name !== "N/A" ? claim.patient_name : `Claim #${claim.id.slice(0, 6)}`;
                      return (
                        <button
                          key={claim.id}
                          type="button"
                          onClick={() => s.selectClaim(claim.id)}
                          className={cn(
                            "w-full rounded-xl border p-3 text-left transition-all tap-highlight-none",
                            isSelected
                              ? "border-accent bg-accent/10 shadow-sm font-bold ring-1 ring-accent"
                              : "border-border bg-slate-50 hover:bg-slate-100"
                          )}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold truncate text-foreground min-w-0 flex-1">
                              {claimName}
                            </p>
                            <div className="flex items-center gap-1.5 flex-none">
                              {isSelected ? <span className="flex h-2 w-2 rounded-full bg-emerald-500 flex-none" /> : null}
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setClaimToDelete({ id: claim.id, name: claimName });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.stopPropagation();
                                    setClaimToDelete({ id: claim.id, name: claimName });
                                  }
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                                title="Delete claim"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">
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
                <SpotlightCard className="bg-white p-3 shadow-elevation-sm">
                  {/* Ultra-compact 1-line flex row for both mobile & desktop */}
                  <div
                    onClick={s.toggleUploadOpen}
                    className="flex cursor-pointer select-none items-center justify-between gap-2 p-1"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xs sm:text-sm font-bold text-foreground truncate">Upload Claim Documents</h2>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
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
                      className="teal-gradient text-[11px] sm:text-xs font-semibold text-white shadow-sm h-8 px-3 rounded-lg flex-none"
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
                    <div className="mt-3 pt-3 border-t border-border animate-fade-in">
                      {s.analyzing ? (
                        <div className="flex flex-col items-center justify-center p-6 bg-accent/5 rounded-xl border border-accent/30 text-center min-h-[180px] space-y-4 animate-fade-in">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent animate-spin">
                            <Sparkles className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-foreground">AI Medical Engine Analyzing...</p>
                            <p className="text-xs font-semibold text-accent mt-1">{s.stepDescription || "OCR (extracting text) · 20%"}</p>
                          </div>
                        </div>
                      ) : s.isLiveSessionCompleted ? (
                        <div className="flex flex-col items-center justify-center p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-center min-h-[180px] space-y-4 animate-fade-in">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground">Claim Analysis 100% Complete!</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Extracted report for <span className="font-semibold text-foreground">{s.files[0]?.name || "claim_document.pdf"}</span> is generated.
                            </p>
                          </div>
                          <div className="pt-2 w-full max-w-sm space-y-2">
                            <Button onClick={s.openReportModal} className="teal-gradient w-full h-11 text-sm font-semibold text-white shadow-lg">
                              <FileText className="mr-2 h-4 w-4" /> View AI Post-Processing Audit Report
                            </Button>
                            <button
                              type="button"
                              onClick={() => s.resetState()}
                              className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground underline pt-1"
                            >
                              <Plus className="h-3.5 w-3.5" /> Upload Another Claim Document
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="c-upload"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            s.handleSelectFile(e);
                          }}
                          className="group flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-slate-50 text-center transition-all hover:border-accent/50 hover:bg-accent/5 tap-highlight-none"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform group-hover:scale-110">
                            <Upload className="h-5 w-5" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">Drag &amp; drop claim documents</p>
                          <p className="text-xs text-muted-foreground">PDF, JPG, PNG — up to 25 MB</p>
                          <input
                            id="c-upload"
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
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">Attached Files ({s.files.length})</span>
                            <button
                              type="button"
                              onClick={() => document.getElementById('c-upload')?.click()}
                              className="text-[11px] font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1 underline"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add More Documents
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {s.files.map((f, i) => (
                              <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-slate-50 p-3 text-xs shadow-sm">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {f.type?.startsWith("image/") || f.name.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                    <ImageIcon className="h-4 w-4 text-teal-600 flex-none" />
                                  ) : (
                                    <Folder className="h-4 w-4 text-teal-600 flex-none" />
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-semibold truncate text-foreground">{f.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{f.size}</p>
                                  </div>
                                </div>
                                <button type="button" onClick={() => s.removeFile(i)} className="text-slate-400 hover:text-rose-600 p-1">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <Button onClick={() => s.startClaimAnalysis()} disabled={s.analyzing} className="teal-gradient w-full h-11 text-xs sm:text-sm font-bold text-white shadow-md rounded-xl">
                            <Sparkles className={cn("mr-2 h-4 w-4", s.analyzing && "animate-spin")} />
                            {s.analyzing ? "Analyzing Claim Document..." : `Begin Claim Analysis (${s.files.length} ${s.files.length === 1 ? 'Doc' : 'Docs'})`}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </SpotlightCard>
              </StaggerItem>

              {/* Mobile Only: Processed Claims History Selector */}
              <StaggerItem index={3} className="block lg:hidden">
                <div className="rounded-xl border border-border bg-white p-4 shadow-elevation-sm">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Processed Claims History</h3>
                    </div>
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                      {s.recentClaims.length || 1} Claims
                    </span>
                  </div>

                  <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin snap-x">
                    {s.recentClaims.length === 0 ? (
                      s.claimId ? (
                        <button
                          type="button"
                          onClick={() => s.selectClaim(s.claimId || "")}
                          className="flex-none snap-start rounded-lg border border-accent bg-accent/10 px-3.5 py-2 text-left shadow-sm min-w-[150px]"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold truncate text-foreground">{s.patientName || "Patient Record"}</p>
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 flex-none" />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            ID: {s.claimId.slice(0, 8)}...
                          </p>
                        </button>
                      ) : (
                        <p className="text-xs text-muted-foreground italic py-1 px-1">No uploaded claims present</p>
                      )
                    ) : (
                    s.recentClaims.map((claim) => {
                      const isSelected = claim.id === s.claimId;
                      const claimName = claim.patient_name && claim.patient_name !== "N/A" ? claim.patient_name : `Claim #${claim.id.slice(0, 6)}`;
                      return (
                        <button
                          key={claim.id}
                          type="button"
                          onClick={() => s.selectClaim(claim.id)}
                          className={cn(
                            "flex-none snap-start rounded-lg border px-3.5 py-2 text-left transition-all tap-highlight-none min-w-[170px]",
                            isSelected
                              ? "border-accent bg-accent/10 shadow-sm font-bold ring-1 ring-accent"
                              : "border-border bg-slate-50 hover:bg-slate-100"
                          )}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold truncate text-foreground min-w-0 flex-1">
                              {claimName}
                            </p>
                            <div className="flex items-center gap-1.5 flex-none">
                              {isSelected ? <span className="flex h-2 w-2 rounded-full bg-emerald-500 flex-none" /> : null}
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setClaimToDelete({ id: claim.id, name: claimName });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.stopPropagation();
                                    setClaimToDelete({ id: claim.id, name: claimName });
                                  }
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                                title="Delete claim"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            ID: {claim.id.slice(0, 8)}...
                          </p>
                        </button>
                      );
                    })
                    )}
                  </div>
                </div>
              </StaggerItem>

              {/* Processing Pipeline Progress Bar Card */}
              <StaggerItem index={4} id="pipeline-progress-section">
                <SpotlightCard className="bg-white p-4 shadow-elevation-sm sm:p-5">
                  {/* Top Bar: Claim Info, Progress Badge & View Report Button */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-foreground">Processing Pipeline</h2>
                        {s.isDocumentsRequested ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-500/30 animate-pulse">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                            PAUSED — ACTION REQUIRED
                          </span>
                        ) : s.nameMismatchWarning ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-700 border border-red-500/30 animate-pulse">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                            PAUSED — NAME MISMATCH
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-500/30">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            {s.progress}% COMPLETE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Claim ID: <span className="font-mono font-medium text-foreground">{s.claimId || "CLM-2026-08842"}</span>
                      </p>
                    </div>

                    {(s.progress >= 100 || s.realPreview) && !s.isDocumentsRequested && !s.nameMismatchWarning ? (
                      <Button onClick={s.openReportModal} className="teal-gradient text-xs font-semibold text-white shadow-md animate-scale-in self-start sm:self-auto">
                        <FileText className="mr-1.5 h-4 w-4" /> View AI Report
                      </Button>
                    ) : null}
                  </div>

                  {/* Clean Progress Bar (0% to 100%) */}
                  <div className="relative mt-3 mb-2 sm:mb-4">
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden p-0.5 border border-border">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          s.isDocumentsRequested
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                            : "bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                        )}
                        style={{ width: `${Math.max(s.progress, 5)}%` }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>0%</span>
                      <span className="font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.2 rounded-full">{s.progress >= 100 ? "100% Complete" : (s.stepDescription || `${s.progress}% Active Stage`)}</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Desktop Only (hidden on mobile): Clean 5 Stage Cards without redundant 'VERIFIED' word */}
                  <div className="hidden sm:grid grid-cols-5 gap-2 pt-3 border-t border-border/50">
                    {PIPELINE.map((stage, i) => {
                      const done = i < s.stageIndex || s.progress >= 100;
                      const current = i === s.stageIndex && s.progress < 100;
                      return (
                        <button
                          key={stage.key}
                          type="button"
                          onClick={() => s.setActiveStage(stage.key)}
                          className={cn(
                            "flex items-center justify-center gap-2 p-2 rounded-xl border text-center transition-all tap-highlight-none min-h-[44px]",
                            done && "border-emerald-500/30 bg-emerald-500/10 shadow-xs",
                            current && "border-accent bg-accent/15 ring-2 ring-accent/30 animate-pulse",
                            !done && !current && "border-border bg-slate-50 hover:bg-slate-100"
                          )}
                        >
                          <span className={cn(
                            "flex h-4 w-4 flex-none items-center justify-center rounded-full text-[10px] font-bold",
                            done && "bg-emerald-600 text-white",
                            current && "bg-accent text-white animate-bounce",
                            !done && !current && "bg-muted text-muted-foreground"
                          )}>
                            {done ? <Check className="h-2.5 w-2.5" /> : i + 1}
                          </span>
                          <p className={cn("text-xs font-semibold leading-tight truncate", done || current ? "text-foreground" : "text-muted-foreground")}>
                            {stage.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {s.isDocumentsRequested && (
                    <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-900 animate-fade-in text-left">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1 w-full">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">Mandatory Document Missing</h4>
                          <p className="text-xs text-amber-700">
                            We detected incomplete information in your claim upload. Please upload the following items to resume analysis:
                          </p>
                          <ul className="list-disc list-inside pl-1.5 text-xs font-medium space-y-0.5 mt-1 text-amber-900">
                            {s.missingGroups.map((grp: string) => (
                              <li key={grp}>{grp}</li>
                            ))}
                          </ul>
                          <div className="mt-3 flex items-center gap-3">
                            <label className="teal-gradient inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm cursor-pointer hover:opacity-90">
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

                  {s.nameMismatchWarning && (
                    <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50/50 text-red-900 animate-fade-in text-left">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1 w-full font-sans">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-red-800">Patient Name Mismatch Detected</h4>
                          <p className="text-xs text-red-700 leading-relaxed">
                            {s.nameMismatchWarning}
                          </p>
                          <div className="mt-3 flex items-center gap-3">
                            <label className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm cursor-pointer hover:opacity-90">
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
                              <Upload className="h-3.5 w-3.5" /> Upload Correct ID Proof
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </SpotlightCard>
              </StaggerItem>

              {/* Auditor Workspace (Sits right below Pipeline!) */}
              <StaggerItem index={5}>
                <SpotlightCard className="bg-white shadow-elevation-sm">
                  <div className="border-b border-border px-5 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Claims Auditor &amp; Preview</h2>
                      <p className="text-xs text-muted-foreground">Hover a table row to highlight its source on the document.</p>
                    </div>
                    <Button onClick={s.openReportModal} size="sm" className="teal-gradient text-xs font-semibold text-white">
                      <FileText className="mr-1.5 h-3.5 w-3.5" /> Full Audit Report
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <DocumentViewer
                      claimId={s.claimId}
                      fileObj={s.files.length > 0 ? s.files[s.files.length - 1] : null}
                      zoom={s.zoom}
                      setZoom={s.setZoom}
                      hoveredField={s.hoveredField}
                      filename={s.realPreview?.documents?.[0]?.display_title || s.realPreview?.documents?.[0]?.original_filename || (s.files.length > 0 ? s.files[s.files.length - 1]?.name : undefined)}
                      documents={s.realPreview?.documents}
                      activeDocumentId={s.activeDocumentId}
                      onSelectDocument={s.setActiveDocumentId}
                      onOpenDocModal={s.openDocModal}
                      className="border-b border-border lg:border-b-0 lg:border-r"
                    />
                    <div className="flex flex-col">
                      <div className="border-b border-border bg-slate-50/60 px-5 py-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Extracted Claim Data</h3>
                        {s.nameMismatchWarning && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-300 px-2.5 py-0.5 text-[10px] font-bold text-red-800 animate-pulse">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            Name Mismatch
                          </span>
                        )}
                      </div>
                      {s.nameMismatchWarning && (
                        <div className="mx-5 mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900 shadow-sm animate-fade-in font-sans">
                          <AlertTriangle className="h-4 w-4 text-red-600 flex-none mt-0.5" />
                          <div>
                            <h4 className="font-bold text-red-900">Patient Name Mismatch Detected</h4>
                            <p className="mt-0.5 text-red-700 leading-relaxed">{s.nameMismatchWarning}</p>
                          </div>
                        </div>
                      )}
                      <div key={`${s.claimId || 'default-clinical'}-${s.previewVersion}`} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                        <MetaField id="c-patient-name" label="Patient Name" defaultValue={s.patientName} edited={!!s.edited['patient-name']} onEdit={() => s.markEdited('patient-name')} />
                        <MetaField id="c-hospital" label="Hospital" defaultValue={s.hospitalName} edited={!!s.edited['hospital']} onEdit={() => s.markEdited('hospital')} />
                        <MetaField id="c-admission" label="Admission Date" defaultValue={s.admissionDate} edited={!!s.edited['admission']} onEdit={() => s.markEdited('admission')} />
                        <MetaField id="c-discharge" label="Discharge Date" defaultValue={s.dischargeDate} edited={!!s.edited['discharge']} onEdit={() => s.markEdited('discharge')} />
                        <MetaField id="c-diagnosis" label="Diagnosis" defaultValue={s.diagnosis} edited={!!s.edited['diagnosis']} onEdit={() => s.markEdited('diagnosis')} className="sm:col-span-2" />
                      </div>
                      <div className="border-t border-border px-5 py-4">
                        <h3 className="mb-3 text-sm font-semibold text-foreground">Categorized Expenses</h3>
                        <div className="overflow-hidden rounded-lg border border-border">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-muted-foreground">
                              <tr>
                                <th className="px-3 py-2.5 text-left font-semibold">Category</th>
                                <th className="hidden px-3 py-2.5 text-left font-semibold sm:table-cell">Description</th>
                                <th className="px-3 py-2.5 text-right font-semibold">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {s.lineItems.map((item) => (
                                <tr key={item.id} onMouseEnter={() => s.setHoveredField(item.id)} onMouseLeave={() => s.setHoveredField(null)} className={cn('cursor-pointer transition-colors', s.hoveredField === item.id ? 'bg-accent/5' : 'hover:bg-slate-50')}>
                                  <td className="px-3 py-2.5 font-medium text-foreground">{item.category}</td>
                                  <td className="hidden px-3 py-2.5 text-muted-foreground sm:table-cell">{item.description}</td>
                                  <td className="px-3 py-2.5 text-right font-medium text-foreground">{formatINR(item.amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t-2 border-border bg-slate-50">
                                <td className="px-3 py-3 font-bold text-foreground">Total</td>
                                <td className="hidden px-3 py-3 sm:table-cell" />
                                <td className="px-3 py-3 text-right font-bold text-teal-700">{formatINR(s.total)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
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
        fileObj={s.files.length > 0 ? s.files[s.files.length - 1] : null}
        patientName={s.patientName}
        documents={s.realPreview?.documents}
        initialDocId={s.activeDocumentId}
      />

      {/* User Profile & Account Submissions Modal */}
      <UserProfileModal isOpen={s.showProfileModal} onClose={s.closeProfileModal} s={s} userName={s.userName} userEmail={s.userEmail} variant="clinical" />

      {/* Slide-out Sidebar Navigation Drawer */}
      <HamburgerMenuDrawer isOpen={s.showMenuDrawer} onClose={s.closeMenuDrawer} s={s} userName={s.userName} userEmail={s.userEmail} onOpenProfile={s.openProfileModal} variant="clinical" />

      {/* Delete Claim Confirmation Modal */}
      {claimToDelete && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in font-sans">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Claim?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Are you sure you want to remove <span className="font-semibold text-slate-700">{claimToDelete.name}</span>?</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setClaimToDelete(null)}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  s.deleteClaim(claimToDelete.id);
                  setClaimToDelete(null);
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetaField({
  id,
  label,
  defaultValue,
  edited,
  onEdit,
  className,
}: {
  id: string;
  label: string;
  defaultValue: string;
  edited: boolean;
  onEdit: () => void;
  className?: string;
}) {
  const [val, setVal] = useState(defaultValue);

  useEffect(() => {
    setVal(defaultValue);
  }, [defaultValue]);

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</Label>
        {edited && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 animate-scale-in">
            <Clock className="h-2.5 w-2.5" />Edited
          </span>
        )}
      </div>
      <Input
        id={id}
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          onEdit();
        }}
        className="h-10 border-slate-200"
      />
    </div>
  );
}
