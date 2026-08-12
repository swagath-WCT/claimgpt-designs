import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = {
      username: body?.username,
      password: body?.password ?? body?.password_hash,
      password_hash: body?.password_hash,
      role: body?.role,
    };

    const urlsToTry = [
      'http://127.0.0.1:8001/auth/login',
      'http://127.0.0.1:8000/ingress/auth/login',
      `${(process.env.INGRESS_API || process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8001').replace(/\/+$/, '')}/auth/login`,
    ];

    let res: Response | null = null;
    let data: any = null;

    for (const url of urlsToTry) {
      try {
        const attempt = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (attempt.status !== 404) {
          res = attempt;
          data = await attempt.json().catch(() => ({}));
          break;
        }
      } catch {
        /* try next candidate */
      }
    }

    if (!res) {
      return NextResponse.json({ error: 'Unable to reach authentication service.' }, { status: 502 });
    }

    if (res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const detail = data?.detail;
    const errorMessage = typeof detail === 'string'
      ? detail
      : typeof detail?.message === 'string'
        ? detail.message
        : typeof data?.error === 'string'
          ? data.error
          : 'Login failed.';
    const actualRole = typeof detail?.actual_role === 'string'
      ? detail.actual_role
      : typeof data?.actual_role === 'string'
        ? data.actual_role
        : undefined;

    return NextResponse.json(
      { error: errorMessage, actual_role: actualRole },
      { status: res.status },
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Login failed.' }, { status: 500 });
  }
}
