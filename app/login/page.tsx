'use client';

import { useDesign } from '@/components/claimgpt/design-context';
import { LoginAurora } from '@/components/claimgpt/login-aurora';
import { LoginClinical } from '@/components/claimgpt/login-clinical';
import { LoginLedger } from '@/components/claimgpt/login-ledger';

export default function LoginPage() {
  const { design } = useDesign();

  if (design === 'clinical') return <LoginClinical />;
  if (design === 'ledger') return <LoginLedger />;
  return <LoginAurora />;
}
