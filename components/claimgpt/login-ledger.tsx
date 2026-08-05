'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/claimgpt/language-switcher';
import { SSOButton } from '@/components/claimgpt/sso-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FEATURES, TRUST_BADGES } from '@/lib/claimgpt-data';
import {
  AuroraBackground,
  GradientText,
  MagneticButton,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '@/components/claimgpt/effects';
import { cn } from '@/lib/utils';
import { authenticateWithPassword } from '@/lib/auth';

type Role = 'patient' | 'tpa';

export function LoginLedger() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const form = e.currentTarget;
    const identifier = (form.elements.namedItem('l-email') as HTMLInputElement | null)?.value || '';
    const password = (form.elements.namedItem('l-pw') as HTMLInputElement | null)?.value || '';

    if (!identifier || !password) {
      setErrorMessage('Please enter your email address and password.');
      setSubmitting(false);
      return;
    }

    try {
      const session = await authenticateWithPassword({ username: identifier, password, role });
      if (session) {
        router.replace('/app');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in.');
      setSubmitting(false);
    }
  };

  const inputCls =
    'h-12 border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-400';

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-900 text-slate-100">
      <AuroraBackground variant="dark" />
      <div className="grid-pattern absolute inset-0 opacity-20" aria-hidden />

      {/* Top bar */}
      <header className="relative z-10 border-b border-white/10 px-5 py-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-gradient text-white shadow-elevation-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="font-display text-lg font-semibold tracking-tight">
              ClaimGPT
              <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-teal-300">
                Enterprise · India
              </span>
            </div>
          </div>
          <LanguageSwitcher variant="light" />
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:py-20">
        <StaggerContainer>
          <StaggerItem index={0}>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
              <GradientText from="#10b981" to="#0d9488">
                AI-powered
              </GradientText>
              <br />
              claims processing
              <br />
              for India.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">
              One unified workspace for OCR, coding, validation, TPA
              submission, and audit.
            </p>
          </StaggerItem>

          <StaggerItem index={1} className="mt-8">
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((f) => (
                <SpotlightCard
                  key={f}
                  className="border-white/10 bg-white/5 p-3.5"
                  glowColor="rgba(16, 185, 129, 0.15)"
                >
                  <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-teal-400/15">
                    <svg className="h-3.5 w-3.5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-xs leading-snug text-slate-300">{f}</p>
                </SpotlightCard>
              ))}
            </div>
          </StaggerItem>

          <StaggerItem index={2} className="mt-8">
            <div className="flex flex-wrap gap-2">
              {TRUST_BADGES.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-300" />
                  {b}
                </span>
              ))}
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Right card */}
        <StaggerItem index={2}>
          <SpotlightCard
            className="glass-dark border-white/10 p-6 shadow-elevation sm:p-8"
            glowColor="rgba(16, 185, 129, 0.2)"
          >
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                Sign in to your workspace
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Choose your role and enter your credentials.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3">
              {(['patient', 'tpa'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border px-4 py-4 text-center transition-all tap-highlight-none',
                    role === r
                      ? 'border-teal-400 bg-teal-400/10 shadow-[0_0_30px_-8px_rgba(16,185,129,0.4)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  {r === 'patient' ? (
                    <User className={cn('h-6 w-6', role === r ? 'text-teal-300' : 'text-slate-400')} />
                  ) : (
                    <Building2 className={cn('h-6 w-6', role === r ? 'text-teal-300' : 'text-slate-400')} />
                  )}
                  <span className={cn('text-sm font-medium', role === r ? 'text-white' : 'text-slate-400')}>
                    {r === 'patient' ? 'User / Patient' : 'TPA Adjuster'}
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="l-email" className="text-slate-300">
                  {role === 'patient' ? 'Email Address or Mobile Number' : 'Work Email'}
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="l-email"
                    type="text"
                    inputMode="email"
                    placeholder={
                      role === 'patient'
                        ? 'e.g. john@example.com or 9876543210'
                        : 'you@yourcompany.com'
                    }
                    className={`${inputCls} pl-10`}
                    required
                  />
                </div>
              </div>

              {role === 'patient' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="l-pw" className="text-slate-300">
                      Password
                    </Label>
                    <button type="button" className="text-xs font-medium text-teal-300 hover:underline">
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      id="l-pw"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`${inputCls} pl-10 pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {errorMessage ? (
                <p className="rounded-lg border border-red-200/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {errorMessage}
                </p>
              ) : null}
              <MagneticButton
                type="submit"
                disabled={submitting}
                className="teal-gradient flex h-12 w-full items-center justify-center rounded-xl border-0 text-base font-semibold text-white shadow-elevation-sm"
              >
                {submitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    {role === 'patient' ? 'Sign In to Patient Portal' : 'Continue'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </MagneticButton>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="glass-dark px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Or sign in with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SSOButton provider="google" variant="dark" />
              <SSOButton provider="microsoft" variant="dark" />
              <SSOButton provider="okta" variant="dark" />
              <SSOButton provider="saml" variant="dark" />
            </div>

            <p className="mt-6 text-center text-sm text-slate-400">
              New to ClaimGPT?{' '}
              <Link href="/register" className="font-semibold text-teal-300 hover:underline">
                Create an account
              </Link>
            </p>
          </SpotlightCard>
        </StaggerItem>
      </div>
    </main>
  );
}
