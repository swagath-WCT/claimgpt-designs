'use client';

import { useDesign } from '@/components/claimgpt/design-context';
import { DashboardAurora } from '@/components/claimgpt/dashboard-aurora';
import { DashboardClinical } from '@/components/claimgpt/dashboard-clinical';
import { DashboardLedger } from '@/components/claimgpt/dashboard-ledger';

export default function AppPage() {
  const { design } = useDesign();

  if (design === 'clinical') return <DashboardClinical />;
  if (design === 'ledger') return <DashboardLedger />;
  return <DashboardAurora />;
}
