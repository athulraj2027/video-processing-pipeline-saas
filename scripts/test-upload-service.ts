import { PrismaClient } from '../services/upload-service/src/generated/client/index.js';

const UPLOAD_URL = 'http://localhost:4003';
const TEST_TENANT_ID = 'test_tenant_upload_123';
const OTHER_TENANT_ID = 'other_tenant_upload_999';

const prisma = new PrismaClient();

interface TestResponse {
  status: number;
  body: any;
}

async function makeRequest(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any,
  headers?: Record<string, string>,
  tenantId: string = TEST_TENANT_ID
): Promise<TestResponse> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${UPLOAD_URL}${path}`, options);
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
  console.log('🏁 Starting Upload Service Standalone E2E Tests\n');

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

  // Gateway header mocks
  const adminHeaders = {
    'x-user-id': 'admin-user-1',
    'x-user-role': 'tenant_admin',
    'x-user-email': 'admin@test.com',
  };

  const otherAdminHeaders = {
    'x-user-id': 'admin-user-99',
    'x-user-role': 'tenant_admin',
    'x-user-email': 'admin99@test.com',
  };

  try {
    // 0. Ensure Tenants exist in the database
    await prisma.tenant.upsert({ where: { id: TEST_TENANT_ID }, create: { id: TEST_TENANT_ID }, update: {} });
    await prisma.tenant.upsert({ where: { id: OTHER_TENANT_ID }, create: { id: OTHER_TENANT_ID }, update: {} });

    // Clean up any stale test records
    await prisma.uploadJob.deleteMany({ where: { tenantId: TEST_TENANT_ID } });
    await prisma.uploadJob.deleteMany({ where: { tenantId: OTHER_TENANT_ID } });

    // 1. Create Upload Job (Admin)
    console.log('--- Step 1: Create Upload Job (Admin) ---');
    const jobRes = await makeRequest('/api/v1/upload', 'POST', {
      originalFileName: 'avengers_endgame.mov',
      contentType: 'video/quicktime',
      fileSizeBytes: 5368709120, // 5GB
      sourceType: 'DIRECT',
      storageProvider: 'R2',
      storageBucket: 'raw-ingest-bucket',
      storageKey: 'uploads/avengers_endgame.mov',
    }, adminHeaders);

    assert(jobRes.status === 201, 'Create job returns 201');
    const job = jobRes.body.job;
    assert(job.originalFileName === 'avengers_endgame.mov', 'Original file name matches');
    assert(job.status === 'CREATED', 'Job status defaults to CREATED');

    // 2. Retrieve Job Details (Admin)
    console.log('\n--- Step 2: Retrieve Job Details (Admin) ---');
    const getJobRes = await makeRequest(`/api/v1/upload/${job.id}`, 'GET', undefined, adminHeaders);
    assert(getJobRes.status === 200, 'Get job details returns 200');
    assert(getJobRes.body.job.id === job.id, 'Job ID matches');

    // 3. Register Upload Part (Multipart Upload)
    console.log('\n--- Step 3: Register Upload Part (Multipart) ---');
    const partRes = await makeRequest(`/api/v1/upload/${job.id}/parts`, 'POST', {
      partNumber: 1,
      byteStart: 0,
      byteEnd: 104857600, // first 100MB
      fileSizeBytes: 104857600,
      etag: 'etag_part_1_hash',
    }, adminHeaders);

    assert(partRes.status === 201, 'Register part returns 201');
    assert(partRes.body.part.partNumber === 1, 'Part number matches');

    // 4. Log Validation Findings (Admin)
    console.log('\n--- Step 4: Log Validation Findings (Admin) ---');
    const validationRes = await makeRequest(`/api/v1/upload/${job.id}/validations`, 'POST', {
      code: 'UNSUPPORTED_CODEC',
      status: 'WARNING',
      severity: 'warning',
      message: 'Audio codec is AAC-HE, which is supported but not preferred.',
      fieldName: 'codecAudio',
      expectedValue: 'AAC-LC',
      actualValue: 'AAC-HE',
    }, adminHeaders);

    assert(validationRes.status === 201, 'Add validation returns 201');
    assert(validationRes.body.validation.code === 'UNSUPPORTED_CODEC', 'Validation code matches');

    // 5. Log Custom Events (Admin)
    console.log('\n--- Step 5: Log Progress Event (Admin) ---');
    const eventRes = await makeRequest(`/api/v1/upload/${job.id}/events`, 'POST', {
      eventType: 'PROBE_METADATA_EXTRACTED',
      payload: { codec: 'h264', height: 1080, width: 1920 },
    }, adminHeaders);

    assert(eventRes.status === 201, 'Add event returns 201');
    assert(eventRes.body.event.eventType === 'PROBE_METADATA_EXTRACTED', 'Event type matches');

    // 6. Register Upload Artifacts (Admin)
    console.log('\n--- Step 6: Register Output Artifact (Admin) ---');
    const artifactRes = await makeRequest(`/api/v1/upload/${job.id}/artifacts`, 'POST', {
      kind: 'MEDIA_PROBE_JSON',
      name: 'probe_metadata.json',
      storageProvider: 'R2',
      storageKey: `metadata/${job.id}_probe.json`,
      url: `http://cdn.test.com/metadata/${job.id}_probe.json`,
      mimeType: 'application/json',
      sizeBytes: 1024,
    }, adminHeaders);

    assert(artifactRes.status === 201, 'Add artifact returns 201');
    assert(artifactRes.body.artifact.kind === 'MEDIA_PROBE_JSON', 'Artifact kind matches');

    // 7. Update Job Status & Probe data (Admin)
    console.log('\n--- Step 7: Update Job Status & Media Probe info (Admin) ---');
    const updateRes = await makeRequest(`/api/v1/upload/${job.id}`, 'PUT', {
      status: 'PROCESSING',
      durationSeconds: 7200,
      width: 1920,
      height: 1080,
      fps: 24,
      codecVideo: 'h264',
      codecAudio: 'aac',
      containerFormat: 'mov',
    }, adminHeaders);

    assert(updateRes.status === 200, 'Update job returns 200');
    assert(updateRes.body.job.status === 'PROCESSING', 'Job status updated successfully');
    assert(updateRes.body.job.durationSeconds === 7200, 'Duration saved successfully');

    // 8. Test Multi-tenant Boundary Scoping (Other Tenant Admin)
    console.log('\n--- Step 8: Test Multi-tenant Scoping ---');
    
    // Another tenant trying to read should get 404 (isolated)
    const spoofedGetRes = await makeRequest(`/api/v1/upload/${job.id}`, 'GET', undefined, otherAdminHeaders, OTHER_TENANT_ID);
    assert(spoofedGetRes.status === 404, 'Other tenant cannot read details (returns 404)');

    // Another tenant trying to write should get 404 (isolated)
    const spoofedUpdateRes = await makeRequest(`/api/v1/upload/${job.id}`, 'PUT', {
      status: 'FAILED',
    }, otherAdminHeaders, OTHER_TENANT_ID);
    assert(spoofedUpdateRes.status === 404, 'Other tenant cannot modify status (returns 404)');

    // 9. Cleanup & Teardown
    console.log('\n--- Step 9: Cleanup & Teardown ---');
    const deleteRes = await makeRequest(`/api/v1/upload/${job.id}`, 'DELETE', undefined, adminHeaders);
    assert(deleteRes.status === 200, 'Job deleted successfully');

    // Confirm job is gone
    const doubleCheckGet = await makeRequest(`/api/v1/upload/${job.id}`, 'GET', undefined, adminHeaders);
    assert(doubleCheckGet.status === 404, 'Deleted job is no longer available');

    console.log('\n--- E2E Upload Service Tests Finished ---');
    console.log(`Result: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('🎉 ALL UPLOAD SERVICE FUNCTIONALITY AND BOUNDARIES PASSED SUCCESSFULLY!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
