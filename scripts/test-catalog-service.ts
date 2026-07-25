import { PrismaClient } from '../services/catalog-service/src/generated/client/index.js';

const CATALOG_URL = 'http://localhost:4002';
const TEST_TENANT_ID = 'test_tenant_catalog_123';

const prisma = new PrismaClient();

interface TestResponse {
  status: number;
  body: any;
}

async function makeRequest(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any,
  headers?: Record<string, string>
): Promise<TestResponse> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': TEST_TENANT_ID,
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${CATALOG_URL}${path}`, options);
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
  console.log('🏁 Starting Catalog Service Standalone E2E Tests\n');

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

  const viewerHeaders = {
    'x-user-id': 'viewer-user-1',
    'x-user-role': 'viewer',
    'x-user-email': 'viewer@test.com',
  };

  const guestHeaders = {};

  try {
    // 0. Ensure Tenant exists in the database
    await prisma.tenant.upsert({
      where: { id: TEST_TENANT_ID },
      create: { id: TEST_TENANT_ID },
      update: {},
    });

    // Clean up any stale test records
    await prisma.film.deleteMany({ where: { tenantId: TEST_TENANT_ID } });
    await prisma.genre.deleteMany({ where: { tenantId: TEST_TENANT_ID } });
    await prisma.bundle.deleteMany({ where: { tenantId: TEST_TENANT_ID } });

    // 1. Create Genre
    console.log('--- Step 1: Create Genre (Admin) ---');
    const genreRes = await makeRequest('/api/v1/catalog/genres', 'POST', {
      name: 'Action Sci-Fi',
      slug: 'action-scifi',
      description: 'Futuristic actions and science fiction films',
      sortOrder: 1,
    }, adminHeaders);
    
    assert(genreRes.status === 201, 'Create genre returns 201');
    const genre = genreRes.body.genre;
    assert(genre.name === 'Action Sci-Fi', 'Genre name matches');

    // 2. List Genres (Public Guest)
    console.log('\n--- Step 2: List Genres (Public Guest) ---');
    const listGenresRes = await makeRequest('/api/v1/catalog/genres', 'GET', undefined, guestHeaders);
    assert(listGenresRes.status === 200, 'List genres returns 200');
    assert(listGenresRes.body.genres.length >= 1, 'At least one genre returned');

    // 3. Create Film (Admin)
    console.log('\n--- Step 3: Create Film in DRAFT status (Admin) ---');
    const filmSlug = `matrix-reloaded-${Date.now()}`;
    const filmRes = await makeRequest('/api/v1/catalog/films', 'POST', {
      title: 'The Matrix Reloaded',
      slug: filmSlug,
      subtitle: 'Free your mind again',
      description: 'Neo and the rebel leaders estimate that they have 72 hours before Zion is destroyed.',
      contentType: 'MOVIE',
      status: 'DRAFT',
      visibility: 'PUBLIC',
      genres: [genre.id],
    }, adminHeaders);

    assert(filmRes.status === 201, 'Create film returns 201');
    const film = filmRes.body.film;
    assert(film.title === 'The Matrix Reloaded', 'Film title matches');
    assert(film.status === 'DRAFT', 'Created film status defaults to DRAFT');

    // 4. Update Film Pricing & Availability (Admin)
    console.log('\n--- Step 4: Update Pricing & Availability (Admin) ---');
    const pricingRes = await makeRequest(`/api/v1/catalog/films/${film.id}/pricing`, 'PUT', {
      currency: 'USD',
      ppvPrice: 9.99,
      rentalPrice: 3.99,
      rentalDurationHours: 48,
    }, adminHeaders);
    assert(pricingRes.status === 200, 'Update pricing returns 200');

    const availRes = await makeRequest(`/api/v1/catalog/films/${film.id}/availability`, 'PUT', {
      isAvailable: true,
      regionLocked: false,
    }, adminHeaders);
    assert(availRes.status === 200, 'Update availability returns 200');

    // 5. Add Asset, Subtitle, Chapter, Variant (Admin)
    console.log('\n--- Step 5: Add Film sub-relations (Admin) ---');
    const assetRes = await makeRequest(`/api/v1/catalog/films/${film.id}/assets`, 'POST', {
      type: 'POSTER',
      storageKey: 'posters/matrix_reloaded.jpg',
      url: 'http://cdn.test.com/posters/matrix_reloaded.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1048576,
      isPrimary: true,
      isPublic: true,
    }, adminHeaders);
    assert(assetRes.status === 201, 'Add asset returns 201');

    const subRes = await makeRequest(`/api/v1/catalog/films/${film.id}/subtitles`, 'POST', {
      languageCode: 'en',
      kind: 'SUBTITLE',
      label: 'English SDH',
      storageKey: 'subs/matrix_en.vtt',
      url: 'http://cdn.test.com/subs/matrix_en.vtt',
      isDefault: true,
    }, adminHeaders);
    assert(subRes.status === 201, 'Add subtitle returns 201');

    const chapterRes = await makeRequest(`/api/v1/catalog/films/${film.id}/chapters`, 'POST', {
      title: 'Introduction',
      startSeconds: 0,
      endSeconds: 300,
      orderIndex: 0,
    }, adminHeaders);
    assert(chapterRes.status === 201, 'Add chapter returns 201');

    const variantRes = await makeRequest(`/api/v1/catalog/films/${film.id}/variants`, 'POST', {
      name: '1080p H264',
      qualityLabel: '1080p',
      storageKey: 'variants/matrix_1080.mp4',
      manifestUrl: 'http://cdn.test.com/variants/matrix_1080/manifest.mpd',
      bitrateKbps: 4500,
      width: 1920,
      height: 1080,
      fps: 23.976,
      isDefault: true,
      isReady: true,
    }, adminHeaders);
    assert(variantRes.status === 201, 'Add variant returns 201');

    // 6. Test Multi-tenant Isolation / Visibility
    console.log('\n--- Step 6: Test Visibility Boundaries ---');
    // Public guests should NOT see DRAFT film
    const guestSearchDraft = await makeRequest('/api/v1/catalog/films', 'GET', undefined, guestHeaders);
    const draftInGuestList = guestSearchDraft.body.films.find((f: any) => f.id === film.id);
    assert(!draftInGuestList, 'Draft film is hidden from public guest list query');

    // Public guests should NOT be able to view details of DRAFT film
    const guestGetDraft = await makeRequest(`/api/v1/catalog/films/${film.id}`, 'GET', undefined, guestHeaders);
    assert(guestGetDraft.status === 404, 'Public get of Draft film details fails with 404');

    // Admin SHOULD be able to see it
    const adminSearchDraft = await makeRequest('/api/v1/catalog/films', 'GET', undefined, adminHeaders);
    const draftInAdminList = adminSearchDraft.body.films.find((f: any) => f.id === film.id);
    assert(!!draftInAdminList, 'Draft film is visible to tenant admin list query');

    // 7. Publish Film (Admin)
    console.log('\n--- Step 7: Publish Film (Admin) ---');
    const publishRes = await makeRequest(`/api/v1/catalog/films/${film.id}`, 'PUT', {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    }, adminHeaders);
    assert(publishRes.status === 200, 'Publish film returns 200');

    // 8. Public access verified (Public Guest)
    console.log('\n--- Step 8: Verify Public Access after publishing ---');
    const guestSearchPublished = await makeRequest('/api/v1/catalog/films', 'GET', undefined, guestHeaders);
    const publishedInGuestList = guestSearchPublished.body.films.find((f: any) => f.id === film.id);
    assert(!!publishedInGuestList, 'Published film is now visible in guest list query');

    const guestGetPublished = await makeRequest(`/api/v1/catalog/films/${film.id}`, 'GET', undefined, guestHeaders);
    assert(guestGetPublished.status === 200, 'Guest can now retrieve details of published film');
    assert(guestGetPublished.body.film.pricing.ppvPrice === '9.99', 'Guest can view film pricing details');

    // 9. Bundle Operations
    console.log('\n--- Step 9: Create and List Bundles ---');
    const bundleRes = await makeRequest('/api/v1/catalog/bundles', 'POST', {
      name: 'Sci-Fi Collection',
      slug: 'scifi-collection',
      description: 'The best science fiction movies',
      status: 'published',
      price: 19.99,
      filmIds: [film.id],
    }, adminHeaders);
    assert(bundleRes.status === 201, 'Create bundle returns 201');
    const bundle = bundleRes.body.bundle;
    assert(bundle.items.length === 1 && bundle.items[0].filmId === film.id, 'Bundle lists film item dependency correctly');

    const listBundlesRes = await makeRequest('/api/v1/catalog/bundles', 'GET', undefined, guestHeaders);
    assert(listBundlesRes.status === 200, 'Guest list bundles returns 200');
    assert(listBundlesRes.body.bundles.length >= 1, 'At least one bundle returned');

    // 10. Watchlist Operations
    console.log('\n--- Step 10: Watchlist Operations (Viewer) ---');
    const addToWatchlistRes = await makeRequest('/api/v1/catalog/watchlist', 'POST', {
      filmId: film.id,
      notes: 'Need to watch this weekend!',
    }, viewerHeaders);
    assert(addToWatchlistRes.status === 201, 'Add to watchlist returns 201');

    const getWatchlistRes = await makeRequest('/api/v1/catalog/watchlist', 'GET', undefined, viewerHeaders);
    assert(getWatchlistRes.status === 200 && getWatchlistRes.body.watchlist.length >= 1, 'Retrieve viewer watchlist returns list');

    // 11. Ratings/Reviews Operations
    console.log('\n--- Step 11: Write and Moderate Reviews ---');
    const reviewRes = await makeRequest('/api/v1/catalog/ratings', 'POST', {
      filmId: film.id,
      rating: 5,
      reviewTitle: 'Masterpiece',
      reviewBody: 'The special effects and sound design are spectacular.',
    }, viewerHeaders);
    assert(reviewRes.status === 201, 'Write review returns 201');
    const review = reviewRes.body.rating;
    assert(review.isPublished === false, 'New review defaults to unpublished moderation status');

    // Guest should not see unpublished review
    const guestReviewsBefore = await makeRequest(`/api/v1/catalog/ratings/film/${film.id}`, 'GET', undefined, guestHeaders);
    const guestSawUnpublished = guestReviewsBefore.body.ratings.some((r: any) => r.id === review.id);
    assert(!guestSawUnpublished, 'Unpublished review is hidden from public guest reviews query');

    // Publish review (Admin)
    const pubReviewRes = await makeRequest(`/api/v1/catalog/ratings/${review.id}`, 'PUT', {
      isPublished: true,
    }, adminHeaders);
    assert(pubReviewRes.status === 200 && pubReviewRes.body.rating.isPublished === true, 'Admin can publish/moderate review');

    // Guest should now see published review
    const guestReviewsAfter = await makeRequest(`/api/v1/catalog/ratings/film/${film.id}`, 'GET', undefined, guestHeaders);
    const guestSawPublished = guestReviewsAfter.body.ratings.some((r: any) => r.id === review.id);
    assert(guestSawPublished, 'Published review is visible to public guest reviews query');

    // 12. Cleanup watchlist, reviews, and film
    console.log('\n--- Step 12: Cleanup & Teardown ---');
    const deleteReviewRes = await makeRequest(`/api/v1/catalog/ratings/${review.id}`, 'DELETE', undefined, adminHeaders);
    assert(deleteReviewRes.status === 200, 'Review deleted');

    const removeWatchlistRes = await makeRequest(`/api/v1/catalog/watchlist/${film.id}`, 'DELETE', undefined, viewerHeaders);
    assert(removeWatchlistRes.status === 200, 'Film removed from watchlist');

    const deleteBundleRes = await makeRequest(`/api/v1/catalog/bundles/${bundle.id}`, 'DELETE', undefined, adminHeaders);
    assert(deleteBundleRes.status === 200, 'Bundle deleted');

    const deleteFilmRes = await makeRequest(`/api/v1/catalog/films/${film.id}`, 'DELETE', undefined, adminHeaders);
    assert(deleteFilmRes.status === 200, 'Film deleted');

    const deleteGenreRes = await makeRequest(`/api/v1/catalog/genres/${genre.id}`, 'DELETE', undefined, adminHeaders);
    assert(deleteGenreRes.status === 200, 'Genre deleted');

    console.log('\n--- E2E Catalog Service Tests Finished ---');
    console.log(`Result: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('🎉 ALL CATALOG SERVICE FUNCTIONALITY AND BOUNDARIES PASSED SUCCESSFULLY!');
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
