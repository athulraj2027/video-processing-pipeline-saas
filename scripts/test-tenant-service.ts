import jwt from 'jsonwebtoken';
import { PrismaClient } from '../services/tenant-service/src/generated/client/index.js';

const SERVICE_URL = 'http://localhost:4005';
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
  headers?: Record<string, string>
): Promise<TestResponse> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${SERVICE_URL}${path}`, options);
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
  console.log('🏁 Starting Complete Tenant Service (Updated Schema) Verification Tests\n');

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

  // Generate unique test IDs to avoid collisions
  const testUserId = '8a7d363b-63a2-4a0b-b184-5f5c9e2b1011';
  const testUserEmail = `member-${Date.now()}@example.com`;
  const slug = `studio-${Date.now()}`;

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
    }, superAdminToken);

    assert(createRes.status === 201, `Create tenant returns 201 (got ${createRes.status})`);
    assert(createRes.body.tenant.name === 'Studio Cinema', 'Tenant name matches');
    assert(createRes.body.tenant.slug === slug, 'Tenant slug matches');
    assert(createRes.body.tenant.branding.primaryColor === '#ff0000', 'Branding is saved correctly');
    assert(createRes.body.tenant.settings.customConfigEnabled === true, 'Settings are saved correctly');
    assert(createRes.body.tenant.limits.maxStorageBytes === 50000, 'Limits are saved correctly');
    assert(createRes.body.tenant.features.drmEnabled === true, 'Features are saved correctly');

    const createdTenant = createRes.body.tenant;
    tenantId = createdTenant.id;

    // Verify duplicate checks
    console.log('\n--- Step 1b: Verify uniqueness constraint ---');
    const dupRes = await makeRequest('/api/v1/tenants', 'POST', {
      name: 'Duplicate Studio',
      slug,
    }, superAdminToken);
    assert(dupRes.status === 409, `Duplicate slug creation fails with 409 Conflict (got ${dupRes.status})`);

    // 2. Access Control Boundaries
    console.log('\n--- Step 2: Test Tenant Boundaries & Contexts ---');
    
    // Super Admin reads profile
    const readSa = await makeRequest(`/api/v1/tenants/${tenantId}`, 'GET', undefined, superAdminToken);
    assert(readSa.status === 200, `Super Admin can access any tenant (got ${readSa.status})`);

    // Matching Tenant Admin reads profile
    const readTa = await makeRequest(`/api/v1/tenants/${tenantId}`, 'GET', undefined, getTenantAdminToken());
    assert(readTa.status === 200, `Tenant Admin can access their own tenant (got ${readTa.status})`);

    // Viewer reads profile
    const readV = await makeRequest(`/api/v1/tenants/${tenantId}`, 'GET', undefined, getViewerToken());
    assert(readV.status === 200, `Viewer can access their resolved tenant (got ${readV.status})`);

    // Non-matching Tenant Admin reads profile
    const readTa2 = await makeRequest(`/api/v1/tenants/${tenantId}`, 'GET', undefined, otherTenantAdminToken);
    assert(readTa2.status === 403, `Unauthorized tenant admin is blocked with 403 (got ${readTa2.status})`);

    // 3. Update Branding (Tenant Admin allowed)
    console.log('\n--- Step 3: Update Branding ---');
    const brandingRes = await makeRequest(`/api/v1/tenants/${tenantId}/branding`, 'PUT', {
      primaryColor: '#00ff00',
      logoUrl: 'https://cdn.platform.com/logo.png',
    }, getTenantAdminToken());
    assert(brandingRes.status === 200, `Tenant Admin can update branding (got ${brandingRes.status})`);
    assert(brandingRes.body.tenant.branding.primaryColor === '#00ff00', 'Branding primaryColor updated');
    assert(brandingRes.body.tenant.branding.logoUrl === 'https://cdn.platform.com/logo.png', 'Branding logoUrl updated');

    // 4. Update Settings, Limits, Features (Tenant Admin NOT allowed, Super Admin only)
    console.log('\n--- Step 4: Settings, Limits & Features Security ---');
    const settingsTa = await makeRequest(`/api/v1/tenants/${tenantId}/settings`, 'PUT', {
      customConfigEnabled: false,
    }, getTenantAdminToken());
    assert(settingsTa.status === 403, `Tenant Admin is forbidden to change settings (got ${settingsTa.status})`);

    const limitsTa = await makeRequest(`/api/v1/tenants/${tenantId}/limits`, 'PUT', {
      maxStorageBytes: 999999,
    }, getTenantAdminToken());
    assert(limitsTa.status === 403, `Tenant Admin is forbidden to change limits (got ${limitsTa.status})`);

    const featuresTa = await makeRequest(`/api/v1/tenants/${tenantId}/features`, 'PUT', {
      drmEnabled: false,
    }, getTenantAdminToken());
    assert(featuresTa.status === 403, `Tenant Admin is forbidden to change features (got ${featuresTa.status})`);

    const settingsSa = await makeRequest(`/api/v1/tenants/${tenantId}/settings`, 'PUT', {
      customConfigEnabled: false,
    }, superAdminToken);
    assert(settingsSa.status === 200, `Super Admin can update settings (got ${settingsSa.status})`);
    assert(settingsSa.body.tenant.settings.customConfigEnabled === false, 'Settings updated');

    const limitsSa = await makeRequest(`/api/v1/tenants/${tenantId}/limits`, 'PUT', {
      maxStorageBytes: 12345,
    }, superAdminToken);
    assert(limitsSa.status === 200, `Super Admin can update limits (got ${limitsSa.status})`);
    assert(limitsSa.body.tenant.limits.maxStorageBytes === 12345, 'Limits updated');

    const featuresSa = await makeRequest(`/api/v1/tenants/${tenantId}/features`, 'PUT', {
      drmEnabled: false,
    }, superAdminToken);
    assert(featuresSa.status === 200, `Super Admin can update features (got ${featuresSa.status})`);
    assert(featuresSa.body.tenant.features.drmEnabled === false, 'Features updated');

    // 5. Host & Domain Resolution
    console.log('\n--- Step 5: Subdomain and Custom Domain Resolution ---');
    
    // Resolve via subdomain prefix (slug)
    const resolveSub = await makeRequest(`/api/v1/tenants/resolve?host=${slug}.localhost:3000`, 'GET');
    assert(resolveSub.status === 200, `Resolves correctly via subdomain host prefix (got ${resolveSub.status})`);
    assert(resolveSub.body.tenant.id === tenantId, 'Resolved tenant ID matches');

    // Resolve via custom domain
    const resolveDom = await makeRequest(`/api/v1/tenants/resolve?host=${slug}.com`, 'GET');
    assert(resolveDom.status === 200, `Resolves correctly via customDomain (got ${resolveDom.status})`);
    assert(resolveDom.body.tenant.id === tenantId, 'Resolved custom domain tenant ID matches');

    // 6. Domain Management Map (CRUD & Verification)
    console.log('\n--- Step 6: Domain Mapping & Verification ---');
    
    const targetHost = `cinema-${Date.now()}.com`;
    // Add custom domain mapping
    const addDomRes = await makeRequest(`/api/v1/tenants/${tenantId}/domains`, 'POST', {
      host: targetHost,
      type: 'CUSTOM_DOMAIN',
    }, getTenantAdminToken());
    assert(addDomRes.status === 201, `Domain mapping added successfully (got ${addDomRes.status})`);
    assert(addDomRes.body.domain.host === targetHost, 'Mapped host name matches');
    assert(addDomRes.body.domain.status === 'PENDING', 'Initial mapped domain status is PENDING');

    const domainId = addDomRes.body.domain.id;

    // List domains
    const listDomRes = await makeRequest(`/api/v1/tenants/${tenantId}/domains`, 'GET', undefined, getTenantAdminToken());
    assert(listDomRes.status === 200, 'Domains list retrieved successfully');
    assert(listDomRes.body.domains.some((d: any) => d.id === domainId), 'List contains newly added domain mapping');

    // Verify domain mapping (updates status to ACTIVE)
    const verifyDomRes = await makeRequest(`/api/v1/tenants/domains/${domainId}/verify`, 'PATCH', undefined, getTenantAdminToken());
    assert(verifyDomRes.status === 200, 'Domain verification request succeeded');
    assert(verifyDomRes.body.domain.status === 'ACTIVE', 'Domain status changed to ACTIVE after verification');

    // Resolve resolved tenant using the new verified mapping
    const resolveNewDom = await makeRequest(`/api/v1/tenants/resolve?host=${targetHost}`, 'GET');
    assert(resolveNewDom.status === 200 && resolveNewDom.body.tenant.id === tenantId, 'Successfully resolved tenant using the new domain mapping');

    // Delete domain mapping
    const delDomRes = await makeRequest(`/api/v1/tenants/domains/${domainId}`, 'DELETE', undefined, getTenantAdminToken());
    assert(delDomRes.status === 200, 'Domain mapping deleted successfully');

    // 7. Team Membership Context
    console.log('\n--- Step 7: Team Membership Context & Roles ---');
    
    // Add membership
    const addMemberRes = await makeRequest(`/api/v1/tenants/${tenantId}/users`, 'POST', {
      userId: testUserId,
      role: 'STAFF',
    }, getTenantAdminToken());
    assert(addMemberRes.status === 201, `Added user to tenant team successfully (got ${addMemberRes.status})`);
    assert(addMemberRes.body.member.role === 'STAFF', 'Role is correctly set to STAFF');

    // List memberships
    const listMembersRes = await makeRequest(`/api/v1/tenants/${tenantId}/users`, 'GET', undefined, getTenantAdminToken());
    assert(listMembersRes.status === 200, 'Members list retrieved successfully');
    assert(listMembersRes.body.users.some((m: any) => m.userId === testUserId), 'List contains the added member');

    // Update role
    const updateRoleRes = await makeRequest(`/api/v1/tenants/${tenantId}/users/${testUserId}`, 'PUT', {
      role: 'ADMIN',
    }, getTenantAdminToken());
    assert(updateRoleRes.status === 200, 'Member role updated successfully');
    assert(updateRoleRes.body.member.role === 'ADMIN', 'Member role changed to ADMIN');

    // Remove user membership
    const removeMemberRes = await makeRequest(`/api/v1/tenants/${tenantId}/users/${testUserId}`, 'DELETE', undefined, getTenantAdminToken());
    assert(removeMemberRes.status === 200, 'Member team membership removed successfully');

    // 8. Tenant Status & Lifecycle Management (Suspension)
    console.log('\n--- Step 8: Tenant Suspension & Lifecycle ---');
    
    // Suspend tenant
    const suspendRes = await makeRequest(`/api/v1/tenants/${tenantId}/status`, 'PATCH', {
      status: 'SUSPENDED',
    }, superAdminToken);
    assert(suspendRes.status === 200, `Super Admin can suspend tenant (got ${suspendRes.status})`);
    assert(suspendRes.body.tenant.status === 'SUSPENDED', 'Tenant status is SUSPENDED');
    assert(!!suspendRes.body.tenant.suspendedAt, 'suspendedAt timestamp is recorded');

    // Reactivate tenant
    const reactivateRes = await makeRequest(`/api/v1/tenants/${tenantId}/status`, 'PATCH', {
      status: 'ACTIVE',
    }, superAdminToken);
    assert(reactivateRes.status === 200, 'Reactivated tenant successfully');
    assert(reactivateRes.body.tenant.status === 'ACTIVE', 'Tenant status is ACTIVE');

    // 9. Cleanup & Teardown
    console.log('\n--- Step 9: Cleanup & Teardown ---');
    
    // Delete tenant
    const deleteRes = await makeRequest(`/api/v1/tenants/${tenantId}`, 'DELETE', undefined, superAdminToken);
    assert(deleteRes.status === 200, `Tenant deleted successfully (got ${deleteRes.status})`);

    // Clean up user database dependency
    await prisma.user.delete({ where: { id: testUserId } });
    console.log('Teared down seeded user from database.');

    const finalResolve = await makeRequest(`/api/v1/tenants/resolve?host=${slug}.com`, 'GET');
    assert(finalResolve.status === 404, `Resolved tenant is no longer available (got ${finalResolve.status})`);

    console.log('\n--- Complete Integration Tests Finished ---');
    console.log(`Result: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('🎉 ALL UPDATED TENANT SERVICE SPECIFICATIONS VERIFIED SUCCESSFULLY!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal integration test error:', err);
    // Attempt database cleanup in case of crash
    try {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    } catch {}
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
