'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthRedirectPath, getStoredAuthSession } from '@/lib/auth';

export default function OrgReviewPage({ params }: { params: { orgSlug: string } }) {
  const router = useRouter();

  useEffect(() => {
    const session = getStoredAuthSession();

    if (!session) {
      router.replace('/login');
      return;
    }

    // Wrong role, or a reviewer trying to view a different org's dashboard —
    // send them back to wherever their own session actually belongs.
    if (session.accountRole !== 'reviewer' || session.organizationSlug !== params.orgSlug) {
      router.replace(getAuthRedirectPath(session));
    }
  }, [router, params.orgSlug]);

  // TODO: swap in the real reviewer dashboard component once designed,
  // e.g. <DashboardOrgReview orgSlug={params.orgSlug} />
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading review dashboard for {params.orgSlug}…</p>
    </div>
  );
}