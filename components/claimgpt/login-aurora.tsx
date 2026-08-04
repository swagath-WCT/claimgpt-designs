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
  MapPin,
  ShieldCheck,
  User,
} from 'lucide-react';
import { BrandPanel } from '@/components/claimgpt/brand-panel';
import { LanguageSwitcher } from '@/components/claimgpt/language-switcher';
import { SSOButton } from '@/components/claimgpt/sso-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AuroraBackground,
  GradientText,
  MagneticButton,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '@/components/claimgpt/effects';

type Role = 'patient' | 'tpa';

export function LoginAurora() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      router.push('/app');
    }, 500);
  };

  return (
    <main className="flex min-h-screen w-full bg-background">
      <div className="hidden w-1/2 lg:block">
        <BrandPanel />
      </div>
      <div className="relative flex w-full flex-col overflow-hidden lg:w-1/2">
        <AuroraBackground />
        <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-16">
          <StaggerContainer className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-elevation-sm">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="font-display text-lg font-semibold tracking-tight">
                  ClaimGPT
                </div>
              </div>
              <LanguageSwitcher variant="dark" />
            </div>
            <div className="mb-8 hidden justify-end lg:flex">
              <LanguageSwitcher variant="light" />
            </div>

            <StaggerItem index={0}>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to your{' '}
                <GradientText className="font-semibold">
                  ClaimGPT
                </GradientText>{' '}
                workspace to continue.
              </p>
            </StaggerItem>

            <StaggerItem index={1} className="mt-8">
              <Tabs
                value={role}
                onValueChange={(v) => setRole(v as Role)}
                className="w-full"
              >
                <TabsList className="glass grid h-12 w-full grid-cols-2">
                  <TabsTrigger value="patient" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">User / Patient</span>
                  </TabsTrigger>
                  <TabsTrigger value="tpa" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm">TPA Adjuster</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="patient" className="mt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="patient-id">Email Address or Mobile Number</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="patient-id"
                          type="text"
                          inputMode="email"
                          autoComplete="username"
                          placeholder="e.g. john@example.com or 9876543210"
                          className="h-12 pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="patient-pw">Password</Label>
                        <button type="button" className="text-xs font-medium text-accent hover:underline">
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="patient-pw"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="h-12 pl-10 pr-10"
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
                    <MagneticButton
                      type="submit"
                      disabled={submitting}
                      className="teal-gradient flex h-12 w-full items-center justify-center rounded-xl text-base font-semibold text-white shadow-elevation-sm"
                    >
                      {submitting ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          Sign In to Patient Portal
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </MagneticButton>
                  </form>
                </TabsContent>

                <TabsContent value="tpa" className="mt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="tpa-email">Work Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="tpa-email"
                          type="email"
                          autoComplete="work email"
                          placeholder="you@yourcompany.com"
                          className="h-12 pl-10"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        We&apos;ll send a secure sign-in link to your work email.
                      </p>
                    </div>
                    <MagneticButton
                      type="submit"
                      disabled={submitting}
                      className="teal-gradient flex h-12 w-full items-center justify-center rounded-xl text-base font-semibold text-white shadow-elevation-sm"
                    >
                      {submitting ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </MagneticButton>
                  </form>
                </TabsContent>
              </Tabs>
            </StaggerItem>

            <StaggerItem index={2} className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Or sign in with
                  </span>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <SSOButton provider="google" />
                <SSOButton provider="microsoft" />
                <SSOButton provider="okta" />
                <SSOButton provider="saml" />
              </div>
            </StaggerItem>

            <StaggerItem index={3} className="mt-8">
              <div className="text-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent"
                >
                  New to ClaimGPT?
                  <span className="font-semibold text-accent">Create an account</span>
                  <ArrowRight className="h-3.5 w-3.5 text-accent" />
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span aria-hidden>🇮🇳</span> IN · Mumbai
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </main>
  );
}
