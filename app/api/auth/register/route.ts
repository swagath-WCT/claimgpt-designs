import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RegisterBody {
  username: string;
  password_hash?: string;
  role: 'patient' | 'tpa';
  first_name?: string;
  last_name?: string;
  phone?: string;
  organization?: string;
  employee_id?: string;
  dob?: string;
  gender?: string;
  policy?: string;
  sum_insured?: string | number;
}

const INGRESS_BASE = process.env.INGRESS_API || process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8001';

async function proxyToIngress(path: string, body?: unknown) {
  const url = `${INGRESS_BASE}${path}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterBody;

    if (!body?.username || !body?.role || !(body.password_hash && body.password_hash.trim())) {
      return NextResponse.json({ error: 'Missing required registration fields.' }, { status: 400 });
    }

    // Build payload for ingress service to create local user/profile records
    const profilePayload: Record<string, unknown> = {
      provider: 'local',
      username: body.username,
      password_hash: body.password_hash,
      role: body.role === 'patient' ? 'submitter' : 'reviewer',
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone,
      organization: body.organization,
      employee_id: body.employee_id,
      dob: body.dob,
      gender: body.gender,
      policy: body.policy,
      sum_insured: body.sum_insured,
    };

    const { res, data } = await proxyToIngress('/auth/register', profilePayload);
    if (!res.ok) {
      const msg =
        typeof (data as any).detail === 'string'
          ? (data as any).detail
          : typeof (data as any).error === 'string'
            ? (data as any).error
            : typeof (data as any).message === 'string'
              ? (data as any).message
              : 'Ingress registration failed.';
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    return NextResponse.json({ success: true, detail: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Registration failed.' }, { status: 500 });
  }
}
