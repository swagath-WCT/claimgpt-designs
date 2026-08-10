import type { Metadata } from 'next';
import { RegisterOrganization } from '@/components/claimgpt/register-organization';

export const metadata: Metadata = {
  title: 'Add an Organization | ClaimGPT',
  description: 'Register your TPA or insurer organization to manage and review claims on ClaimGPT.',
};

export default function RegisterOrganizationPage() {
  return <RegisterOrganization />;
}