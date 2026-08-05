import { NextRequest, NextResponse } from 'next/server';

interface RegisterBody {
  username: string;
  password: string;
  role: 'patient' | 'tpa';
}

function getKeycloakBaseUrl() {
  return (process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080').replace(/\/+$/, '');
}

function getRealm() {
  return process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'claimgpt';
}

async function getAdminAccessToken() {
  const adminUsername = process.env.KEYCLOAK_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';
  const clientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli';

  const response = await fetch(`${getKeycloakBaseUrl()}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: clientId,
      username: adminUsername,
      password: adminPassword,
      scope: 'openid',
    }),
  });

  const data = await response.json().catch(() => ({}));
  const accessTokenValue = (data as Record<string, unknown>).access_token;
  const accessToken = typeof accessTokenValue === 'string' ? accessTokenValue : undefined;

  if (!response.ok || !accessToken) {
    throw new Error('Unable to authenticate with Keycloak admin API.');
  }

  return accessToken;
}

async function ensureRealmRole(adminToken: string, roleName: string) {
  const response = await fetch(`${getKeycloakBaseUrl()}/admin/realms/${getRealm()}/roles/${roleName}`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  if (response.ok) {
    return;
  }

  if (response.status === 404) {
    const createResponse = await fetch(`${getKeycloakBaseUrl()}/admin/realms/${getRealm()}/roles`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: roleName }),
    });

    if (!createResponse.ok) {
      throw new Error('Unable to create the requested Keycloak role.');
    }
  }
}

async function getRoleRepresentation(adminToken: string, roleName: string) {
  const response = await fetch(`${getKeycloakBaseUrl()}/admin/realms/${getRealm()}/roles/${roleName}`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to fetch the Keycloak role representation.');
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterBody;

    if (!body?.username || !body?.password || !body?.role) {
      return NextResponse.json({ error: 'Missing required registration fields.' }, { status: 400 });
    }

    const adminToken = await getAdminAccessToken();
    const roleName: string = body.role === 'patient' ? 'patient' : 'tpa';

    await ensureRealmRole(adminToken, roleName);

    const createUserResponse = await fetch(`${getKeycloakBaseUrl()}/admin/realms/${getRealm()}/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: body.username,
        email: body.username,
        enabled: true,
        emailVerified: true,
        credentials: [
          {
            type: 'password',
            value: body.password,
            temporary: false,
          },
        ],
      }),
    });

    if (!createUserResponse.ok) {
      const message = await createUserResponse.text();
      return NextResponse.json({ error: message || 'Unable to create the Keycloak user.' }, { status: createUserResponse.status });
    }

    const location = createUserResponse.headers.get('location');
    const userId = location?.split('/').filter(Boolean).pop();

    if (!userId) {
      return NextResponse.json({ error: 'The Keycloak user was created but its ID could not be determined.' }, { status: 500 });
    }

    const roleRepresentation = await getRoleRepresentation(adminToken, roleName as string);

    const assignRoleResponse = await fetch(`${getKeycloakBaseUrl()}/admin/realms/${getRealm()}/users/${userId}/role-mappings/realm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([roleRepresentation]),
    });

    if (!assignRoleResponse.ok) {
      const message = await assignRoleResponse.text();
      return NextResponse.json({ error: message || 'The user was created but the role could not be assigned.' }, { status: assignRoleResponse.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Registration failed.' }, { status: 500 });
  }
}
