'use client';

import {
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
  Zap
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/claimgpt/language-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DocumentViewer } from '@/components/claimgpt/document-viewer';
import { ClaimReportModal } from '@/components/claimgpt/claim-report-modal';
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

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Animated Electric Cyan & Purple Cyber Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-500/15 blur-[140px] animate-pulse" />
        <div className="absolute top-[40%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Top Cyber Nav */}
      <header className="relative z-40 sticky top-0 border-b border-cyan-500/20 bg-[#030712]/80 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20">
              <Zap className="h-5 w-5 fill-white" />
            </div>
            <div>
              <span className="font-display text-lg font-extrabold tracking-tight text-white">ClaimGPT</span>
              <span className="ml-2 rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/40 tracking-wider uppercase">
                Neon Cyber Glass
              </span>
            </div>
          </div>
          <div className="relative ml-2 hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/60" />
            <Input placeholder="Search claims, hospital bills, ICD-10 codes…" className="h-10 border-cyan-500/30 bg-cyan-950/20 pl-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" />
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 sm:inline-flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              Cyber Queue: <CountUp end={3} />
            </span>
            <LanguageSwitcher variant="dark" />
            <button type="button" className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:text-white" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            </button>
            <Avatar className="h-9 w-9 border border-cyan-500/30">
              <AvatarFallback className="bg-gradient-to-tr from-cyan-500 to-blue-600 text-xs font-bold text-white">PT</AvatarFallback>
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
                <p className="mt-1 text-sm text-cyan-200/70">Upload hospital bills, discharge summaries &amp; diagnostic reports for AI-powered verification &amp; settlement.</p>
              </div>
            </div>
          </StaggerItem>

          {/* Responsive Desktop & Mobile Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:items-start">
            
            {/* Left Sidebar: Processed Claims History */}
            <StaggerItem index={1} className="hidden lg:block lg:col-span-1">
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-4 shadow-xl shadow-cyan-500/5 backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Processed Claims</h3>
                      <p className="text-[10px] text-cyan-300/70">Select claim to audit</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 border border-cyan-500/30">
                    {s.recentClaims.length || 1}
                  </span>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[720px] pr-1 scrollbar-thin">
                  {s.recentClaims.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => s.selectClaim(s.claimId || "")}
                      className="w-full rounded-xl border border-cyan-400/50 bg-cyan-500/20 p-3 text-left shadow-sm text-white"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold truncate text-white">{s.patientName}</p>
                        <span className="flex h-2 w-2 rounded-full bg-cyan-400 flex-none shadow-sm shadow-cyan-400" />
                      </div>
                      <p className="text-[10px] text-cyan-300/70 mt-1 truncate">
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
                              ? "border-cyan-400 bg-cyan-500/20 shadow-md font-bold text-white ring-1 ring-cyan-400" 
                              : "border-white/5 bg-slate-950/60 hover:bg-slate-900 text-slate-300"
                          )}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold truncate text-white">
                              {claim.patient_name && claim.patient_name !== "N/A" ? claim.patient_name : `Claim #${claim.id.slice(0, 6)}`}
                            </p>
                            {isSelected ? <span className="flex h-2 w-2 rounded-full bg-cyan-400 flex-none shadow-sm shadow-cyan-400" /> : null}
                          </div>
                          <p className="text-[10px] text-cyan-300/60 mt-1 truncate">
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
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-[11px] sm:text-xs font-bold text-white shadow-md shadow-cyan-500/20 h-8 px-3.5 rounded-xl flex-none border border-cyan-400/30"
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
                    <div className="mt-3 pt-3 border-t border-cyan-500/20 animate-fade-in">
                      {s.analyzing ? (
                        <div className="flex flex-col items-center justify-center p-6 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 text-center min-h-[180px] space-y-4 animate-fade-in">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-spin">
                            <Sparkles className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-white">AI Medical Engine Analyzing...</p>
                            <p className="text-xs font-semibold text-cyan-400 mt-1">{s.activeStage.toUpperCase()} STAGE ACTIVE ({s.progress}%)</p>
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
                            <Button onClick={s.openReportModal} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 w-full h-11 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 rounded-xl border border-cyan-400/30">
                              <FileText className="mr-2 h-4 w-4" /> View AI Post-Processing Audit Report
                            </Button>
                            <button 
                              type="button" 
                              onClick={() => s.resetState()} 
                              className="inline-flex items-center justify-center gap-1.5 text-xs text-cyan-300 hover:text-white underline pt-1"
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

                      {/* Staged files preview */}
                      {s.files.length > 0 && !s.analyzing && !s.isLiveSessionCompleted && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-300">
                            <span className="font-semibold text-white">Attached Files ({s.files.length})</span>
                            <button
                              type="button"
                              onClick={() => document.getElementById('aurora-upload')?.click()}
                              className="text-[11px] font-bold text-cyan-300 hover:text-white inline-flex items-center gap-1 underline"
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
                                <button type="button" onClick={() => s.removeFile(i)} className="text-slate-500 hover:text-rose-400 p-1">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <Button onClick={() => s.startClaimAnalysis()} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 w-full h-11 text-xs sm:text-sm font-bold text-white shadow-lg shadow-cyan-500/25 rounded-xl border border-cyan-400/30">
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
                <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-4 shadow-xl shadow-cyan-500/5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Processing Pipeline</span>
                      <p className="text-[10px] text-cyan-300/60">Claim ID: {s.claimId ? `${s.claimId.slice(0, 8)}...` : "CLM-2026-08842"}</p>
                    </div>
                    <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> 100% COMPLETE
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-cyan-500/20">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${s.progress}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-cyan-300/70 px-0.5">
                      <span>0%</span>
                      <span className="text-cyan-400">100%</span>
                    </div>
                  </div>

                  {/* 5-Step Pipeline Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                    {PIPELINE.map((p, i) => {
                      const isDone = i <= s.stageIndex;
                      return (
                        <div key={p.key} className={cn(
                          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold border transition-all flex-1 min-w-[100px] justify-center",
                          isDone ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-200" : "bg-slate-950/60 border-white/5 text-slate-600"
                        )}>
                          <CheckCircle2 className={cn("h-3 w-3 flex-none", isDone ? "text-cyan-400" : "text-slate-700")} />
                          <span className="truncate">{p.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </StaggerItem>

              {/* Claims Auditor Workspace & PDF Preview Area */}
              <StaggerItem index={4}>
                <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-4 shadow-xl shadow-cyan-500/5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-bold text-white">Auditor Workspace &amp; Document Preview</h2>
                      <p className="text-[11px] text-cyan-300/60">Extracted data &amp; bounding box highlights for selected claim.</p>
                    </div>
                    <Button onClick={s.openReportModal} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white h-9 px-4 rounded-xl shadow-md border border-cyan-400/30">
                      <FileText className="mr-1.5 h-3.5 w-3.5" /> Full Audit Report
                    </Button>
                  </div>

                  {/* Split View: Document Viewer + Metadata */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Left: Document Viewer */}
                    <div className="rounded-xl border border-cyan-500/20 bg-slate-950 p-2 overflow-hidden min-h-[380px] flex flex-col">
                      <DocumentViewer zoom={s.zoom} setZoom={s.setZoom} hoveredField={s.hoveredField} filename={s.files[0]?.name || (s.claimId ? `${s.claimId}.pdf` : 'hospital_bill_main.pdf')} />
                    </div>

                    {/* Right: Extracted Patient & Claim Metadata */}
                    <div className="space-y-3 rounded-xl border border-cyan-500/20 bg-slate-950/80 p-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-cyan-500/20 pb-2">Patient Metadata</h3>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
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

            </div>
          </div>
        </StaggerContainer>
      </main>

      {/* Post-Processing Audit Report Modal */}
      <ClaimReportModal s={s} />
    </div>
  );
}
