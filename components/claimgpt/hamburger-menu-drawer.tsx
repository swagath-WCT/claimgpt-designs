'use client';

import { useState } from 'react';
import {
  Menu,
  X,
  User,
  LayoutDashboard,
  ShieldAlert,
  FileText,
  HeartHandshake,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Crown,
  Zap,
} from 'lucide-react';
import { type AuditorState } from '@/components/claimgpt/use-auditor-state';
import { useRouter } from 'next/navigation';

interface HamburgerMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  s: AuditorState;
  userName: string;
  userEmail: string;
  onOpenProfile: () => void;
  variant?: 'neon' | 'clinical' | 'executive';
}

export function HamburgerMenuDrawer({
  isOpen,
  onClose,
  s,
  userName,
  userEmail,
  onOpenProfile,
  variant = 'neon',
}: HamburgerMenuDrawerProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const initial = userName ? userName.charAt(0).toUpperCase() : 'U';

  const handleLogout = () => {
    try {
      localStorage.removeItem('claimgpt_user_name');
      localStorage.removeItem('claimgpt_user_email');
    } catch {
      /* ignore */
    }
    onClose();
    router.push('/login');
  };

  /* Theme-specific styles matching Design 1 (neon), Design 2 (clinical), and Design 3 (executive) */
  const themeStyles = {
    neon: {
      drawerBg: 'bg-[#090e1a]/95 border-r border-cyan-500/30 text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.15)]',
      headerBg: 'bg-cyan-950/40 border-b border-cyan-500/20',
      brandIcon: 'bg-gradient-to-tr from-cyan-500 to-purple-600 text-white border border-cyan-400/40 shadow-lg shadow-cyan-500/20',
      brandTag: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
      subtitle: 'text-cyan-300/70',
      userTile: 'bg-cyan-950/30 border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-950/50',
      userAvatar: 'bg-gradient-to-tr from-cyan-500 to-purple-600 text-white',
      activePill: 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm',
      activeTag: 'bg-cyan-400 text-slate-950',
      navText: 'text-slate-300 hover:bg-cyan-500/10 hover:text-white',
      iconColor: 'text-cyan-400',
      riskBadge: 'bg-cyan-400 text-slate-950',
      divider: 'border-cyan-500/20',
      closeBtn: 'text-cyan-300 hover:bg-cyan-500/20 hover:text-white',
      footerBg: 'bg-cyan-950/40 border-t border-cyan-500/20 text-cyan-300/70',
      brandTitle: 'ClaimGPT',
    },
    clinical: {
      drawerBg: 'bg-white/95 border-r border-slate-200 text-slate-900 shadow-2xl',
      headerBg: 'bg-slate-50 border-b border-slate-200',
      brandIcon: 'bg-teal-600 text-white shadow-sm',
      brandTag: 'bg-teal-50 text-teal-700 border border-teal-200',
      subtitle: 'text-slate-500',
      userTile: 'bg-slate-50 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50',
      userAvatar: 'bg-teal-600 text-white',
      activePill: 'bg-teal-50 text-teal-800 font-bold border border-teal-200 shadow-sm',
      activeTag: 'bg-teal-600 text-white',
      navText: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      iconColor: 'text-teal-600',
      riskBadge: 'bg-teal-600 text-white font-bold',
      divider: 'border-slate-200',
      closeBtn: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
      footerBg: 'bg-slate-50 border-t border-slate-200 text-slate-500',
      brandTitle: 'ClaimGPT',
    },
    executive: {
      drawerBg: 'bg-[#060b18]/95 border-r border-amber-500/30 text-amber-50 shadow-[0_0_50px_rgba(245,158,11,0.15)]',
      headerBg: 'bg-amber-950/40 border-b border-amber-500/20',
      brandIcon: 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 border border-amber-400/40 font-bold shadow-lg shadow-amber-500/20',
      brandTag: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      subtitle: 'text-amber-300/70',
      userTile: 'bg-amber-950/30 border border-amber-500/20 hover:border-amber-400/50 hover:bg-amber-950/50',
      userAvatar: 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold',
      activePill: 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm',
      activeTag: 'bg-amber-400 text-slate-950',
      navText: 'text-slate-300 hover:bg-amber-500/10 hover:text-amber-200',
      iconColor: 'text-amber-400',
      riskBadge: 'bg-amber-400 text-slate-950 font-bold',
      divider: 'border-amber-500/20',
      closeBtn: 'text-amber-300 hover:bg-amber-500/20 hover:text-white',
      footerBg: 'bg-amber-950/40 border-t border-amber-500/20 text-amber-300/70',
      brandTitle: 'ClaimGPT',
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-[110] overflow-hidden font-sans">
      {/* Click-outside Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-out Sidebar Navigation Panel */}
      <div className={`absolute top-0 left-0 bottom-0 z-[111] w-72 sm:w-80 backdrop-blur-2xl flex flex-col animate-slide-right ${themeStyles.drawerBg}`}>
        
        {/* Drawer Header */}
        <div className={`p-5 flex items-center justify-between ${themeStyles.headerBg}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${themeStyles.brandIcon}`}>
              {variant === 'executive' ? <Crown className="h-5 w-5 fill-slate-950" /> : variant === 'neon' ? <Zap className="h-5 w-5 fill-white" /> : <ShieldCheck className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight flex items-center gap-1.5">
                {themeStyles.brandTitle} <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${themeStyles.brandTag}`}>PRO</span>
              </h2>
              <p className={`text-[11px] ${themeStyles.subtitle}`}>AI Medical Auditor</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${themeStyles.closeBtn}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Account Quick Tile */}
        <div 
          className={`p-3.5 mx-3 mt-3 rounded-2xl transition-all cursor-pointer group ${themeStyles.userTile}`}
          onClick={() => {
            onClose();
            onOpenProfile();
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl font-bold text-sm ${themeStyles.userAvatar}`}>
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{userName}</p>
                <p className={`text-[10px] truncate ${themeStyles.subtitle}`}>{userEmail}</p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 group-hover:translate-x-0.5 transition-transform ${themeStyles.iconColor}`} />
          </div>
        </div>

        {/* Navigation Menu List */}
        <div className="px-3 py-4 space-y-1.5 flex-1 overflow-y-auto scrollbar-thin">
          <p className={`px-3 pb-1 text-[10px] font-bold uppercase tracking-wider ${themeStyles.subtitle}`}>Navigation Menu</p>

          {/* Item 1: Profile */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all text-xs group ${themeStyles.activePill}`}
          >
            <div className="flex items-center gap-3">
              <User className={`h-4 w-4 ${themeStyles.iconColor}`} />
              <span>Profile</span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${themeStyles.activeTag}`}>View</span>
          </button>

          {/* Item 2: Home */}
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/app');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs ${themeStyles.navText}`}
          >
            <LayoutDashboard className={`h-4 w-4 ${themeStyles.iconColor}`} />
            <span>Home</span>
          </button>

          {/* Item 3: All Claims */}
          <button
            type="button"
            onClick={() => {
              onClose();
              const el = document.getElementById('processed-claims-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs ${themeStyles.navText}`}
          >
            <FileText className={`h-4 w-4 ${themeStyles.iconColor}`} />
            <span>All Claims</span>
          </button>

          <div className="pt-3 pb-1">
            <div className={`border-t ${themeStyles.divider}`} />
          </div>

          <p className={`px-3 pb-1 text-[10px] font-bold uppercase tracking-wider ${themeStyles.subtitle}`}>Account &amp; System</p>

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all text-xs font-medium"
          >
            <LogOut className="h-4 w-4 text-rose-500" />
            <span>Sign Out / Switch Account</span>
          </button>
        </div>

        {/* Drawer Footer */}
        <div className={`p-4 text-[11px] flex items-center justify-between ${themeStyles.footerBg}`}>
          <span>ClaimGPT v2.4</span>
          <span className="flex items-center gap-1 font-bold text-emerald-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online
          </span>
        </div>

      </div>
    </div>
  );
}
