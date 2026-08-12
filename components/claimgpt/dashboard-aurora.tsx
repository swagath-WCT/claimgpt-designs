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
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
  Zap,
  Menu
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/claimgpt/language-switcher';
import { DuplicateClaimModal } from '@/components/claimgpt/duplicate-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DocumentViewer } from '@/components/claimgpt/document-viewer';
import { ClaimReportModal } from '@/components/claimgpt/claim-report-modal';
import { DocumentPreviewModal } from '@/components/claimgpt/document-preview-modal';
import { UserProfileModal } from '@/components/claimgpt/user-profile-modal';
import { HamburgerMenuDrawer } from '@/components/claimgpt/hamburger-menu-drawer';
import { NotificationBell } from '@/components/claimgpt/notification-bell';
import { UserAvatar } from '@/components/claimgpt/user-avatar';
import {
  LINE_ITEMS,
  PIPELINE,
  formatINR,
  useAuditorState,
} from '@/components/claimgpt/use-auditor-state';
import {
  AuroraBackground,
  CountUp,
  GradientText,
  StaggerContainer,
  StaggerItem,
} from '@/components/claimgpt/effects';
import { cn } from '@/lib/utils';

export function DashboardAurora() {
  const s = useAuditorState();

  const hasActiveClaim = Boolean(
    s.claimId ||
    s.realPreview ||
    s.recentClaims.length > 0 ||
    s.analyzing ||
    s.isLiveSessionCompleted
  );

  const isUploadOpenEffective = s.isUploadOpen;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Animated Electric Cyan & Purple Cyber Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-500/15 blur-[140px] animate-pulse" />
        <div className="absolute top-[40%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Top Cyber Nav */}
      <header className="relative z-40 sticky top-0 border-b border-cyan-500/20 bg-[#030712]/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-2 px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <button
              type="button"
              onClick={s.openMenuDrawer}
              className="flex h-8 sm:h-9 w-8 sm:w-9 flex-none items-center justify-center rounded-xl border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
              title="Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex h-8 sm:h-9 w-8 sm:w-9 flex-none items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20">
              <Zap className="h-4 sm:h-5 w-4 sm:w-5 fill-white" />
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
              <span className="font-display text-base sm:text-lg font-extrabold tracking-tight text-white flex-none">ClaimGPT</span>
              <span className="rounded-full bg-cyan-500/20 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-cyan-300 border border-cyan-500/40 tracking-wider uppercase whitespace-nowrap flex-none">
                <span className="hidden sm:inline">Neon Cyber Glass</span>
                <span className="sm:hidden">Neon</span>
              </span>
            </div>
          </div>
          <div className="relative ml-2 hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/60" />
            <Input placeholder="Search claims, hospital bills, ICD-10 codes…" className="h-10 border-cyan-500/30 bg-cyan-950/20 pl-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" />
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher variant="dark" />
            <NotificationBell variant="neon" />
            <button
              type="button"
              onClick={s.openProfileModal}
              title={`${s.userName} (${s.userEmail})`}
              className="cursor-pointer hover:scale-105 transition-transform rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="User Profile"
            >
              <UserAvatar name={s.userName} size="md" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 py-6">
        <StaggerContainer>
          <StaggerItem index={0}>
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Neon Claim Reimbursement Workspace</h1>
              <p className="text-xs sm:text-sm text-cyan-200/70 mt-1">Autonomous neural audit engine &amp; real-time IRDAI settlement validation.</p>
            </div>
          </StaggerItem>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <StaggerItem index={1} className="lg:col-span-1">
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-4 shadow-xl shadow-cyan-500/5 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Processed Claims</h3>
                      <p className="text-[10px] text-cyan-300/60">Select claim to audit</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 border border-cyan-500/30">
                    {s.recentClaims.length || (s.claimId ? 1 : 0)}
                  </span>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[720px] pr-1 scrollbar-thin">
                  {s.recentClaims.length === 0 ? (
                    s.claimId ? (
                      <button
                        type="button"
                        onClick={() => s.selectClaim(s.claimId || "")}
                        className="w-full rounded-xl border border-cyan-400/50 bg-cyan-500/20 p-3 text-left shadow-sm text-white cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold truncate text-white">{s.patientName || "Active Patient"}</p>
                          <span className="flex h-2 w-2 rounded-full bg-cyan-400 flex-none shadow-sm shadow-cyan-400" />
                        </div>
                        <p className="text-[10px] text-cyan-300/70 mt-1 truncate">
                          ID: {s.claimId.slice(0, 8)}...
                        </p>
                      </button>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-cyan-500/20 bg-slate-950/60 p-5 text-center my-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
                          <FileText className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-bold text-slate-200">No Claims Found</p>
                        <p className="text-[10px] text-cyan-300/60 mt-1 max-w-[150px] leading-tight">
                          Upload claim documents to activate AI audits.
                        </p>
                      </div>
                    )
                  ) : (
                    s.recentClaims.map((claim) => {
                      const isSelected = claim.id === s.claimId;
                      const claimName = claim.patient_name && claim.patient_name !== "N/A" ? claim.patient_name : `Claim #${claim.id.slice(0, 6)}`;
                      const docs = claim.documents || (isSelected && s.files.length > 0 ? s.files.map((f, i) => ({ id: `f-${i}`, file_name: f.name })) : []);
                      const isClaimProcessing = isSelected && s.analyzing;
                      const currentProgress = isClaimProcessing ? s.progress : 100;
                      const currentStep = isClaimProcessing ? (s.stepDescription || "Parsing (LLM agent reading document) · 55%") : "Completed";

                      return (
                        <button
                          key={claim.id}
                          type="button"
                          onClick={() => s.selectClaim(claim.id)}
                          className={cn(
                            "w-full rounded-xl border p-3 text-left transition-all tap-highlight-none cursor-pointer space-y-2",
                            isSelected
                              ? "border-cyan-400 bg-cyan-500/20 shadow-md font-bold text-white ring-1 ring-cyan-400"
                              : "border-white/5 bg-slate-950/60 hover:bg-slate-900 text-slate-300"
                          )}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <span className="text-xs font-bold truncate text-white">
                                {claimName}
                              </span>
                              {docs.length > 0 && (
                                <span className="text-[10px] text-cyan-300/70 font-medium flex-none">
                                  · {docs.length} docs
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-none">
                              {isSelected && !isClaimProcessing ? (
                                <span className="flex h-2 w-2 rounded-full bg-cyan-400 flex-none shadow-sm shadow-cyan-400" />
                              ) : null}
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => s.deleteClaim(claim.id, e as any)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); s.deleteClaim(claim.id); } }}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Delete claim"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </div>

                          {/* Document Chips List */}
                          {docs.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {docs.map((d: any) => (
                                <span
                                  key={d.id || d.file_name}
                                  className="inline-flex items-center gap-1 rounded-md border border-cyan-500/20 bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-cyan-200"
                                >
                                  {d.file_name.endsWith('.pdf') ? (
                                    <FileText className="h-3 w-3 text-cyan-400 flex-none" />
                                  ) : (
                                    <ImageIcon className="h-3 w-3 text-purple-400 flex-none" />
                                  )}
                                  <span className="truncate max-w-[120px]">{d.file_name}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Live Processing Bar & Stage Tag */}
                          {isClaimProcessing ? (
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold px-2 py-0.2 text-[9px]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                                  Parsing
                                </span>
                                <span className="font-mono font-bold text-cyan-400">{currentProgress}%</span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.max(currentProgress, 10)}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-cyan-300/60 truncate leading-tight font-mono">
                                {currentStep}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-[10px] text-cyan-300/60 pt-0.5">
                              <span className="truncate">ID: {claim.id.slice(0, 8)}...</span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 text-[9px] border border-cyan-500/30">
                                ✓ Completed
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </StaggerItem>

            <div className="space-y-6 lg:col-span-3">
              <StaggerItem index={2}>
                <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-3.5 shadow-xl shadow-cyan-500/5 backdrop-blur-xl">
                  <div
                    onClick={s.toggleUploadOpen}
                    className="flex cursor-pointer select-none items-center justify-between gap-2 p-1"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xs sm:text-sm font-bold text-white truncate">Upload Claim Documents</h2>
                        <p className="text-[10px] sm:text-xs text-cyan-200/60 truncate">
                          {isUploadOpenEffective ? "Click to collapse panel" : "Expand to upload & analyze new claim documents"}
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
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-[11px] sm:text-xs font-bold text-white shadow-md shadow-cyan-500/20 h-8 px-3.5 rounded-xl flex-none border border-cyan-400/30 cursor-pointer"
                    >
                      {isUploadOpenEffective ? (
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

                  {isUploadOpenEffective && (
                    <div className="mt-3 pt-3 border-t border-cyan-500/20 animate-fade-in">
                      {s.analyzing ? (
                        <div className="flex flex-col items-center justify-center p-6 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 text-center min-h-[180px] space-y-4 animate-fade-in">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-spin">
                            <Sparkles className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-white">AI Medical Engine Analyzing...</p>
                            <p className="text-xs font-semibold text-cyan-400 mt-1">{s.stepDescription || "OCR (extracting text) · 20%"}</p>
                          </div>
                        </div>
                      ) : s.isLiveSessionCompleted ? (
                        <div className="flex flex-col items-center justify-center p-6 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 text-center min-h-[180px] space-y-4 animate-fade-in">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">Claim Analysis 100% Complete!</h3>
                            <p className="text-xs text-slate-300 mt-1">
                              Extracted report for <span className="font-semibold text-cyan-300">{s.files[0]?.name || "claim_document.pdf"}</span> is generated.
                            </p>
                          </div>
                          <div className="pt-2 w-full max-w-sm space-y-2">
                            <Button onClick={s.openReportModal} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 w-full h-11 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 rounded-xl border border-cyan-400/30 cursor-pointer">
                              <FileText className="mr-2 h-4 w-4" /> View AI Post-Processing Audit Report
                            </Button>
                            <button
                              type="button"
                              onClick={() => s.resetState()}
                              className="inline-flex items-center justify-center gap-1.5 text-xs text-cyan-300 hover:text-white underline pt-1 cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" /> Upload Another Claim Document
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="aurora-upload"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            s.handleSelectFile(e);
                          }}
                          className="group flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cyan-500/30 bg-slate-950/60 text-center transition-all hover:border-cyan-400/80 hover:bg-slate-950/90 tap-highlight-none"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-transform group-hover:scale-110">
                            <Upload className="h-5 w-5" />
                          </div>
                          <p className="text-sm font-bold text-white">Drag &amp; drop claim documents</p>
                          <p className="text-xs text-cyan-300/60">PDF, JPG, PNG — up to 25 MB</p>
                          <input
                            id="aurora-upload"
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={s.handleSelectFile}
                          />
                        </label>
                      )}

                      {s.files.length > 0 && !s.analyzing && !s.isLiveSessionCompleted && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-300">
                            <span className="font-semibold text-white">Attached Files ({s.files.length})</span>
                            <button
                              type="button"
                              onClick={() => document.getElementById('aurora-upload')?.click()}
                              className="text-[11px] font-bold text-cyan-300 hover:text-white inline-flex items-center gap-1 underline cursor-pointer"
                            >
                              <Plus className="h-3 w-3" /> Add More Documents
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {s.files.map((f, i) => (
                              <div key={i} className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-slate-950/80 p-3 text-xs shadow-sm">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {f.type?.startsWith("image/") || f.name.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                    <ImageIcon className="h-4 w-4 text-cyan-400 flex-none" />
                                  ) : (
                                    <Folder className="h-4 w-4 text-cyan-400 flex-none" />
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-semibold truncate text-white">{f.name}</p>
                                    <p className="text-[10px] text-cyan-300/60 font-mono mt-0.5">{f.size}</p>
                                  </div>
                                </div>
                                <button type="button" onClick={() => s.removeFile(i)} className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <Button onClick={() => s.startClaimAnalysis()} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 w-full h-11 text-xs sm:text-sm font-bold text-white shadow-lg shadow-cyan-500/25 rounded-xl border border-cyan-400/30 cursor-pointer">
                            <Sparkles className="mr-2 h-4 w-4" /> Start AI Claim Analysis &amp; Extraction ({s.files.length} {s.files.length === 1 ? 'Doc' : 'Docs'})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </StaggerItem>

              {!hasActiveClaim ? (
                <StaggerItem index={3}>
                  <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-6 sm:p-8 shadow-xl shadow-cyan-500/5 backdrop-blur-xl">
                    <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-8">
                      <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-500/40 px-3 py-1 text-xs font-bold text-cyan-300">
                        <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                        AI-Powered Claim Verification &amp; Settlement Engine
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                        Fast, Automated Medical Claim Audits in 3 Steps
                      </h2>
                      <p className="text-xs sm:text-sm text-cyan-200/70 leading-relaxed">
                        Upload your hospital bills, discharge summaries, or pharmacy receipts above to activate automated extraction, fraud detection, and instant TPA report generation.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5 space-y-3 hover:border-cyan-400/50 transition-all">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/25">
                          1
                        </div>
                        <h3 className="text-sm font-bold text-white">Upload Claim Documents</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Drop multi-page hospital bills, discharge summaries, pharmacy invoices, or diagnostic lab tests.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5 space-y-3 hover:border-cyan-400/50 transition-all">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white font-black text-sm shadow-lg shadow-blue-500/25">
                          2
                        </div>
                        <h3 className="text-sm font-bold text-white">Neural OCR &amp; Parsing</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          ClaimGPT automatically extracts patient demographics, dates, itemized medical lines, and ICD/CPT codes.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5 space-y-3 hover:border-cyan-400/50 transition-all">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white font-black text-sm shadow-lg shadow-purple-500/25">
                          3
                        </div>
                        <h3 className="text-sm font-bold text-white">IRDAI Audit &amp; Settlement</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Inspect compliance scores, discrepancy validations, and instantly view on-screen TPA and IRDAI reports.
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cyan-200/70">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4.5 w-4.5 text-cyan-400 flex-none" />
                        <span className="font-semibold text-slate-300">256-Bit Encrypted · IRDAI Rule Compliant · HIPAA Ready</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => document.getElementById('aurora-upload')?.click()}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/25 cursor-pointer active:scale-95 transition-all"
                      >
                        <Upload className="h-3.5 w-3.5" /> Select Files to Get Started
                      </button>
                    </div>
                  </div>
                </StaggerItem>
              ) : (
                <>
                  <StaggerItem index={3}>
                    <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-4 shadow-xl shadow-cyan-500/5 backdrop-blur-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Processing Pipeline</span>
                          <p className="text-[10px] text-cyan-300/60">Claim ID: {s.claimId ? `${s.claimId.slice(0, 8)}...` : "CLM-2026-08842"}</p>
                        </div>
                        <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                          {s.isDocumentsRequested ? (
                            <>
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                              <span className="text-amber-400">PAUSED — ACTION REQUIRED</span>
                            </>
                          ) : s.nameMismatchWarning ? (
                            <>
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                              <span className="text-rose-400">PAUSED — NAME MISMATCH</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                              <span>{s.progress}% COMPLETE</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="space-y-1 mb-4">
                        <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-cyan-500/20">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              s.isDocumentsRequested
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                                : "bg-gradient-to-r from-cyan-500 to-blue-500"
                            )}
                            style={{ width: `${s.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-cyan-300/70 px-0.5">
                          <span>0%</span>
                          <span className="font-extrabold text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.2 rounded-full">{s.progress >= 100 ? "100% Complete" : (s.stepDescription || `${s.progress}% Active Stage`)}</span>
                          <span className="text-cyan-400">100%</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                        {PIPELINE.map((p, i) => {
                          const isDone = i <= s.stageIndex;
                          return (
                            <div
                              key={p.key}
                              className={cn(
                                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold border transition-all flex-1 min-w-[100px] justify-center",
                                isDone ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-200" : "bg-slate-950/60 border-white/5 text-slate-600"
                              )}
                            >
                              <CheckCircle2 className={cn("h-3 w-3 flex-none", isDone ? "text-cyan-400" : "text-slate-700")} />
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
                              <p className="text-xs text-cyan-200/80">
                                We detected incomplete information in your claim upload. Please upload the following items to resume analysis:
                              </p>
                              <ul className="list-disc list-inside pl-1.5 text-xs font-medium space-y-0.5 mt-1 text-amber-200">
                                {s.missingGroups.map((grp: string) => (
                                  <li key={grp}>{grp}</li>
                                ))}
                              </ul>
                              <div className="mt-3 flex items-center gap-3">
                                <label className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm cursor-pointer hover:opacity-90">
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
                        <div className="mt-4 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 animate-fade-in text-left">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1 w-full font-sans">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">Patient Name Mismatch Detected</h4>
                              <p className="text-xs text-rose-200/85 leading-relaxed">
                                {s.nameMismatchWarning}
                              </p>
                              <div className="mt-3 flex items-center gap-3">
                                <label className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm cursor-pointer hover:opacity-90">
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
                    </div>
                  </StaggerItem>

                  <StaggerItem index={4}>
                    <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-4 shadow-xl shadow-cyan-500/5 backdrop-blur-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-sm font-bold text-white">Auditor Workspace &amp; Document Preview</h2>
                          <p className="text-[11px] text-cyan-300/60">Extracted data &amp; bounding box highlights for selected claim.</p>
                        </div>
                        {!s.isDocumentsRequested && (
                          <Button onClick={s.openReportModal} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white h-9 px-4 rounded-xl shadow-md border border-cyan-400/30 cursor-pointer">
                            <FileText className="mr-1.5 h-3.5 w-3.5" /> Full Audit Report
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-cyan-500/20 bg-slate-950 p-2 overflow-hidden min-h-[380px] flex flex-col">
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

                        <div className="space-y-3 rounded-xl border border-cyan-500/20 bg-slate-950/80 p-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-cyan-500/20 pb-2">Patient Metadata</h3>

                          <div key={`${s.claimId || 'default-aurora'}-${s.previewVersion}`} className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-[10px] font-medium text-cyan-300/60">Patient Name</p>
                              <p className="font-bold text-white mt-0.5 bg-slate-900 p-2 rounded-lg border border-cyan-500/10">{s.patientName}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-cyan-300/60">Hospital</p>
                              <p className="font-bold text-white mt-0.5 bg-slate-900 p-2 rounded-lg border border-cyan-500/10 truncate">{s.hospitalName}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-cyan-300/60">Admission Date</p>
                              <p className="font-semibold text-slate-300 mt-0.5 bg-slate-900 p-2 rounded-lg border border-cyan-500/10">{s.admissionDate}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-cyan-300/60">Discharge Date</p>
                              <p className="font-semibold text-slate-300 mt-0.5 bg-slate-900 p-2 rounded-lg border border-cyan-500/10">{s.dischargeDate}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-[10px] font-medium text-cyan-300/60">Diagnosis</p>
                              <p className="font-semibold text-cyan-300 mt-0.5 bg-slate-900 p-2 rounded-lg border border-cyan-500/10 truncate">{s.diagnosis}</p>
                            </div>
                          </div>

                          <div className="pt-2">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="font-bold text-white uppercase tracking-wider text-[11px]">Itemized Expenses</span>
                              <span className="text-[10px] text-cyan-300/60">Hover row to locate in document</span>
                            </div>
                            <div className="overflow-x-auto rounded-lg border border-cyan-500/20 bg-slate-900">
                              <table className="w-full text-left text-[11px]">
                                <thead className="border-b border-cyan-500/20 text-cyan-300/70 uppercase bg-slate-950/90 text-[10px]">
                                  <tr>
                                    <th className="py-1.5 px-2.5">Category</th>
                                    <th className="py-1.5 px-2.5">Description</th>
                                    <th className="py-1.5 px-2.5 text-right">Amount</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-cyan-500/10">
                                  {s.lineItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-cyan-500/15 cursor-pointer transition-colors">
                                      <td className="py-1.5 px-2.5 font-semibold text-slate-200">{item.category}</td>
                                      <td className="py-1.5 px-2.5 text-slate-400 truncate max-w-[120px]">{item.description}</td>
                                      <td className="py-1.5 px-2.5 text-right font-bold text-cyan-400">{formatINR(item.amount)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="border-t border-cyan-500/20 font-bold bg-slate-950/95 text-xs">
                                    <td colSpan={2} className="py-2 px-2.5 text-white">Total Claim Amount</td>
                                    <td className="py-2 px-2.5 text-right text-cyan-400">{formatINR(s.total)}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                </>
              )}
            </div>
          </div>
        </StaggerContainer>
      </main>

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
      <UserProfileModal isOpen={s.showProfileModal} onClose={s.closeProfileModal} s={s} userName={s.userName} userEmail={s.userEmail} variant="neon" />

      {/* Slide-out Sidebar Navigation Drawer */}
      <HamburgerMenuDrawer isOpen={s.showMenuDrawer} onClose={s.closeMenuDrawer} s={s} userName={s.userName} userEmail={s.userEmail} onOpenProfile={s.openProfileModal} variant="neon" />

      {s.duplicateClaimId && (
        <DuplicateClaimModal
          isOpen={!!s.duplicateClaimId}
          onClose={() => {
            s.setDuplicateClaimId(null);
            s.resetState();
          }}
          onConfirm={() => {
            const targetId = s.duplicateClaimId;
            s.setDuplicateClaimId(null);
            if (targetId) {
              s.selectClaim(targetId);
            }
          }}
        />
      )}
    </div>
  );
}
