'use client';

import { useDesign } from '@/components/claimgpt/design-context';
import { RegisterAurora } from '@/components/claimgpt/register-aurora';
import { RegisterClinical } from '@/components/claimgpt/register-clinical';
import { RegisterLedger } from '@/components/claimgpt/register-ledger';

export default function RegisterPage() {
  const { design } = useDesign();

  if (design === 'clinical') return <RegisterClinical />;
  if (design === 'ledger') return <RegisterLedger />;
  return <RegisterAurora />;
}
