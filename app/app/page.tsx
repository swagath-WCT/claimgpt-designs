'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardClinical } from '@/components/claimgpt/dashboard-clinical';
import { getStoredAuthSession } from '@/lib/auth';

export default function AppPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getStoredAuthSession()) {
      router.replace('/login');
    }
  }, [router]);

  return <DashboardClinical />;
}
