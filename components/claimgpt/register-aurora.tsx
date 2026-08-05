'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerAndSignIn, type AuthRole } from '@/lib/auth';
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
import {
  AuroraBackground,
  GradientText,
  MagneticButton,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '@/components/claimgpt/effects';

import { syncUserToBackend } from '@/lib/api-client';

export function RegisterAurora() {
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
    const email = (form.elements.namedItem('contact') as HTMLInputElement | null)?.value || '';
    const password = (form.elements.namedItem('pw') as HTMLInputElement | null)?.value || '';
    const confirmPassword = (form.elements.namedItem('confirmPw') as HTMLInputElement | null)?.value || '';

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
      const session = await registerAndSignIn({ username: email, password, role });
      if (session) {
        router.replace('/app');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to complete registration.');
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100">
      <AuroraBackground variant="light" />
      <header className="relative z-20 sticky top-0 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
          <LanguageSwitcher variant="light" />
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <StaggerContainer className="mx-auto max-w-2xl">
          <StaggerItem index={0}>
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent">
                <UserCircle className="h-4 w-4" />
                Account Role: {role === 'patient' ? 'Patient / Submitter' : 'TPA / Reviewer'}
              </span>
            </div>
            <div className="text-center">
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Create <GradientText>Account</GradientText>
              </h1>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Fill in your details below to register your account.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem index={1} className="mt-8">
            <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-border bg-background/70 p-1">
              {(['patient', 'tpa'] as AuthRole[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${role === option ? 'bg-accent text-white' : 'text-muted-foreground hover:text-foreground'}`}
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

          <StaggerItem index={2} className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Or register with email
                </span>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem index={3}>
            <SpotlightCard className="mt-8 border-border bg-card p-6 shadow-elevation-sm sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="firstName" placeholder="e.g. John" className="h-11 pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="lastName" placeholder="e.g. Doe" className="h-11 pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="dob" type="text" placeholder="DD/MM/YYYY" className="h-11 pl-10" required />
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
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="contact">Email Address or Mobile Number</Label>
                    <Input id="contact" type="text" inputMode="email" placeholder="e.g. john@example.com or 9876543210" className="h-11" required />
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
                    <Label htmlFor="policy">Policy Number</Label>
                    <div className="relative">
                      <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="policy" placeholder="e.g. POL-123456" className="h-11 pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="sumInsured">Sum Insured (INR)</Label>
                    <div className="relative">
                      <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="sumInsured" type="number" min="0" placeholder="e.g. 500000" className="h-11 pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Upload Health Card / Policy Document (Optional)</Label>
                    <label
                      htmlFor="doc"
                      className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-8 text-center transition-all hover:border-accent/50 hover:bg-accent/5 tap-highlight-none"
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
                        id="doc"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                      />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pw">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="pw" type="password" placeholder="••••••••" className="h-11 pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPw">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="confirmPw" type="password" placeholder="••••••••" className="h-11 pl-10" required />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox id="agree" checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
                  <Label htmlFor="agree" className="text-sm leading-relaxed text-muted-foreground">
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
                  className="teal-gradient flex h-12 w-full items-center justify-center rounded-xl text-base font-semibold text-white shadow-elevation-sm disabled:opacity-50"
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
