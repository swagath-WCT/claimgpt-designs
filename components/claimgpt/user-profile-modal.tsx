'use client';

import { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  FileText,
  X,
  Mail,
  CreditCard,
  Users,
  CheckCircle2,
  ChevronRight,
  Copy,
  Check,
  Calendar,
  Phone,
  Building2,
  IndianRupee,
} from 'lucide-react';
import { type AuditorState } from '@/components/claimgpt/use-auditor-state';
import { formatINR } from '@/lib/claimgpt-data';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  s: AuditorState;
  userName: string;
  userEmail: string;
}

export function UserProfileModal({
  isOpen,
  onClose,
  s,
  userName,
  userEmail,
}: UserProfileModalProps) {
  const [copied, setCopied] = useState(false);
  const [userMeta, setUserMeta] = useState({
    dob: '19 Aug 1990',
    gender: 'Male',
    insurer: 'Star Health',
    policyNo: 'P-0007401',
    sumInsured: '₹5,000,000',
  });

  useEffect(() => {
    try {
      const dob = localStorage.getItem('claimgpt_user_dob');
      const insurer = localStorage.getItem('claimgpt_user_insurer');
      const policy = localStorage.getItem('claimgpt_user_policy');
      const sum = localStorage.getItem('claimgpt_user_sum');
      if (dob) setUserMeta(prev => ({ ...prev, dob }));
      if (insurer) setUserMeta(prev => ({ ...prev, insurer }));
      if (policy) setUserMeta(prev => ({ ...prev, policyNo: policy }));
      if (sum) setUserMeta(prev => ({ ...prev, sumInsured: `₹${Number(sum).toLocaleString('en-IN')}` }));
    } catch {
      /* ignore localStorage error */
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate 2-letter initials (e.g. Kareem Rossi -> KR, Swagath -> SW, Nivas -> NV)
  const nameParts = userName.trim().split(' ');
  const initials = nameParts.length >= 2
    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    : userName.slice(0, 2).toUpperCase();

  const handleCopyPolicy = () => {
    try {
      navigator.clipboard.writeText(userMeta.policyNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  };

  // Compute family member / patient claim list under this account
  const accountClaims = s.recentClaims.length > 0
    ? s.recentClaims
    : [
        {
          id: s.claimId || 'CLM-18091900',
          patient_name: s.patientName || 'Suresh',
          status: 'COMPLETED',
          created_at: 'Today',
          total_amount: s.total ? formatINR(s.total) : '₹12,500',
        },
      ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-0 sm:block overflow-hidden text-slate-100">
      {/* Click outside backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose} 
      />

      {/* Profile Card: Responsive Centered Modal on Mobile (< sm), Anchored Dropdown on Desktop (sm+) */}
      <div className="relative w-full max-w-[360px] sm:max-w-none sm:absolute sm:top-16 sm:right-6 z-[101] sm:w-[380px] max-h-[82vh] sm:max-h-[85vh] flex flex-col rounded-3xl border border-teal-500/30 bg-gradient-to-b from-[#183935] via-[#122e2b] to-[#0c201d] text-white shadow-2xl shadow-teal-950/90 overflow-hidden animate-scale-in sm:animate-slide-down">
        
        {/* Top Header Pill Bar */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-0.5 text-xs font-semibold text-teal-100 backdrop-blur-md">
            <User className="h-3.5 w-3.5 text-teal-300" />
            <span>Patient Profile</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-teal-200 hover:bg-white/15 transition-colors"
            title="Close profile"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-4 py-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
          
          {/* Main User Banner */}
          <div className="flex items-start gap-3 pt-0.5">
            {/* Big Initials Box */}
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-none items-center justify-center rounded-2xl bg-teal-500/20 border border-teal-400/30 text-lg sm:text-xl font-bold tracking-wider text-teal-100 shadow-inner">
              {initials}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">{userName}</h2>
              
              {/* Badges row */}
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] sm:text-[11px]">
                {/* Policy ID with copy */}
                <button
                  type="button"
                  onClick={handleCopyPolicy}
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-2 py-0.5 font-medium text-teal-100 transition-colors"
                  title="Copy Policy Number"
                >
                  <span>{userMeta.policyNo}</span>
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-teal-300" />}
                </button>

                {/* Gender */}
                <span className="rounded-full bg-white/10 border border-white/15 px-2 py-0.5 font-medium text-teal-200">
                  {userMeta.gender}
                </span>

                {/* Status tag */}
                <span className="rounded-full bg-teal-400/20 border border-teal-400/40 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-teal-300">
                  ACTIVE POLICY
                </span>
              </div>
            </div>
          </div>

          {/* 2-Column Grid of Registration Fields ONLY */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* EMAIL ADDRESS / CONTACT */}
            <div className="col-span-2 rounded-2xl bg-white/5 border border-white/10 p-2.5 space-y-0.5 backdrop-blur-md">
              <span className="text-[9px] font-bold text-teal-300/80 uppercase tracking-wider flex items-center gap-1">
                <Mail className="h-3 w-3 text-teal-400" /> EMAIL ADDRESS / CONTACT
              </span>
              <p className="font-bold text-white truncate text-xs">{userEmail}</p>
            </div>

            {/* DATE OF BIRTH */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-2.5 space-y-0.5 backdrop-blur-md">
              <span className="text-[9px] font-bold text-teal-300/80 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3 text-teal-400" /> DATE OF BIRTH
              </span>
              <p className="font-bold text-white truncate text-xs">{userMeta.dob}</p>
            </div>

            {/* GENDER */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-2.5 space-y-0.5 backdrop-blur-md">
              <span className="text-[9px] font-bold text-teal-300/80 uppercase tracking-wider flex items-center gap-1">
                <User className="h-3 w-3 text-teal-400" /> GENDER
              </span>
              <p className="font-bold text-teal-200 truncate text-xs">{userMeta.gender}</p>
            </div>

            {/* INSURER PROVIDER */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-2.5 space-y-0.5 backdrop-blur-md">
              <span className="text-[9px] font-bold text-teal-300/80 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="h-3 w-3 text-teal-400" /> INSURER
              </span>
              <p className="font-bold text-white truncate text-xs">{userMeta.insurer}</p>
            </div>

            {/* POLICY NUMBER */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-2.5 space-y-0.5 backdrop-blur-md">
              <span className="text-[9px] font-bold text-teal-300/80 uppercase tracking-wider flex items-center gap-1">
                <CreditCard className="h-3 w-3 text-teal-400" /> POLICY NO.
              </span>
              <p className="font-bold text-white truncate text-xs">{userMeta.policyNo}</p>
            </div>

            {/* SUM INSURED (INR) */}
            <div className="col-span-2 rounded-2xl bg-white/5 border border-white/10 p-2.5 space-y-0.5 backdrop-blur-md">
              <span className="text-[9px] font-bold text-teal-300/80 uppercase tracking-wider flex items-center gap-1">
                <IndianRupee className="h-3 w-3 text-teal-400" /> SUM INSURED (INR)
              </span>
              <p className="font-bold text-emerald-300 text-xs sm:text-sm truncate">{userMeta.sumInsured}</p>
            </div>
          </div>

          {/* Family & Account Member Claims Submissions */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-teal-200 uppercase tracking-wider text-[10px]">
                Submissions under {userName}&apos;s Account
              </span>
              <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[9px] font-bold text-teal-300 border border-teal-500/30">
                {accountClaims.length} Claims
              </span>
            </div>

            <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
              {accountClaims.map((claim, idx) => (
                <div
                  key={claim.id || idx}
                  onClick={() => {
                    s.selectClaim(claim.id);
                    onClose();
                  }}
                  className="flex items-center justify-between rounded-xl bg-white/5 p-2 border border-white/10 hover:border-teal-400/40 hover:bg-white/10 transition-all cursor-pointer group text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-bold text-white truncate">
                        Patient: {claim.patient_name || 'Suresh'}
                      </p>
                      {claim.patient_name && claim.patient_name.toLowerCase() !== userName.toLowerCase() && (
                        <span className="rounded bg-purple-500/30 text-purple-200 border border-purple-400/30 px-1 py-0.2 text-[8px] font-bold uppercase">
                          Family
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-teal-200/70 truncate mt-0.5">
                      ID: {claim.id.slice(0, 8)}... &bull; {claim.total_amount || '₹12,500'}
                    </p>
                  </div>

                  <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5 flex-none">
                    <CheckCircle2 className="h-3 w-3" /> Done
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Mobile dismissal button */}
        <div className="p-3 border-t border-white/10 bg-white/5 sm:hidden">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-teal-600/80 hover:bg-teal-500 py-2 text-xs font-semibold text-white transition-all shadow-md"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
}
