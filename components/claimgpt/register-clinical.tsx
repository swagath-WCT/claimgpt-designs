'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authenticateWithPassword } from '@/lib/auth';
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
import { Button } from '@/components/ui/button';
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
import { registerAndSignIn, type AuthRole } from '@/lib/auth';
import {
  AuroraBackground,
  GradientText,
  MagneticButton,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '@/components/claimgpt/effects';

export function RegisterClinical() {
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
    const getValue = (id: string) =>
      (form.querySelector(`#${id}`) as HTMLInputElement | null)?.value ||
      (form.elements.namedItem(id) as HTMLInputElement | null)?.value || '';

    const email = getValue('c-contact');
    const password = getValue('c-pw');
    const confirmPassword = getValue('c-confirmPw');
    const firstName = getValue('c-firstName');
    const lastName = getValue('c-lastName');
    const fullName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
    const policy = getValue('c-policy');
    const sumInsured = getValue('c-sumInsured');
    const dob = getValue('c-dob');

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
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        dob: dob || undefined,
        gender: undefined,
        policy: policy || undefined,
        sum_insured: sumInsured || undefined,
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

      try {
        localStorage.setItem('claimgpt_user_name', fullName);
        localStorage.setItem('claimgpt_user_email', email);
        if (policy) localStorage.setItem('claimgpt_user_policy', policy);
        if (sumInsured) localStorage.setItem('claimgpt_user_sum', sumInsured);
        if (dob) localStorage.setItem('claimgpt_user_dob', dob);
      } catch {
        /* ignore */
      }

      await authenticateWithPassword({ username: email, password, role });
      router.replace('/app');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to complete registration.');
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-50">
      <AuroraBackground variant="light" />
      <header className="relative z-20 sticky top-0 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5 sm:px-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <LanguageSwitcher variant="light" />
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <StaggerContainer className="mx-auto max-w-2xl">
          <StaggerItem index={0}>
            <div className="mb-6 flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
                <UserCircle className="h-4 w-4" />
                {role === 'patient' ? 'Patient / Submitter' : 'TPA / Reviewer'}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Create <GradientText>Account</GradientText>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Fill in your details below to register your account.
            </p>
          </StaggerItem>

          <StaggerItem index={1} className="mt-6">
            <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-border bg-white/80 p-1">
              {(['patient', 'tpa'] as AuthRole[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${role === option ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {option === 'patient' ? 'Patient / Submitter' : 'TPA / Reviewer'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SSOButton provider="google" />
              <SSOButton provider="microsoft" />
              <SSOButton provider="okta" />
            </div>
          </StaggerItem>

          <StaggerItem index={2} className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-50 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Or register with email
                </span>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem index={3} className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal */}
              <SpotlightCard className="bg-white p-5 shadow-elevation-sm sm:p-6">
                <fieldset>
                  <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-accent">
                    Personal
                  </legend>
                  <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="c-firstName">First Name</Label>
                      <Input id="c-firstName" placeholder="e.g. John" className="h-11" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-lastName">Last Name</Label>
                      <Input id="c-lastName" placeholder="e.g. Doe" className="h-11" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-dob">Date of Birth</Label>
                      <div className="relative">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="c-dob" type="text" placeholder="DD/MM/YYYY" className="h-11 pl-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select required>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </fieldset>
              </SpotlightCard>

              {/* Contact + Coverage */}
              <SpotlightCard className="bg-white p-5 shadow-elevation-sm sm:p-6">
                <fieldset>
                  <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-accent">
                    Contact &amp; Coverage
                  </legend>
                  <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="c-contact">Email Address or Mobile Number</Label>
                      <Input id="c-contact" type="text" inputMode="email" placeholder="e.g. john@example.com or 9876543210" className="h-11" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Insurer Provider</Label>
                      <Select required>
                        <SelectTrigger className="h-11">
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
                      <Label htmlFor="c-policy">Policy Number</Label>
                      <div className="relative">
                        <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="c-policy" placeholder="e.g. POL-123456" className="h-11 pl-10" required />
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="c-sumInsured">Sum Insured (INR)</Label>
                      <div className="relative">
                        <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="c-sumInsured" type="number" min="0" placeholder="e.g. 500000" className="h-11 pl-10" required />
                      </div>
                    </div>
                  </div>
                </fieldset>
              </SpotlightCard>

              {/* Document */}
              <SpotlightCard className="bg-white p-5 shadow-elevation-sm sm:p-6">
                <fieldset>
                  <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-accent">
                    Document
                  </legend>
                  <Label className="mt-3">Upload Health Card / Policy Document (Optional)</Label>
                  <label
                    htmlFor="c-doc"
                    className="group mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-slate-50 px-6 py-8 text-center transition-all hover:border-accent/50 hover:bg-accent/5 tap-highlight-none"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform group-hover:scale-110">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {fileName ?? 'Click to upload or drag & drop'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Upload your Health ID Card or Policy Copy to auto-verify your coverage details. PDF, JPG, PNG accepted.
                      </p>
                    </div>
                    <input
                      id="c-doc"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                    />
                  </label>
                </fieldset>
              </SpotlightCard>

              {/* Security */}
              <SpotlightCard className="bg-white p-5 shadow-elevation-sm sm:p-6">
                <fieldset>
                  <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-accent">
                    Security
                  </legend>
                  <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="c-pw">Password</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="c-pw" type="password" placeholder="••••••••" className="h-11 pl-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-confirmPw">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="c-confirmPw" type="password" placeholder="••••••••" className="h-11 pl-10" required />
                      </div>
                    </div>
                  </div>
                </fieldset>
              </SpotlightCard>

              <div className="flex items-start gap-3">
                <Checkbox id="c-agree" checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
                <Label htmlFor="c-agree" className="text-sm leading-relaxed text-muted-foreground">
                  I agree to the <span className="font-medium text-accent">Terms of Service</span>,{' '}
                  <span className="font-medium text-accent">Privacy Policy</span>, and{' '}
                  <span className="font-medium text-accent">DPDP Act 2023</span> data processing terms.
                </Label>
              </div>

              {errorMessage ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {errorMessage}
                </p>
              ) : null}
              <MagneticButton
                type="submit"
                disabled={submitting || !agree}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-base font-semibold text-white shadow-elevation-sm disabled:opacity-50"
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
          </StaggerItem>

          <StaggerItem index={4} className="mt-6">
            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </main>
  );
}
