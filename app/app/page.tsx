'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDesign } from '@/components/claimgpt/design-context';
import { DashboardAurora } from '@/components/claimgpt/dashboard-aurora';
import { DashboardClinical } from '@/components/claimgpt/dashboard-clinical';
import { DashboardLedger } from '@/components/claimgpt/dashboard-ledger';
import { getStoredAuthSession } from '@/lib/auth';

export default function AppPage() {
  const router = useRouter();
  const { design } = useDesign();

  useEffect(() => {
    if (!getStoredAuthSession()) {
      router.replace('/login');
    }
  }, [router]);

  if (design === 'clinical') return <DashboardClinical />;
  if (design === 'ledger') return <DashboardLedger />;
  return <DashboardAurora />;
}
