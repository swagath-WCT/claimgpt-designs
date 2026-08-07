'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authenticateWithPassword, type AuthRole } from '@/lib/auth';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CreditCard,
  IndianRupee,
  Lock,
  Upload,
  User,
  UserCircle,
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/claimgpt/language-switcher';
import { SSOButton } from '@/components/claimgpt/sso-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { INSURERS } from '@/lib/claimgpt-data';
import { registerAndSignIn } from '@/lib/auth';
import {
  AuroraBackground,
  GradientText,
  MagneticButton,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '@/components/claimgpt/effects';

export function RegisterLedger() {
  const router = useRouter();
  const [role, setRole] = useState<AuthRole>('patient');
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const form = e.currentTarget;
    const email = (form.elements.namedItem('l-contact') as HTMLInputElement | null)?.value || '';
    const password = (form.elements.namedItem('l-pw') as HTMLInputElement | null)?.value || '';
    const confirmPassword = (form.elements.namedItem('l-confirmPw') as HTMLInputElement | null)?.value || '';

    if (!email || !password || !confirmPassword) {
      setErrorMessage('Please enter your email address and password.');
      setSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password confirmation does not match.');
      setSubmitting(false);
      return;
    }

    try {
      const passwordHash = await (globalThis as typeof globalThis & { crypto: Crypto }).crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(password),
      ).then((digest) => Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join(''));

      const payload: Record<string, unknown> = {
        username: email,
        password_hash: `sha256$${passwordHash}`,
        role,
        first_name: (form.elements.namedItem('l-firstName') as HTMLInputElement | null)?.value || undefined,
        last_name: (form.elements.namedItem('l-lastName') as HTMLInputElement | null)?.value || undefined,
        dob: (form.elements.namedItem('l-dob') as HTMLInputElement | null)?.value || undefined,
        gender: undefined,
        policy: (form.elements.namedItem('l-policy') as HTMLInputElement | null)?.value || undefined,
        sum_insured: (form.elements.namedItem('l-sumInsured') as HTMLInputElement | null)?.value || undefined,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof (data as any).error === 'string' ? (data as any).error : 'Unable to create the account.');
      }

      await authenticateWithPassword({ username: email, password, role });
      router.replace('/app');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to complete registration.');
      setSubmitting(false);
    }
  };

  const inputCls = 'h-11 border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-400';

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-900 text-slate-100">
      <AuroraBackground variant="dark" />
      <div className="grid-pattern absolute inset-0 opacity-20" aria-hidden />

      <header className="relative z-20 border-b border-white/10 px-5 py-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
          <LanguageSwitcher variant="light" />
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <StaggerContainer className="mx-auto max-w-3xl">
          <StaggerItem index={0}>
            <div className="mb-6 flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-md border border-teal-400/30 bg-teal-400/10 px-3 py-1.5 text-xs font-semibold text-teal-300">
                <UserCircle className="h-4 w-4" />
                Account Role: {role === 'patient' ? 'Patient / Submitter' : 'TPA / Reviewer'}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Create <GradientText from="#10b981" to="#0d9488">Account</GradientText>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Fill in your details below to register your account.
            </p>
          </StaggerItem>

          <StaggerItem index={1} className="mt-6">
            <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
              {(['patient', 'tpa'] as AuthRole[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${role === option ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {option === 'patient' ? 'Patient / Submitter' : 'TPA / Reviewer'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SSOButton provider="google" variant="dark" />
              <SSOButton provider="microsoft" variant="dark" />
              <SSOButton provider="okta" variant="dark" />
            </div>
          </StaggerItem>

          <StaggerItem index={2} className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="glass-dark px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Or register with email
                </span>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem index={3}>
            <SpotlightCard
              className="glass-dark mt-6 border-white/10 p-6 shadow-elevation sm:p-8"
              glowColor="rgba(16, 185, 129, 0.2)"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="l-firstName" className="text-slate-300">First Name</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input id="l-firstName" placeholder="e.g. John" className={`${inputCls} pl-10`} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="l-lastName" className="text-slate-300">Last Name</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input id="l-lastName" placeholder="e.g. Doe" className={`${inputCls} pl-10`} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="l-dob" className="text-slate-300">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input id="l-dob" type="text" placeholder="DD/MM/YYYY" className={`${inputCls} pl-10`} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Gender</Label>
                    <Select required>
                      <SelectTrigger className={`${inputCls} h-11`}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="l-contact" className="text-slate-300">Email Address or Mobile Number</Label>
                    <Input id="l-contact" type="text" inputMode="email" placeholder="e.g. john@example.com or 9876543210" className={inputCls} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Insurer Provider</Label>
                    <Select required>
                      <SelectTrigger className={`${inputCls} h-11`}>
                        <SelectValue placeholder="Select insurer" />
                      </SelectTrigger>
                      <SelectContent>
                        {INSURERS.map((ins) => (
                          <SelectItem key={ins} value={ins.toLowerCase().replace(/\s+/g, '-')}>
                            {ins}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="l-policy" className="text-slate-300">Policy Number</Label>
                    <div className="relative">
                      <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input id="l-policy" placeholder="e.g. POL-123456" className={`${inputCls} pl-10`} required />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="l-sumInsured" className="text-slate-300">Sum Insured (INR)</Label>
                    <div className="relative">
                      <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input id="l-sumInsured" type="number" min="0" placeholder="e.g. 500000" className={`${inputCls} pl-10`} required />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-slate-300">Upload Health Card / Policy Document (Optional)</Label>
                    <label
                      htmlFor="l-doc"
                      className="group mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-white/5 px-6 py-8 text-center transition-all hover:border-teal-400/50 hover:bg-teal-400/5 tap-highlight-none"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-400/15 text-teal-300 transition-transform group-hover:scale-110">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-100">
                          {fileName ?? 'Click to upload or drag & drop'}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Upload your Health ID Card or Policy Copy to auto-verify your coverage details. PDF, JPG, PNG accepted.
                        </p>
                      </div>
                      <input
                        id="l-doc"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                      />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="l-pw" className="text-slate-300">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input id="l-pw" type="password" placeholder="••••••••" className={`${inputCls} pl-10`} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="l-confirmPw" className="text-slate-300">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input id="l-confirmPw" type="password" placeholder="••••••••" className={`${inputCls} pl-10`} required />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox id="l-agree" checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5 border-white/20 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500" />
                  <Label htmlFor="l-agree" className="text-sm leading-relaxed text-slate-400">
                    I agree to the <span className="font-medium text-teal-300">Terms of Service</span>,{' '}
                    <span className="font-medium text-teal-300">Privacy Policy</span>, and{' '}
                    <span className="font-medium text-teal-300">DPDP Act 2023</span> data processing terms.
                  </Label>
                </div>

                {errorMessage ? (
                  <p className="rounded-lg border border-red-200/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {errorMessage}
                  </p>
                ) : null}
                <MagneticButton
                  type="submit"
                  disabled={submitting || !agree}
                  className="teal-gradient flex h-12 w-full items-center justify-center rounded-xl border-0 text-base font-semibold text-white shadow-elevation-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      Register Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </MagneticButton>
              </form>
            </SpotlightCard>
          </StaggerItem>

          <StaggerItem index={4} className="mt-6">
            <p className="text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-teal-300 hover:underline">
                Sign in
              </Link>
            </p>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </main>
  );
}
