import jwt from 'jsonwebtoken';

const SERVICE_URL = 'http://localhost:4005';
const JWT_SECRET = 'your_super_secret_jwt_signing_key_at_least_8_chars';

// Generate mock JWTs for different roles/tenants
function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET);
}

const superAdminToken = generateToken({
  id: 'sa-user-1',
  role: 'super_admin',
  email: 'superadmin@saasplatform.com',
});

// We will dynamically replace tenantId once the tenant is created
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
  console.log('🏁 Starting Tenant Service Lifecycle & Boundaries Verification Tests\n');

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

  try {
    // 1. Create Tenant (Super Admin Only)
    console.log('--- Step 1: Create Tenant (Super Admin) ---');
    const slug = `studio-${Date.now()}`;
    const createRes = await makeRequest('/api/v1/tenants', 'POST', {
      name: 'Studio Cinema',
      slug,
      subdomain: slug,
      customDomain: `${slug}.com`,
      branding: {
        primaryColor: '#ff0000',
        backgroundColor: '#000000',
      },
      settings: {
        billingPlan: 'starter',
      },
    }, superAdminToken);

    assert(createRes.status === 201, `Create tenant returns 201 (got ${createRes.status})`);
    assert(createRes.body.tenant.name === 'Studio Cinema', 'Tenant name matches');
    assert(createRes.body.tenant.slug === slug, 'Tenant slug matches');
    assert(createRes.body.tenant.branding.primaryColor === '#ff0000', 'Branding is saved correctly');
    assert(createRes.body.tenant.settings.billingPlan === 'starter', 'Settings are saved correctly');

    const createdTenant = createRes.body.tenant;
    tenantId = createdTenant.id; // Assign dynamically for subsequent tokens

    // Try creating duplicate slug
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

    // 4. Update Settings / Quotas (Tenant Admin NOT allowed, Super Admin only)
    console.log('\n--- Step 4: Settings & Quotas Security ---');
    const settingsTa = await makeRequest(`/api/v1/tenants/${tenantId}/settings`, 'PUT', {
      billingPlan: 'enterprise',
      maxStorageBytes: 1000000,
    }, getTenantAdminToken());
    assert(settingsTa.status === 403, `Tenant Admin is forbidden to change settings/plan (got ${settingsTa.status})`);

    const settingsSa = await makeRequest(`/api/v1/tenants/${tenantId}/settings`, 'PUT', {
      billingPlan: 'enterprise',
      maxStorageBytes: 1099511627776, // 1 TB
    }, superAdminToken);
    assert(settingsSa.status === 200, `Super Admin can update settings (got ${settingsSa.status})`);
    assert(settingsSa.body.tenant.settings.billingPlan === 'enterprise', 'Settings billingPlan updated to enterprise');

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

    // 6. Tenant Status & Lifecycle Management (Suspension)
    console.log('\n--- Step 6: Tenant Suspension & Lifecycle ---');
    
    // Suspend tenant
    const suspendRes = await makeRequest(`/api/v1/tenants/${tenantId}/status`, 'PATCH', {
      status: 'suspended',
    }, superAdminToken);
    assert(suspendRes.status === 200, `Super Admin can suspend tenant (got ${suspendRes.status})`);
    assert(suspendRes.body.tenant.status === 'suspended', 'Tenant status is suspended');

    // Verify resolved tenant indicates suspended
    const resolveSuspended = await makeRequest(`/api/v1/tenants/resolve?host=${slug}.com`, 'GET');
    assert(resolveSuspended.status === 200 && resolveSuspended.body.tenant.status === 'suspended', 'Resolution returns suspended status status');

    // Reactivate tenant
    const reactivateRes = await makeRequest(`/api/v1/tenants/${tenantId}/status`, 'PATCH', {
      status: 'active',
    }, superAdminToken);
    assert(reactivateRes.status === 200, 'Reactivated tenant successfully');
    assert(reactivateRes.body.tenant.status === 'active', 'Tenant status is active');

    // 7. Cleanup & Teardown
    console.log('\n--- Step 7: Cleanup & Teardown ---');
    const deleteRes = await makeRequest(`/api/v1/tenants/${tenantId}`, 'DELETE', undefined, superAdminToken);
    assert(deleteRes.status === 200, `Tenant deleted successfully (got ${deleteRes.status})`);

    const finalResolve = await makeRequest(`/api/v1/tenants/resolve?host=${slug}.com`, 'GET');
    assert(finalResolve.status === 404, `Resolved tenant is no longer available (got ${finalResolve.status})`);

    console.log('\n--- Integration Tests Finished ---');
    console.log(`Result: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('🎉 ALL TENANT SERVICE SPECIFICATIONS VERIFIED SUCCESSFULLY!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal integration test error:', err);
    process.exit(1);
  }
}

runTests();
