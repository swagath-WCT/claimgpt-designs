'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthRedirectPath, getStoredAuthSession } from '@/lib/auth';

export default function OrgAdminPage({ params }: { params: { orgSlug: string } }) {
  const router = useRouter();

  useEffect(() => {
    const session = getStoredAuthSession();

    if (!session) {
      router.replace('/login');
      return;
    }

    // Wrong role, or an admin trying to view a different org's dashboard —
    // send them back to wherever their own session actually belongs.
    if (session.accountRole !== 'admin' || session.organizationSlug !== params.orgSlug) {
      router.replace(getAuthRedirectPath(session));
    }
  }, [router, params.orgSlug]);

  // TODO: swap in the real admin dashboard component once designed,
  // e.g. <DashboardOrgAdmin orgSlug={params.orgSlug} />
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading admin dashboard for {params.orgSlug}…</p>
    </div>
  );
}