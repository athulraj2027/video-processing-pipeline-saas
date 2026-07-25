import jwt from 'jsonwebtoken';
import { PrismaClient } from '../services/tenant-service/src/generated/client/index.js';

const GATEWAY_URL = 'http://localhost:3000';
const JWT_SECRET = 'your_super_secret_jwt_signing_key_at_least_8_chars';

// Establish a direct Prisma client to seed/teardown relational data
const prisma = new PrismaClient();

// Generate mock JWTs for different roles/tenants
function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET);
}

const superAdminToken = generateToken({
  id: 'sa-user-1',
  role: 'super_admin',
  email: 'superadmin@saasplatform.com',
});

let tenantId = 'temp-id';

function getTenantAdminToken() {
  return generateToken({
    id: 'ta-user-1',
    role: 'tenant_admin',
    email: 'admin@studio-cinema.com',
    tenantId,
  });
}

function getViewerToken() {
  return generateToken({
    id: 'v-user-1',
    role: 'viewer',
    email: 'viewer@gmail.com',
    tenantId,
  });
}

const otherTenantAdminToken = generateToken({
  id: 'ta-user-2',
  role: 'tenant_admin',
  email: 'admin@other-studio.com',
  tenantId: 'some-other-tenant-uuid',
});

interface TestResponse {
  status: number;
  body: any;
}

