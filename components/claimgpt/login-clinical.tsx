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
import { Button } from '@/components/ui/button';
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
  TiltCard,
} from '@/components/claimgpt/effects';
import { cn } from '@/lib/utils';
import { authenticateWithPassword, getAuthErrorField, type AuthErrorField } from '@/lib/auth';

type Role = 'patient' | 'tpa';

export function LoginClinical() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authErrorField, setAuthErrorField] = useState<AuthErrorField | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setAuthErrorField(null);

    const form = e.currentTarget;
    const identifier = (form.elements.namedItem('c-email') as HTMLInputElement | null)?.value || '';
    const password = (form.elements.namedItem('c-pw') as HTMLInputElement | null)?.value || '';

    if (!identifier || !password) {
      setErrorMessage('Please enter your email address and password.');
      setAuthErrorField(!identifier ? 'username' : 'password');
      setSubmitting(false);
      return;
    }

    try {
      const session = await authenticateWithPassword({ username: identifier, password, role });
      if (session) {
        router.replace('/app');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in.';
      setErrorMessage(message);
      setAuthErrorField(getAuthErrorField(message));
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-50">
      <AuroraBackground variant="light" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <StaggerContainer className="w-full max-w-5xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
            {/* Left info column */}
            <div className="lg:col-span-2 lg:flex lg:flex-col lg:justify-center">
              <StaggerItem index={0}>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-elevation-sm">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold tracking-tight">
                      ClaimGPT
                    </div>
                    <div className="text-xs font-medium uppercase tracking-wide text-accent">
                      Enterprise · India
                    </div>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem index={1} className="mt-8">
                <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground">
                  <GradientText>AI-powered claims</GradientText>
                  <br />
                  processing for India.
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  One unified workspace for OCR, coding, validation, TPA
                  submission, and audit.
                </p>
              </StaggerItem>

              <StaggerItem index={2} className="mt-6">
                <ul className="space-y-2.5">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent/15">
                        <svg className="h-3 w-3 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </StaggerItem>

              <StaggerItem index={3} className="mt-8">
                <div className="flex flex-wrap gap-2">
                  {TRUST_BADGES.map((b) => (
                    <span key={b} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/80 px-3 py-1.5 text-xs font-medium text-foreground/70 shadow-sm backdrop-blur-sm">
                      <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                      {b}
                    </span>
                  ))}
                </div>
              </StaggerItem>
            </div>

            {/* Right card */}
            <div className="lg:col-span-3">
              <StaggerItem index={2}>
                <TiltCard maxTilt={4} className="hidden lg:block">
                  <SpotlightCard className="glass border-white/40 p-6 shadow-elevation sm:p-8">
                    {renderCard()}
                  </SpotlightCard>
                </TiltCard>
                <SpotlightCard className="glass border-white/40 p-6 shadow-elevation sm:p-8 lg:hidden">
                  {renderCard()}
                </SpotlightCard>
              </StaggerItem>
            </div>
          </div>
        </StaggerContainer>
      </div>
    </main>
  );

  function renderCard() {
    return (
      <>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Sign in
          </h2>
          <LanguageSwitcher variant="dark" />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-muted/60 p-1">
          {(['patient', 'tpa'] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all tap-highlight-none',
                role === r
                  ? 'glass text-foreground shadow-elevation-sm'
                  : 'text-muted-foreground hover:text-foreground',
                authErrorField === 'role' ? 'border border-red-400 text-red-400' : ''
              )}
            >
              {r === 'patient' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
              {r === 'patient' ? 'User / Patient' : 'TPA Adjuster'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="c-email">
              {role === 'patient' ? 'Email Address or Mobile Number' : 'Work Email'}
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="c-email"
                type="text"
                inputMode="email"
                placeholder={
                  role === 'patient'
                    ? 'e.g. john@example.com or 9876543210'
                    : 'you@yourcompany.com'
                }
                className={cn(
                  'h-12 pl-10',
                  authErrorField === 'username' ? 'border-red-400 ring-red-400 focus-visible:ring-red-400' : ''
                )}
                required
              />
            </div>
          </div>

          {role === 'patient' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="c-pw">Password</Label>
                <button type="button" className="text-xs font-medium text-accent hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="c-pw"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn(
                    'h-12 pl-10 pr-10',
                    authErrorField === 'password' ? 'border-red-400 ring-red-400 focus-visible:ring-red-400' : ''
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorMessage}
            </p>
          ) : null}
          <MagneticButton
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-base font-semibold text-white shadow-elevation-sm"
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
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-transparent px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Or sign in with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SSOButton provider="google" />
          <SSOButton provider="microsoft" />
          <SSOButton provider="okta" />
          <SSOButton provider="saml" />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to ClaimGPT?{' '}
          <Link href="/register" className="font-semibold text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </>
    );
  }
}
