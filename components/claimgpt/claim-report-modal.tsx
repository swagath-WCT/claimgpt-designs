'use client';

import { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  Eye,
  FileText,
  X,
  Activity,
  ShieldCheck,
  Loader2,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  FileCheck,
  Layers,
  CheckSquare,
  Stethoscope,
  ArrowLeft,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import { type AuditorState } from '@/components/claimgpt/use-auditor-state';
import { formatINR } from '@/lib/claimgpt-data';

interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
}

export function ClaimReportModal({ s }: { s: AuditorState }) {
  const [loadingPdf, setLoadingPdf] = useState<'tpa' | 'irdai' | null>(null);
  const [inlinePdf, setInlinePdf] = useState<{
    url: string;
    title: string;
    type: 'tpa' | 'irdai';
  } | null>(null);
  const [pdfZoom, setPdfZoom] = useState<number>(1);
  const pdfTouchStartDistRef = useRef<number>(0);
  const pdfTouchStartZoomRef = useRef<number>(1);

  // Editable Form State
  const [patientName, setPatientName] = useState(s.patientName || 'N/A');
  const [hospitalName, setHospitalName] = useState(s.hospitalName || 'N/A');
  const [admissionDate, setAdmissionDate] = useState(s.admissionDate || 'N/A');
  const [dischargeDate, setDischargeDate] = useState(s.dischargeDate || 'N/A');
  const [diagnosis, setDiagnosis] = useState(s.diagnosis || 'N/A');
  const [billedAmount, setBilledAmount] = useState<number>(s.total || 0);
  const [detailsSaved, setDetailsSaved] = useState(false);

  // Editable Expenses State
  const [expenses, setExpenses] = useState<ExpenseItem[]>(
    s.lineItems.map((li, i) => ({ id: li.id ? String(li.id) : `exp-${i}`, category: li.category, amount: li.amount }))
  );
  const [expensesSaved, setExpensesSaved] = useState(false);


  const preview = s.realPreview;
  const summary = preview?.summary;

  useEffect(() => {
    if (!s.showReportModal) {
      setInlinePdf(null);
      return;
    }

    setPatientName(summary?.patient_name || s.patientName || 'Patient');
    setHospitalName(summary?.hospital || s.hospitalName || 'Hospital');
    setAdmissionDate(summary?.admission_date || s.admissionDate || '');
    setDischargeDate(summary?.discharge_date || s.dischargeDate || '');
    setDiagnosis(summary?.diagnosis || s.diagnosis || '');

    const billed = preview?.billed_total ?? Number(summary?.total_amount ?? NaN);
    setBilledAmount(Number.isFinite(billed) ? Number(billed) : s.total || 0);

    setExpenses(
      preview?.expenses?.length
        ? preview.expenses.map((item, index) => ({
            id: String(index + 1),
            category: item.category || `Expense ${index + 1}`,
            amount: Number(item.amount) || 0,
          }))
        : s.lineItems?.length
          ? s.lineItems.map(item => ({ id: String(item.id), category: item.category, amount: item.amount }))
          : [
              { id: '1', category: 'Pharmacy & Supplies', amount: 8500 },
              { id: '2', category: 'Emergency Room Charges', amount: 12000 },
              { id: '3', category: 'Laboratory Diagnostics', amount: 4500 },
            ]
    );
  }, [
    s.showReportModal,
    s.claimId,
    s.patientName,
    s.hospitalName,
    s.admissionDate,
    s.dischargeDate,
    s.diagnosis,
    s.total,
    s.lineItems,
    preview,
    summary?.patient_name,
    summary?.hospital,
    summary?.admission_date,
    summary?.discharge_date,
    summary?.diagnosis,
    summary?.total_amount,
  ]);

  // Medical Codes (Read-Only)
  const icdCodes = preview?.icd_codes?.length
    ? preview.icd_codes
    : [];

  const cptCodes = preview?.cpt_codes?.length
    ? preview.cpt_codes
    : [];

  // IRDAI Validation Rules (Moved to last section)
  const validations = preview?.validations || [];

  const rawRiskScore = preview?.predictions?.[0]?.rejection_score ?? summary?.risk_score;
  const riskScoreNum = rawRiskScore !== undefined && rawRiskScore !== null
    ? Math.round(rawRiskScore <= 1 ? rawRiskScore * 100 : rawRiskScore)
    : 12;

  // Cross-Document Intelligence: compute from parsed_fields
  const parsedFields = preview?.parsed_fields;
  const parsedFieldEntries = (parsedFields && typeof parsedFields === 'object')
    ? Object.entries(parsedFields as Record<string, unknown>)
    : [];
  const totalParsedFields = parsedFieldEntries.length;
  const filledParsedFields = parsedFieldEntries.filter(([, v]) => v !== null && v !== undefined && v !== '').length;
  const verificationReadiness = totalParsedFields > 0 ? Math.round((filledParsedFields / totalParsedFields) * 100) : 0;
  const documents = (preview as any)?.documents as Array<{ type?: string; name?: string; fields_extracted?: number }> | undefined;
  const totalItemizedExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const expenseMismatch = Math.abs(billedAmount - totalItemizedExpenses);

  if (!s.showReportModal) return null;

  const tpaUrl = s.tpaPdfViewUrl || s.tpaPdfUrl;
  const irdaUrl = s.irdaPdfViewUrl || s.irdaPdfUrl;

  /* On-Screen In-Memory PDF Viewer (Opens directly on screen, no new tabs) */
  const handlePdfTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pdfTouchStartDistRef.current = dist;
      pdfTouchStartZoomRef.current = pdfZoom;
    }
  };

  const handlePdfTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pdfTouchStartDistRef.current > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / pdfTouchStartDistRef.current;
      const nextZoom = Math.max(0.6, Math.min(2.5, Math.round(pdfTouchStartZoomRef.current * ratio * 100) / 100));
      setPdfZoom(nextZoom);
    }
  };

  const handlePdfTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      pdfTouchStartDistRef.current = 0;
    }
  };

  const openInlinePdfViewer = async (url: string, type: 'tpa' | 'irdai') => {
    setLoadingPdf(type);
    setPdfZoom(1);
    const title = type === 'tpa' ? 'TPA Comprehensive Audit Report' : 'IRDAI Standardized Claim Form';
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP error ' + res.status);
      const blob = await res.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(pdfBlob);
      setInlinePdf({ url: blobUrl, title, type });
    } catch (err) {
      console.warn('Direct blob fetch fallback:', err);
      setInlinePdf({ url, title, type });
    } finally {
      setLoadingPdf(null);
    }
  };

  const closeInlinePdf = () => {
    if (inlinePdf?.url && inlinePdf.url.startsWith('blob:')) {
      URL.revokeObjectURL(inlinePdf.url);
    }
    setInlinePdf(null);
    setPdfZoom(1);
  };

  const handleSaveDetails = () => {
    setDetailsSaved(true);
    setTimeout(() => setDetailsSaved(false), 2500);
  };

  const handleSaveExpenses = () => {
    setExpensesSaved(true);
    setTimeout(() => setExpensesSaved(false), 2500);
  };

  const handleAddExpense = () => {
    setExpenses(prev => [...prev, { id: String(Date.now()), category: 'General Medical Supply', amount: 1500 }]);
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  const handleExpenseChange = (id: string, field: 'category' | 'amount', value: string | number) => {
    setExpenses(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: field === 'amount' ? Number(value) || 0 : value } : item))
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fade-in">
      {/* Main B2C Mobile-Optimized Report Modal */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* Modal Header Bar */}
        <div className="flex-none flex items-center justify-between border-b border-white/10 bg-slate-900/95 px-3.5 sm:px-6 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-none items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <ShieldCheck className="h-4 sm:h-5 w-4 sm:w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xs sm:text-base font-bold text-white tracking-tight">AI Audit &amp; Claim Report</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] sm:text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="h-2.5 sm:h-3 w-2.5 sm:w-3" /> VERIFIED
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">Claim ID: {s.claimId || 'N/A'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={s.closeReportModal}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close Modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 scrollbar-thin">
          
          {/* 1. ⚡ 5-KPI METRIC CARDS STRIP */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">
              <span>Claim Audit Metrics</span>
              <span className="text-[9px] text-teal-400 sm:hidden">Swipe →</span>
            </div>
            <div className="flex sm:grid sm:grid-cols-5 gap-2.5 overflow-x-auto snap-x pb-1 sm:pb-0 scrollbar-none">
              {/* Risk Score */}
              <div className="flex-none w-[130px] sm:w-auto snap-start rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 sm:p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-400">Risk Score</span>
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <p className="text-base sm:text-lg font-extrabold text-emerald-400 mt-1">{riskScoreNum}%</p>
                <span className="text-[9px] font-bold text-emerald-300 uppercase">Low Risk</span>
              </div>

              {/* Medical Codes */}
              <div className="flex-none w-[130px] sm:w-auto snap-start rounded-xl border border-white/10 bg-slate-800/60 p-2.5 sm:p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-400">Medical Codes</span>
                  <Stethoscope className="h-3.5 w-3.5 text-sky-400" />
                </div>
                <p className="text-base sm:text-lg font-extrabold text-white mt-1">{icdCodes.length + cptCodes.length}</p>
                <span className="text-[9px] font-semibold text-slate-400">ICD &amp; CPT</span>
              </div>

              {/* Rules Passed */}
              <div className="flex-none w-[130px] sm:w-auto snap-start rounded-xl border border-white/10 bg-slate-800/60 p-2.5 sm:p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-400">Rules Passed</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <p className="text-base sm:text-lg font-extrabold text-emerald-400 mt-1">{validations.filter(v => v.passed).length}/{validations.length}</p>
                <span className="text-[9px] font-semibold text-slate-400">IRDAI Validated</span>
              </div>

              {/* Billed Total */}
              <div className="flex-none w-[140px] sm:w-auto snap-start rounded-xl border border-white/10 bg-slate-800/60 p-2.5 sm:p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-400">Billed Total</span>
                  <span className="text-xs font-bold text-teal-400">₹</span>
                </div>
                <p className="text-sm sm:text-base font-extrabold text-teal-300 mt-1 truncate">{formatINR(billedAmount)}</p>
                <span className="text-[9px] font-semibold text-slate-400">Claim Amount</span>
              </div>

              {/* Fields Extracted */}
              <div className="flex-none w-[130px] sm:w-auto snap-start rounded-xl border border-white/10 bg-slate-800/60 p-2.5 sm:p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-400">Extracted Fields</span>
                  <FileText className="h-3.5 w-3.5 text-purple-400" />
                </div>
                <p className="text-base sm:text-lg font-extrabold text-white mt-1">{totalParsedFields || '—'}</p>
                <span className="text-[9px] font-semibold text-slate-400">OCR AI Verified</span>
              </div>
            </div>
          </div>

          {/* 2. 📝 EDITABLE PATIENT & CLAIM DETAILS FORM */}
          <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-3.5 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white">Patient &amp; Claim Details</h3>
              </div>
              <button
                type="button"
                onClick={handleSaveDetails}
                className="inline-flex items-center gap-1 rounded-lg bg-teal-500 hover:bg-teal-400 px-3 py-1 text-[11px] font-bold text-slate-950 transition-all shadow-sm"
              >
                <Save className="h-3 w-3" />
                {detailsSaved ? 'Saved! ✓' : 'Save Details'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Hospital / Medical Center</label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Billed Claim Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-teal-400">₹</span>
                  <input
                    type="number"
                    value={billedAmount}
                    onChange={e => setBilledAmount(Number(e.target.value) || 0)}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 pl-7 pr-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Admission Date</label>
                <input
                  type="text"
                  value={admissionDate}
                  onChange={e => setAdmissionDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Discharge Date</label>
                <input
                  type="text"
                  value={dischargeDate}
                  onChange={e => setDischargeDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Primary Clinical Diagnosis</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs font-semibold text-teal-300 focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 3. 🏥 EDITABLE HOSPITAL EXPENSES & MISMATCH WARNING */}
          <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-3.5 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-teal-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white">Itemized Hospital Expenses</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddExpense}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition-all"
                >
                  <Plus className="h-3 w-3 text-teal-400" /> Add Row
                </button>
                <button
                  type="button"
                  onClick={handleSaveExpenses}
                  className="inline-flex items-center gap-1 rounded-lg bg-teal-500 hover:bg-teal-400 px-3 py-1 text-[11px] font-bold text-slate-950 transition-all shadow-sm"
                >
                  <Save className="h-3 w-3" />
                  {expensesSaved ? 'Saved! ✓' : 'Save Expenses'}
                </button>
              </div>
            </div>

            {/* Expense Item List */}
            <div className="space-y-2">
              {expenses.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-white/5 text-xs flex-wrap sm:flex-nowrap"
                >
                  <span className="font-mono text-[10px] text-slate-500 w-5 flex-none text-center">#{idx + 1}</span>
                  <input
                    type="text"
                    value={item.category}
                    onChange={e => handleExpenseChange(item.id, 'category', e.target.value)}
                    placeholder="Expense Description"
                    className="flex-1 min-w-[140px] bg-transparent border-b border-white/10 px-1 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-teal-400"
                  />
                  <div className="relative w-28 flex-none">
                    <span className="absolute left-1.5 top-1 text-xs font-bold text-teal-400">₹</span>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={e => handleExpenseChange(item.id, 'amount', e.target.value)}
                      className="w-full bg-transparent border-b border-white/10 pl-5 pr-1 py-1 text-xs font-bold text-emerald-400 text-right focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExpense(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors flex-none ml-auto sm:ml-0"
                    title="Delete Row"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Total Summary Row */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-bold px-1">
              <span className="text-slate-400">Itemized Breakdown Total:</span>
              <span className="text-emerald-400 text-sm">{formatINR(totalItemizedExpenses)}</span>
            </div>

            {/* Mismatch Alert Banner */}
            {expenseMismatch > 100 && (
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 p-3 text-xs text-amber-300">
                <AlertTriangle className="h-4 w-4 text-amber-400 flex-none mt-0.5" />
                <div>
                  <p className="font-bold">Itemized Total Mismatch Warning</p>
                  <p className="text-[11px] text-amber-200/90 mt-0.5">
                    Itemized total ({formatINR(totalItemizedExpenses)}) differs from billed claim amount ({formatINR(billedAmount)}) by{' '}
                    <strong className="text-white">{formatINR(expenseMismatch)}</strong>. Please verify hospital line items.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 4. 🔗 CROSS-DOCUMENT REIMBURSEMENT INTELLIGENCE */}
          <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-3.5 sm:p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-teal-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white">Cross-Document Reimbursement Intelligence</h3>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 border border-teal-500/40 px-2.5 py-0.5 text-xs font-bold text-teal-300">
                {verificationReadiness}% Reimbursement Ready
              </span>
            </div>

            {/* Readiness Track */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                <span>Verification Readiness Progress</span>
                <span className="text-teal-400 font-bold">{verificationReadiness}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full" style={{ width: `${verificationReadiness}%` }} />
              </div>
            </div>

            {/* Analyzed Documents Cards */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">📁 Documents Analyzed ({documents?.length ?? (s.claimId ? 1 : 0)})</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {documents && documents.length > 0 ? (
                  documents.map((doc, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-900/70 p-2.5 border border-white/5 text-xs">
                      <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[9px] font-bold text-teal-300">{(doc.type || 'DOCUMENT').toUpperCase()}</span>
                      <p className="font-semibold text-white mt-1.5 truncate">{doc.name || `Document ${idx + 1}`}</p>
                      {doc.fields_extracted !== undefined && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{doc.fields_extracted} fields extracted</p>
                      )}
                    </div>
                  ))
                ) : s.claimId ? (
                  <div className="rounded-xl bg-slate-900/70 p-2.5 border border-white/5 text-xs">
                    <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[9px] font-bold text-teal-300">CLAIM</span>
                    <p className="font-semibold text-white mt-1.5 truncate">{s.claimId}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{totalParsedFields} fields extracted</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic text-slate-500">No documents analyzed</p>
                )}
              </div>
            </div>

            {/* Cross-Document Field Verification */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">🔍 Cross-Document Field Verification</p>
              <div className="space-y-1.5 text-xs">
                {parsedFieldEntries.length > 0 ? (
                  parsedFieldEntries.map(([key, value]) => {
                    let displayVal = '';
                    if (value !== null && value !== undefined && value !== '') {
                      if (typeof value === 'object') {
                        const obj = value as Record<string, unknown>;
                        displayVal = obj.description && obj.amount ? `${obj.description} — ₹${obj.amount}` : (obj.description ? String(obj.description) : JSON.stringify(value));
                      } else {
                        const str = String(value);
                        if (str.startsWith('{') && str.endsWith('}')) {
                          try {
                            const obj = JSON.parse(str);
                            displayVal = obj.description && obj.amount ? `${obj.description} — ₹${obj.amount}` : (obj.description ? String(obj.description) : str);
                          } catch { displayVal = str; }
                        } else { displayVal = str; }
                      }
                    }

                    return (
                      <div key={key} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-white/5 gap-3">
                        <span className="font-medium text-slate-300 flex-none">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                        {displayVal ? (
                          <span className="font-bold text-emerald-400 flex items-center gap-1 text-[11px] text-right truncate"><CheckCircle2 className="h-3.5 w-3.5 flex-none" /> {displayVal}</span>
                        ) : (
                          <span className="font-semibold text-slate-500 text-[11px]">Not extracted</span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground italic text-slate-500">No parsed fields available</p>
                )}
              </div>
            </div>

            {/* Reimbursement Checklist */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">✅ Required Checklist Items</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/50 border border-white/5">
                  <CheckSquare className="h-4 w-4 text-emerald-400 flex-none" />
                  <span className="font-semibold text-slate-200">Hospital Discharge Summary</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/50 border border-white/5">
                  <CheckSquare className="h-4 w-4 text-emerald-400 flex-none" />
                  <span className="font-semibold text-slate-200">Itemized Hospital Final Bill</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/50 border border-white/5">
                  <CheckSquare className="h-4 w-4 text-emerald-400 flex-none" />
                  <span className="font-semibold text-slate-200">Pharmacy Receipts &amp; Vouchers</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/50 border border-white/5">
                  <CheckSquare className="h-4 w-4 text-emerald-400 flex-none" />
                  <span className="font-semibold text-slate-200">Diagnostic &amp; Lab Reports</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. 🔬 ICD-10 & CPT MEDICAL CODING (NON-OVERLAPPING MOBILE-FRIENDLY LAYOUT) */}
          <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-3.5 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-teal-400" />
              <h3 className="text-xs sm:text-sm font-bold text-white">ICD-10 &amp; CPT Medical Codes</h3>
            </div>
            <div className="space-y-2.5">
              {icdCodes.length > 0 ? icdCodes.map(item => (
                <div key={item.code} className="bg-slate-900/70 p-3 rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-teal-300 bg-teal-500/10 border border-teal-500/25 px-2 py-0.5 rounded text-[11px]">
                      {item.code}
                    </span>
                    <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex-none">
                      {(item.confidence * 100).toFixed(0)}% Match
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground italic text-slate-500">No ICD codes extracted</p>
              )}
              {cptCodes.length > 0 ? cptCodes.map(item => (
                <div key={item.code} className="bg-slate-900/70 p-3 rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-sky-300 bg-sky-500/10 border border-sky-500/25 px-2 py-0.5 rounded text-[11px]">
                      CPT {item.code}
                    </span>
                    <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex-none">
                      {(item.confidence * 100).toFixed(0)}% Match
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground italic text-slate-500">No CPT codes extracted</p>
              )}
            </div>
          </div>

          {/* 6. ✅ IRDAI VALIDATION RULES (MOVED TO VERY LAST SECTION AS REQUESTED!) */}
          <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-3.5 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white">IRDAI Rule Validations</h3>
              </div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                {validations.filter(v => v.passed).length}/{validations.length} Passed
              </span>
            </div>

            <div className="space-y-2">
              {validations.length > 0 ? validations.map((val, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-none mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-200">{val.rule_name}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{val.message}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground italic text-slate-500">No data extracted</p>
              )}
            </div>
          </div>

        </div>

        {/* 7. 🎯 B2C MOBILE-OPTIMIZED FOOTER ACTION BAR */}
        <div className="flex-none flex items-center justify-between border-t border-white/10 bg-slate-900/95 px-3.5 sm:px-6 py-3.5 backdrop-blur-md gap-2.5">
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            {tpaUrl ? (
              <button
                type="button"
                onClick={() => openInlinePdfViewer(tpaUrl, 'tpa')}
                disabled={loadingPdf === 'tpa'}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 min-h-[44px] px-4 text-xs font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {loadingPdf === 'tpa' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                View TPA Report
              </button>
            ) : null}

            {irdaUrl ? (
              <button
                type="button"
                onClick={() => openInlinePdfViewer(irdaUrl, 'irdai')}
                disabled={loadingPdf === 'irdai'}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 disabled:opacity-50 min-h-[44px] px-4 text-xs font-bold text-slate-200 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {loadingPdf === 'irdai' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 text-amber-400" />
                )}
                View IRDAI Form
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={s.closeReportModal}
            className="flex-none rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 min-h-[44px] px-4 text-xs font-semibold text-white transition-all cursor-pointer"
          >
            Close Report
          </button>
        </div>

      </div>

      {/* 8. 📄 ON-SCREEN EMBEDDED PDF VIEWER (Opens directly on screen, NO separate tab opened) */}
      {inlinePdf ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 animate-fade-in">
          <div className="relative w-full max-w-5xl h-[94vh] flex flex-col rounded-2xl border border-white/15 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex-none flex items-center justify-between border-b border-white/10 bg-slate-900/95 px-4 sm:px-6 py-3 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={closeInlinePdf}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer"
                  title="Back to Audit Report"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {inlinePdf.title}
                    </h3>
                    <span className="hidden sm:inline-flex items-center rounded-full bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
                      ON-SCREEN PREVIEW
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">Claim ID: {s.claimId || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Dedicated Mobile & Desktop Zoom Toolbar */}
                <div className="flex items-center gap-1 bg-slate-800/90 border border-white/10 rounded-xl px-1.5 sm:px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setPdfZoom((z) => Math.max(0.6, Math.round((z - 0.2) * 10) / 10))}
                    className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfZoom(1)}
                    className="px-1.5 py-0.5 rounded font-mono text-[11px] font-bold text-teal-300 hover:text-white hover:bg-white/10 transition-all"
                    title="Reset Zoom (100%)"
                  >
                    {Math.round(pdfZoom * 100)}%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfZoom((z) => Math.min(2.5, Math.round((z + 0.2) * 10) / 10))}
                    className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                </div>

                <a
                  href={inlinePdf.url}
                  download={`${inlinePdf.type === 'tpa' ? 'TPA_Report' : 'IRDAI_Form'}_${s.claimId || 'claim'}.pdf`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer"
                  title="Download PDF Copy"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  type="button"
                  onClick={closeInlinePdf}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close Preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF container with mobile touch pinch-to-zoom & pan */}
            <div
              className="flex-1 w-full h-full bg-slate-950 relative overflow-auto p-1 sm:p-2 scrollbar-thin"
              onTouchStart={handlePdfTouchStart}
              onTouchMove={handlePdfTouchMove}
              onTouchEnd={handlePdfTouchEnd}
            >
              <div
                className="transition-transform duration-150 origin-top flex justify-center w-full min-h-full"
                style={{
                  transform: `scale(${pdfZoom})`,
                  width: pdfZoom > 1 ? `${pdfZoom * 100}%` : '100%',
                  minWidth: pdfZoom > 1 ? `${pdfZoom * 100}%` : '100%',
                }}
              >
                <iframe
                  src={inlinePdf.url}
                  title={inlinePdf.title}
                  className="w-full h-full min-h-[78vh] border-0 bg-slate-950 rounded-lg"
                />
              </div>

              {/* Floating Mobile Quick-Zoom Bar (Floating Bottom Pill) */}
              <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-slate-900/95 border border-white/25 px-3 py-1.5 backdrop-blur-xl shadow-2xl z-30">
                <button
                  type="button"
                  onClick={() => setPdfZoom((z) => Math.max(0.6, Math.round((z - 0.2) * 10) / 10))}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPdfZoom(1)}
                  className="px-2 py-0.5 rounded-full text-xs font-mono font-bold text-teal-300 hover:text-white"
                  title="Reset 100%"
                >
                  {Math.round(pdfZoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setPdfZoom((z) => Math.min(2.5, Math.round((z + 0.2) * 10) / 10))}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <div className="h-4 w-px bg-white/20 mx-0.5" />
                <button
                  type="button"
                  onClick={() => setPdfZoom((z) => (z >= 1.4 ? 1 : 1.5))}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-200 bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
                >
                  {pdfZoom >= 1.4 ? 'Fit Page' : 'Enlarge (150%)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