async function makeRequest(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  body?: any,
  token?: string,
  headers?: Record<string, string>,
  tenantHost?: string
): Promise<TestResponse> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(tenantHost && { 'x-tenant-host': tenantHost }),
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${GATEWAY_URL}${path}`, options);
    let parsedBody;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      parsedBody = await res.json();
    } else {
      parsedBody = await res.text();
    }
    return {
      status: res.status,
      body: parsedBody,
    };
  } catch (err: any) {
    console.error(`Request failed for ${method} ${path}:`, err.message);
    throw err;
  }
}

async function runTests() {
  console.log('🏁 Starting Tenant Service End-to-End Tests via API Gateway\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  const testUserId = '8a7d363b-63a2-4a0b-b184-5f5c9e2b1011';
  const testUserEmail = `member-${Date.now()}@example.com`;
  const slug = `studio-${Date.now()}`;
  const tenantHost = `${slug}.localhost:3000`;

  try {
    // 0. Seed Database dependency
    console.log('--- Step 0: Seed test User in DB ---');
    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        email: testUserEmail,
      },
    });
    console.log(`Seeded user ${testUserEmail} with ID ${testUserId}`);

    // 1. Create Tenant (Super Admin Only)
    console.log('\n--- Step 1: Create Tenant (Super Admin) ---');
    const createRes = await makeRequest('/api/v1/tenants', 'POST', {
      name: 'Studio Cinema',
      slug,
      primarySubdomain: slug,
      customDomain: `${slug}.com`,
      branding: {
        primaryColor: '#ff0000',
        backgroundColor: '#000000',
      },
      settings: {
        customConfigEnabled: true,
      },
      limits: {
        maxStorageBytes: 50000,
      },
      features: {
        drmEnabled: true,
      },
    }, superAdminToken, undefined, 'localhost:3000');

    assert(createRes.status === 201, `Create tenant returns 201 (got ${createRes.status})`);
    const createdTenant = createRes.body.tenant;
    tenantId = createdTenant.id;

    // 2. Update Branding
    console.log('\n--- Step 2: Update Branding ---');
    const brandingRes = await makeRequest(`/api/v1/tenants/${tenantId}/branding`, 'PUT', {
      primaryColor: '#00ff00',
      logoUrl: 'https://cdn.platform.com/logo.png',
    }, getTenantAdminToken(), undefined, tenantHost);
    assert(brandingRes.status === 200, `Tenant Admin can update branding through Gateway (got ${brandingRes.status})`);

    // 3. API Key Generation & Verification
    console.log('\n--- Step 3: API Key Generation & Boundary Checks ---');
    
    // Generate key
    const createKeyRes = await makeRequest(`/api/v1/tenants/${tenantId}/keys`, 'POST', {
      name: 'Automated Ingest Key',
      scopes: ['content:write', 'content:read'],
    }, getTenantAdminToken(), undefined, tenantHost);

    assert(createKeyRes.status === 201, `API Key generated through Gateway (got ${createKeyRes.status})`);
    
    const keyId = createKeyRes.body.apiKey.id;
    const rawKey = createKeyRes.body.apiKey.rawKey;

    // List keys
    const listKeysRes = await makeRequest(`/api/v1/tenants/${tenantId}/keys`, 'GET', undefined, getTenantAdminToken(), undefined, tenantHost);
    assert(listKeysRes.status === 200, 'API Keys list retrieved successfully');

    // Authenticate using raw API Key (should authenticate request successfully)
    console.log('\n--- Step 3b: Authenticate using API Key in headers via Gateway ---');
    const readWithKey = await makeRequest(`/api/v1/tenants/${tenantId}`, 'GET', undefined, undefined, {
      'x-api-key': rawKey,
    }, tenantHost);
    assert(readWithKey.status === 200, `Authenticated successfully using API Key header via Gateway (got ${readWithKey.status})`);

    // Authenticate using invalid API Key
    const readWithInvalidKey = await makeRequest(`/api/v1/tenants/${tenantId}`, 'GET', undefined, undefined, {
      'x-api-key': 'tk_invalidprefix.someinvalidsecret123',
    }, tenantHost);
    assert(readWithInvalidKey.status === 401, `Invalid API Key returns 401 Unauthorized via Gateway (got ${readWithInvalidKey.status})`);

    // 4. Revoke API Key
    console.log('\n--- Step 4: Revoke API Key ---');
    const revokeRes = await makeRequest(`/api/v1/tenants/${tenantId}/keys/${keyId}`, 'DELETE', undefined, getTenantAdminToken(), undefined, tenantHost);
    assert(revokeRes.status === 200, 'API Key revoked successfully through Gateway');

    // Authenticate using revoked key (should be blocked)
    const readWithRevokedKey = await makeRequest(`/api/v1/tenants/${tenantId}`, 'GET', undefined, undefined, {
      'x-api-key': rawKey,
    }, tenantHost);
    assert(readWithRevokedKey.status === 401, `Revoked API Key request blocked with 401 Unauthorized via Gateway (got ${readWithRevokedKey.status})`);

    // 5. Tenant Audit Logs
    console.log('\n--- Step 5: Tenant Audit Logs Retrieval ---');
    const auditLogsRes = await makeRequest(`/api/v1/tenants/${tenantId}/audit-logs`, 'GET', undefined, getTenantAdminToken(), undefined, tenantHost);
    assert(auditLogsRes.status === 200, 'Audit logs retrieved successfully through Gateway');

    // 6. Cleanup & Teardown
    console.log('\n--- Step 6: Cleanup & Teardown ---');
    const deleteRes = await makeRequest(`/api/v1/tenants/${tenantId}`, 'DELETE', undefined, superAdminToken, undefined, tenantHost);
    assert(deleteRes.status === 200, `Tenant deleted successfully via Gateway (got ${deleteRes.status})`);

    // Clean up user database dependency
    await prisma.user.delete({ where: { id: testUserId } });
    console.log('Teared down seeded user from database.');

    const finalResolve = await makeRequest(`/api/v1/tenants/resolve?host=${slug}.com`, 'GET');
    assert(finalResolve.status === 404, `Resolved tenant is no longer available (got ${finalResolve.status})`);

    console.log('\n--- E2E Gateway Integration Tests Finished ---');
    console.log(`Result: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('🎉 ALL GATEWAY ROUTING, DYNAMIC DOMAINS & API KEYS PASSED SUCCESSFULLY!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal integration test error:', err);
    try {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    } catch {}
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
