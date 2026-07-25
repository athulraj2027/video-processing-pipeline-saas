import { execSync } from 'child_process';

const GATEWAY_URL = 'http://localhost:3000';

// Generate a unique email for this test run to prevent conflict errors
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'Password123!';
const testRole = 'tenant_admin';
const testTenantId = 'tenant_abc';

const newPassword = 'NewPassword123!';

interface TestResponse {
  status: number;
  body: any;
  headers: Headers;
}

// Helper to make fetch requests
async function makeRequest(
  url: string,
  method: 'GET' | 'POST',
  body?: any,
  headers?: Record<string, string>
): Promise<TestResponse> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
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
      headers: res.headers,
    };
  } catch (err: any) {
    console.error(`Request failed for ${method} ${url}:`, err.message);
    throw err;
  }
}

async function runTests() {
  console.log('🏁 Starting Gateway Routing & Security Verification Tests\n');
  console.log(`Test Email: ${testEmail}\n`);

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
    // 1. Health Check
    console.log('--- Step 1: Gateway Health Check ---');
    const healthRes = await makeRequest(`${GATEWAY_URL}/health`, 'GET');
    assert(healthRes.status === 200, 'Gateway health check returns 200');
    assert(healthRes.body.status === 'UP', 'Gateway health status is UP');
    assert(healthRes.body.tenantId === 'tenant_default', 'Gateway resolves default tenant from localhost host header');
    assert(healthRes.headers.get('X-Tenant-Id') === 'tenant_default', 'Gateway propagates X-Tenant-Id header in response');

    // 2. Security Check (Header Spoofing Prevention)
    console.log('\n--- Step 2: Security check - Header Spoofing Prevention ---');
    const spoofedRes = await makeRequest(
      `${GATEWAY_URL}/api/v1/auth/me`,
      'GET',
      undefined,
      {
        'x-user-id': 'spoofed-admin-id',
        'x-user-role': 'super_admin',
        'x-user-email': 'attacker@malicious.com',
        'x-tenant-id': 'tenant_compromised',
      }
    );
    assert(
      spoofedRes.status === 401,
      `Spoofed headers without token should be blocked with 401 (got ${spoofedRes.status})`
    );
    if (spoofedRes.status === 200) {
      console.error('⚠️ CRITICAL SECURITY WARNING: Spoofed headers allowed bypassing authentication!');
      console.log('Response body:', spoofedRes.body);
    } else {
      console.log('🛡️  Verified: Gateway sanitized client-supplied user headers successfully.');
    }

    // 3. User Signup
    console.log('\n--- Step 3: User Signup via Gateway ---');
    const signupRes = await makeRequest(`${GATEWAY_URL}/api/v1/auth/signup`, 'POST', {
      email: testEmail,
      password: testPassword,
      role: testRole,
      tenantId: testTenantId,
    });
    assert(signupRes.status === 200, `Signup request returns 200 (got ${signupRes.status})`);
    const verificationOtp = signupRes.body._testOtp;
    assert(!!verificationOtp, `Signup returns _testOtp for dev/test verification: ${verificationOtp}`);

    // 4. Verify Email (Signup Completion)
    console.log('\n--- Step 4: Email Verification & Auto-login ---');
    const verifyRes = await makeRequest(`${GATEWAY_URL}/api/v1/auth/verify-email`, 'POST', {
      email: testEmail,
      otp: verificationOtp,
    });
    assert(verifyRes.status === 201, `Email verification returns 201 (got ${verifyRes.status})`);
    const accessToken = verifyRes.body.accessToken;
    const refreshToken = verifyRes.body.refreshToken;
    assert(!!accessToken, 'Verification returns accessToken');
    assert(!!refreshToken, 'Verification returns refreshToken');
    assert(verifyRes.body.user.email === testEmail.toLowerCase(), 'Verification returns correct user email');

    // 5. Get User Profile (Header Propagation Verification)
    console.log('\n--- Step 5: Get Profile (Verify Header Propagation) ---');
    const meRes = await makeRequest(`${GATEWAY_URL}/api/v1/auth/me`, 'GET', undefined, {
      Authorization: `Bearer ${accessToken}`,
    });
    assert(meRes.status === 200, `Get profile returns 200 (got ${meRes.status})`);
    assert(meRes.body.user.email === testEmail.toLowerCase(), 'Profile contains correct user email');
    assert(meRes.body.user.role === testRole, 'Profile contains correct user role');
    assert(meRes.body.user.tenantId === testTenantId, 'Profile contains correct user tenantId');

    // 6. Refresh Token Flow
    console.log('\n--- Step 6: Refresh Access Token ---');
    console.log('Waiting 1 second to ensure JWT iat changes...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const refreshRes = await makeRequest(`${GATEWAY_URL}/api/v1/auth/refresh`, 'POST', {
      refreshToken,
    });
    assert(refreshRes.status === 200, `Token refresh returns 200 (got ${refreshRes.status})`);
    const newAccessToken = refreshRes.body.accessToken;
    const newRefreshToken = refreshRes.body.refreshToken;
    assert(!!newAccessToken && newAccessToken !== accessToken, 'Token refresh returns new accessToken');
    assert(!!newRefreshToken && newRefreshToken !== refreshToken, 'Token refresh returns new refreshToken');

    // 7. Forgot and Reset Password Flow
    console.log('\n--- Step 7: Forgot & Reset Password Flow ---');
    const forgotRes = await makeRequest(`${GATEWAY_URL}/api/v1/auth/forgot-password`, 'POST', {
      email: testEmail,
    });
    assert(forgotRes.status === 200, 'Forgot password returns 200');
    const resetOtp = forgotRes.body._testOtp;
    assert(!!resetOtp, `Forgot password returns reset OTP: ${resetOtp}`);

    const resetRes = await makeRequest(`${GATEWAY_URL}/api/v1/auth/reset-password`, 'POST', {
      email: testEmail,
      otp: resetOtp,
      password: newPassword,
    });
    assert(resetRes.status === 200, 'Reset password returns 200');

    // 8. Login with New Password
    console.log('\n--- Step 8: Login with New Password ---');
    const loginRes = await makeRequest(`${GATEWAY_URL}/api/v1/auth/login`, 'POST', {
      email: testEmail,
      password: newPassword,
    });
    assert(loginRes.status === 200, `Login returns 200 (got ${loginRes.status})`);
    const loginAccessToken = loginRes.body.accessToken;
    const loginRefreshToken = loginRes.body.refreshToken;
    assert(!!loginAccessToken, 'Login returns new access token');

    // 9. Logout and Invalidation
    console.log('\n--- Step 9: Logout & Token Invalidation ---');
    const logoutRes = await makeRequest(`${GATEWAY_URL}/api/v1/auth/logout`, 'POST', {
      refreshToken: loginRefreshToken,
    });
    assert(logoutRes.status === 200, 'Logout request returns 200');

    // Verify refresh token is invalidated
    const invalidatedRefreshRes = await makeRequest(`${GATEWAY_URL}/api/v1/auth/refresh`, 'POST', {
      refreshToken: loginRefreshToken,
    });
    assert(invalidatedRefreshRes.status === 401, 'Using logged-out refresh token fails with 401');

    console.log('\n--- Verification Finished ---');
    console.log(`Result: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('🎉 ALL GATEWAY INTEGRATION & SECURITY TESTS PASSED SUCCESSFULLY!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test execution error:', err);
    process.exit(1);
  }
}

runTests();
