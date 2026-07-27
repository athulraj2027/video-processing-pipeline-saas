# Pay-Per-View VOD SaaS Platform
## API Reference Specification (v1.0)

This document contains the complete API documentation for the Pay-Per-View Video-on-Demand (VOD) SaaS microservices platform. 

---

## 1. Global API Architecture & Gateway Routing

The platform utilizes an **Edge API Gateway** acting as a reverse proxy that routes incoming client traffic to the appropriate backend microservices.

* **Base URL (Local Development):** `http://localhost:3000/api/v1`
* **Health Check Endpoint:** `GET http://localhost:3000/health` (Exposed directly at the Gateway root. Returns `UP` along with the resolved `tenantId` if applicable).

### Gateway Routing Table

| Gateway Route Prefix | Target Downstream Service | Default Port | Authenticated By Default |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth` | **Identity/Auth Service** | `4001` | No (Except `/me` and `/logout`) |
| `/api/v1/catalog` | **Catalog Service** | `4002` | Optional (Guest browsing enabled) |
| `/api/v1/upload` | **Upload/Ingest Service** | `4003` | Yes |
| `/api/v1/playback` | **Playback Service** | `4004` | Yes |
| `/api/v1/tenants` | **Tenant Management Service** | `4005` | Mixed (Depends on endpoint) |
| `/api/v1/entitlements`| **Entitlement Service** | `4006` | Yes |
| `/api/v1/billing` | **Billing Service (Platform)** | `4007` | Yes |
| `/api/v1/payments` | **Payments Service (Tenant)** | `4008` | Optional |
| `/api/v1/analytics` | **Analytics Service** | `4009` | Yes |
| `/api/v1/notifications`| **Notification Service** | `4010` | Yes |
| `/api/v1/support` | **Support Service** | `4011` | Yes |
| `/api/v1/jobs` | **Job Orchestrator** | `4012` | Yes |

---

## 2. Authentication & Authorization Patterns

The platform secures endpoints using two main authentication mechanisms:
1. **JSON Web Tokens (JWT):** Passed as a Bearer token in the `Authorization` header (`Authorization: Bearer <jwt_token>`). Used by administrators, staff, and viewers.
2. **API Keys:** Passed in the `x-api-key` header (`x-api-key: <api_key>`). Used for server-to-server integrations. API keys carry `tenant_admin` role authority scoped to their respective tenant.

### Gateway Header Injection
When the API Gateway proxies requests downstream, it decodes the JWT or validates the API key and injects the following headers into the forwarded request:
* `x-user-id`: The unique ID of the authenticated user.
* `x-user-role`: The role associated with the user token (e.g., `super_admin`, `tenant_admin`, `tenant_staff`, `viewer`).
* `x-user-email`: The email of the user.
* `x-tenant-id`: The UUID of the tenant, resolved dynamically by host domain or extracted from the user's token context.

### Role-Based Access Control (RBAC)
* **`super_admin`:** Platform operators. Unrestricted access across all tenants, system metrics, and SaaS tier configurations.
* **`tenant_admin`:** Studio/creator owner. Access to manage their catalog, branding, billing, custom domains, staff memberships, and API keys.
* **`tenant_staff`:** Scoped operational console access (e.g., uploads, catalog edits). Restrained from billing, domain configurations, and user membership edits.
* **`viewer`:** Branded storefront viewers. Scoped exclusively to account registration, billing rentals/subscriptions, video playback (signed URLs), watchlists, and reviews.

---

## 3. Microservice Endpoint References

---

### 3.1 Identity & Authentication Service (`/api/v1/auth`)

Handles user lifecycle, logins, token generation, email verification, and password resets.

#### `GET /health`
* **Auth Requirement:** None
* **Description:** Health check for the auth service.
* **Response (200 OK):**
  ```json
  { "status": "UP" }
  ```

#### `POST /signup`
* **Auth Requirement:** None
* **Description:** Register a new user account.
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "role": "viewer", // Optional. Enum: ['super_admin', 'tenant_admin', 'tenant_staff', 'viewer']
    "tenantId": "5f64b4c7-124b-4bda-a7d5-896ea351b0f1" // Optional for viewers or pre-assigned staff
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "message": "Signup successful. Verification OTP sent to email.",
    "user": {
      "id": "c9a0c4f6-8c46-4e5f-bf01-9a746535cd8e",
      "email": "user@example.com",
      "role": "viewer",
      "tenantId": "5f64b4c7-124b-4bda-a7d5-896ea351b0f1"
    }
  }
  ```

#### `POST /verify-email`
* **Auth Requirement:** None
* **Description:** Confirm email ownership via a 6-digit one-time code (OTP).
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Email verified successfully. You can now login."
  }
  ```

#### `POST /login`
* **Auth Requirement:** None
* **Description:** Sign in to obtain access and refresh tokens.
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "7d9a10cf-cbf3-4fb0-8d5f-9e7f6db0a68d",
    "user": {
      "id": "c9a0c4f6-8c46-4e5f-bf01-9a746535cd8e",
      "email": "user@example.com",
      "role": "viewer",
      "tenantId": "5f64b4c7-124b-4bda-a7d5-896ea351b0f1"
    }
  }
  ```

#### `POST /forgot-password`
* **Auth Requirement:** None
* **Description:** Trigger password recovery. Dispatches a 6-digit OTP code to the email address.
* **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "If the email exists, a password reset code has been sent."
  }
  ```

#### `POST /reset-password`
* **Auth Requirement:** None
* **Description:** Apply a new password using the OTP received.
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "654321",
    "password": "newSecurePassword2026"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Password reset successfully."
  }
  ```

#### `POST /refresh`
* **Auth Requirement:** None
* **Description:** Refresh an expired Access Token.
* **Request Body:**
  ```json
  {
    "refreshToken": "7d9a10cf-cbf3-4fb0-8d5f-9e7f6db0a68d"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

#### `POST /logout`
* **Auth Requirement:** Authenticated Session
* **Description:** Revoke the refresh token, logging the user session out.
* **Request Body:**
  ```json
  {
    "refreshToken": "7d9a10cf-cbf3-4fb0-8d5f-9e7f6db0a68d"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Logged out successfully."
  }
  ```

#### `GET /me`
* **Auth Requirement:** Bearer Token
* **Description:** Retrieve profile and configuration parameters for the current authenticated user context.
* **Response (200 OK):**
  ```json
  {
    "id": "c9a0c4f6-8c46-4e5f-bf01-9a746535cd8e",
    "email": "user@example.com",
    "role": "viewer",
    "tenantId": "5f64b4c7-124b-4bda-a7d5-896ea351b0f1",
    "createdAt": "2026-07-27T04:20:00.000Z"
  }
  ```

---

### 3.2 Tenant Management Service (`/api/v1/tenants`)

Controls the creation, branding configuration, custom domain binding, user provisioning, and authorization keys of tenants.

#### `GET /resolve`
* **Auth Requirement:** None
* **Description:** Resolve tenant information based on subdomain, hostname, or IP mapping.
* **Response (200 OK):**
  ```json
  {
    "id": "5f64b4c7-124b-4bda-a7d5-896ea351b0f1",
    "name": "Acme Films",
    "slug": "acme-films",
    "status": "ACTIVE",
    "branding": {
      "primaryColor": "#1a1a1a",
      "logoUrl": "https://cdn.acme.com/logo.png"
    }
  }
  ```

#### `POST /`
* **Auth Requirement:** `super_admin` only
* **Description:** Create a new tenant storefront profile on the platform.
* **Request Body:**
  ```json
  {
    "name": "Cyber Cinema",
    "slug": "cyber-cinema",
    "primarySubdomain": "cyber-cinema",
    "planType": "GROWTH",
    "billingEmail": "billing@cybercinema.com",
    "supportEmail": "support@cybercinema.com",
    "branding": {
      "logoUrl": "https://cdn.cybercinema.com/logo.png",
      "primaryColor": "#ff007f",
      "secondaryColor": "#00f0ff",
      "backgroundColor": "#0c0f12"
    },
    "limits": {
      "maxStorageBytes": 1099511627776, // 1TB
      "maxBandwidthBytes": 5497558138880, // 5TB
      "maxUsers": 10
    },
    "features": {
      "drmEnabled": true,
      "geoRestrictionsEnabled": true,
      "subtitlesEnabled": true
    }
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "id": "fa2b3e4a-b5d9-4d6d-8153-f726715b746c",
    "name": "Cyber Cinema",
    "slug": "cyber-cinema",
    "status": "ONBOARDING",
    "planType": "GROWTH",
    "billingStatus": "TRIALING",
    "createdAt": "2026-07-27T09:50:00.000Z"
  }
  ```

#### `GET /`
* **Auth Requirement:** `super_admin` only
* **Description:** Retrieve a list of all tenants registered on the SaaS platform.
* **Response (200 OK):**
  ```json
  [
    {
      "id": "fa2b3e4a-b5d9-4d6d-8153-f726715b746c",
      "name": "Cyber Cinema",
      "slug": "cyber-cinema",
      "status": "ACTIVE",
      "planType": "GROWTH"
    }
  ]
  ```

#### `GET /:id`
* **Auth Requirement:** `super_admin` or matching `tenant_admin` / `tenant_staff`
* **Description:** Retrieve details of a specific tenant.
* **Response (200 OK):**
  ```json
  {
    "id": "fa2b3e4a-b5d9-4d6d-8153-f726715b746c",
    "name": "Cyber Cinema",
    "slug": "cyber-cinema",
    "status": "ACTIVE",
    "planType": "GROWTH",
    "branding": { "primaryColor": "#ff007f" },
    "limits": { "maxUsers": 10 },
    "features": { "drmEnabled": true }
  }
  ```

#### `PUT /:id`
* **Auth Requirement:** `super_admin` or matching `tenant_admin`
* **Description:** Update core fields of a tenant profile. (Cannot update status through this path).
* **Request Body:** Partial matching creation schema parameters.

#### `PATCH /:id/status`
* **Auth Requirement:** `super_admin` only
* **Description:** Suspend, delete, or activate a tenant account.
* **Request Body:**
  ```json
  {
    "status": "SUSPENDED"
  }
  ```

#### `PUT /:id/branding`
* **Auth Requirement:** `super_admin` or matching `tenant_admin`
* **Description:** Update customer branding options (logo, colors, custom CSS).
* **Request Body:**
  ```json
  {
    "logoUrl": "https://cdn.cybercinema.com/logo-v2.png",
    "primaryColor": "#e6006f",
    "customCss": "body { font-family: 'Inter', sans-serif; }"
  }
  ```

#### `PUT /:id/limits`
* **Auth Requirement:** `super_admin` only
* **Description:** Update tenant storage, bandwidth, or staff quotas.
* **Request Body:**
  ```json
  {
    "maxStorageBytes": 2199023255552, // 2TB
    "maxBandwidthBytes": 10995116277760, // 10TB
    "maxUsers": 20
  }
  ```

#### `PUT /:id/features`
* **Auth Requirement:** `super_admin` only
* **Description:** Toggle tenant service entitlement features (e.g., DRM access).
* **Request Body:**
  ```json
  {
    "drmEnabled": false
  }
  ```

#### `DELETE /:id`
* **Auth Requirement:** `super_admin` only
* **Description:** Delete a tenant and trigger cascade deletion of domain bindings, users, and catalog references.

---

#### Tenant Custom Domain Management (`/:id/domains`)

#### `POST /:id/domains`
* **Auth Requirement:** `super_admin` or matching `tenant_admin`
* **Description:** Add a custom domain or subdomain to route to the tenant's storefront.
* **Request Body:**
  ```json
  {
    "host": "films.cybercinema.com",
    "type": "CUSTOM_DOMAIN" // Enum: ['SUBDOMAIN', 'CUSTOM_DOMAIN', 'PRIMARY_DOMAIN']
  }
  ```

#### `GET /:id/domains`
* **Auth Requirement:** `super_admin` or matching `tenant_admin` / `tenant_staff`
* **Description:** List domains registered for a tenant.
* **Response (200 OK):**
  ```json
  [
    {
      "id": "e4293f0b-4bd0-422e-a57c-d6b38c202bb9",
      "host": "films.cybercinema.com",
      "type": "CUSTOM_DOMAIN",
      "status": "PENDING",
      "verificationToken": "txt-verify-token-xyz-123",
      "isPrimary": false
    }
  ]
  ```

#### `PATCH /domains/:domainId/verify`
* **Auth Requirement:** `super_admin` or matching `tenant_admin`
* **Description:** Manually trigger dynamic DNS check verification for custom domain activation.
* **Response (200 OK):**
  ```json
  {
    "status": "VERIFIED",
    "lastVerifiedAt": "2026-07-27T09:52:00.000Z"
  }
  ```

#### `DELETE /domains/:domainId`
* **Auth Requirement:** `super_admin` or matching `tenant_admin`
* **Description:** Remove a domain mapping.

---

#### API Key Management (`/:id/keys`)

These keys allow scripts/API integrations to act under `tenant_admin` credentials on behalf of a tenant.

#### `POST /:id/keys`
* **Auth Requirement:** `super_admin` or matching `tenant_admin`
* **Description:** Generate a new API credential.
* **Request Body:**
  ```json
  {
    "name": "CI Ingest Script",
    "scopes": ["*"],
    "expiresAt": "2027-07-27T09:50:00.000Z" // Optional
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "id": "2138cd91-6383-4ee2-bb52-9b2f6ef32da2",
    "name": "CI Ingest Script",
    "apiKey": "sk_live_5f64...[RAW KEY RETURNED ONLY ONCE]",
    "keyPrefix": "sk_live",
    "expiresAt": "2027-07-27T09:50:00.000Z"
  }
  ```

#### `GET /:id/keys`
* **Auth Requirement:** `super_admin` or matching `tenant_admin`
* **Description:** List active key metadata (prefix, creation/expiration, last used timestamp). Keys are masked.

#### `DELETE /:id/keys/:keyId`
* **Auth Requirement:** `super_admin` or matching `tenant_admin`
* **Description:** Immediately revoke a credential key prefix.

---

#### Tenant Team Membership Management (`/:id/users`)

Allows tenant admins to provision permissions for their operational staff.

#### `POST /:id/users`
* **Auth Requirement:** `super_admin` or matching `tenant_admin`
* **Description:** Assign a platform user account to a tenant team membership role.
* **Request Body:**
  ```json
  {
    "userId": "c9a0c4f6-8c46-4e5f-bf01-9a746535cd8e",
    "role": "STAFF" // Enum: ['OWNER', 'ADMIN', 'STAFF', 'SUPPORT', 'ANALYST', 'VIEWER']
  }
  ```

#### `GET /:id/users`
* **Auth Requirement:** `super_admin` or matching `tenant_admin` / `tenant_staff`
* **Description:** List all staff users assigned to the tenant storefront console.

#### `PUT /:id/users/:userId`
* **Auth Requirement:** `super_admin` or matching `tenant_admin`
* **Description:** Change roles of an existing member (e.g. from `STAFF` to `ADMIN`).

#### `DELETE /:id/users/:userId`
* **Auth Requirement:** `super_admin` or matching `tenant_admin`
* **Description:** Remove team access from the user context for this tenant.

---

#### Audit Log Queries (`/:id/audit-logs`)

#### `GET /:id/audit-logs`
* **Auth Requirement:** `super_admin` or matching `tenant_admin`
* **Description:** Retrieve system event logs detailing configuration modifications, billing access, or domain removals.
* **Query Parameters:** Supports pagination parameters `page`, `limit`, and filters `action`, `entityType`.

---

### 3.3 Catalog Service (`/api/v1/catalog`)

Coordinates films, series, price indices, pricing structures, geo-restrictions, bundles, categories, guest reviews, and watchlists.

#### Film Management (`/films`)

#### `GET /films`
* **Auth Requirement:** None (Optional session context to inject user-entitled purchase state)
* **Description:** Fetch list of public published films. Scoped to the caller's resolved tenant context automatically.
* **Query Parameters:** `page`, `limit`, `genre`, `tag`, `search`.

#### `GET /films/:id`
* **Auth Requirement:** None
* **Description:** Retrieve public metadata, assets details (manifest URLs, posters), and chapters for a film.

#### `GET /films/slug/:slug`
* **Auth Requirement:** None
* **Description:** Retrieve a single film using its unique URL slug.

#### `POST /films`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Register a new film entry in draft status.
* **Request Body:**
  ```json
  {
    "title": "Quantum Horizon",
    "slug": "quantum-horizon",
    "description": "A sci-fi journey to the edge of space-time.",
    "contentType": "MOVIE", // Enum: ['MOVIE', 'SERIES', 'EPISODE', 'SHORT', 'TRAILER', 'BONUS']
    "status": "DRAFT", // Enum: ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED', 'UNPUBLISHED']
    "visibility": "PUBLIC", // Enum: ['PUBLIC', 'UNLISTED', 'PRIVATE']
    "pricingModel": "PPV", // Enum: ['PPV', 'RENTAL', 'SUBSCRIPTION', 'HYBRID', 'FREE']
    "accessWindow": "RENTAL_48H", // Enum: ['NONE', 'RENTAL_24H', 'RENTAL_48H', 'RENTAL_72H', 'LIFETIME', 'CUSTOM']
    "genres": ["Sci-Fi", "Adventure"],
    "geoRestrictionMode": "NONE" // Enum: ['ALLOWLIST', 'BLOCKLIST', 'NONE']
  }
  ```

#### `PUT /films/:id`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Update film metadata parameters.

#### `DELETE /films/:id`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Permanently delete a catalog film entry.

#### `PUT /films/:filmId/pricing`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Modify buying, renting, or hybrid package values.
* **Request Body:**
  ```json
  {
    "currency": "USD",
    "ppvPrice": 14.99,
    "rentalPrice": 4.99,
    "rentalDurationHours": 48,
    "subscriptionIncluded": false,
    "bundleEligible": true
  }
  ```

#### `PUT /films/:filmId/availability`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Lock availability date ranges or enable pre-orders.
* **Request Body:**
  ```json
  {
    "startsAt": "2026-08-01T00:00:00.000Z",
    "endsAt": "2027-08-01T00:00:00.000Z",
    "isAvailable": true
  }
  ```

---

#### Subordinate Assets (`/films/:filmId/assets`)

Tracks static file uploads like trailers, source files, raw inputs, posters.

#### `POST /films/:filmId/assets`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Attach a processed storage asset URL.
* **Request Body:**
  ```json
  {
    "type": "TRAILER",
    "storageKey": "tenants/tenant_1/films/film_abc/trailer.mp4",
    "url": "https://cdn.acme.com/trailer.mp4",
    "mimeType": "video/mp4",
    "sizeBytes": 250000000,
    "isPrimary": false,
    "isPublic": true
  }
  ```

#### `PUT /films/:filmId/assets/:assetId`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Edit asset details.

#### `DELETE /films/:filmId/assets/:assetId`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Disconnect asset from film metadata index.

---

#### Subordinate Subtitles (`/films/:filmId/subtitles`)

#### `POST /films/:filmId/subtitles`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Add WebVTT language tracks for HLS manifests.
* **Request Body:**
  ```json
  {
    "languageCode": "es",
    "kind": "SUBTITLE", // Enum: ['AUDIO', 'SUBTITLE', 'DUB']
    "label": "Spanish",
    "storageKey": "tenants/tenant_1/films/film_abc/sub_es.vtt",
    "url": "https://cdn.acme.com/sub_es.vtt",
    "isDefault": false
  }
  ```

#### `PUT /films/:filmId/subtitles/:subtitleId` & `DELETE /films/:filmId/subtitles/:subtitleId`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Update or delete subtitle track entries.

---

#### Subordinate Chapters (`/films/:filmId/chapters`)

Allows timeline visual markers (bookmarks) for viewers during playback.

#### `POST /films/:filmId/chapters`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Add timeline chapter marker.
* **Request Body:**
  ```json
  {
    "title": "The Big Bang",
    "startSeconds": 0,
    "endSeconds": 240,
    "orderIndex": 1
  }
  ```

#### `PUT` & `DELETE` paths for `/films/:filmId/chapters/:chapterId`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Modify or delete a chapter timeline marker.

---

#### Subordinate Transcoding HLS Variants (`/films/:filmId/variants`)

Holds transcode HLS resolution variants (e.g. 1080p, 720p).

#### `POST /films/:filmId/variants`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Bind a transcoded HLS stream rendition manifest key.
* **Request Body:**
  ```json
  {
    "name": "1080p Rendition",
    "qualityLabel": "1080p",
    "codec": "h264",
    "container": "ts",
    "storageKey": "tenants/tenant_1/films/film_abc/hls/1080p.m3u8",
    "bitrateKbps": 4500,
    "width": 1920,
    "height": 1080,
    "isDefault": true,
    "isReady": true
  }
  ```

#### `PUT` & `DELETE` paths for `/films/:filmId/variants/:variantId`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Modify or delete HLS variants.

---

#### Bundle Management (`/bundles`)

#### `GET /bundles`, `GET /bundles/:id`, `GET /bundles/slug/:slug`
* **Auth Requirement:** None
* **Description:** Public viewing paths to query film bundle package specifications.

#### `POST /bundles`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Publish a new video purchase package bundle.
* **Request Body:**
  ```json
  {
    "name": "Space Sci-Fi Pack",
    "slug": "space-sci-fi-pack",
    "description": "Get all sci-fi releases at 40% discount.",
    "price": 24.99,
    "currency": "USD",
    "filmIds": ["film-id-1", "film-id-2"]
  }
  ```

#### `PUT /bundles/:id` & `DELETE /bundles/:id`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Update or delete a bundle option.

---

#### Watchlist Operations (`/watchlist`)

#### `POST /watchlist`
* **Auth Requirement:** Authenticated Viewer
* **Description:** Bookmark a film.
* **Request Body:**
  ```json
  {
    "filmId": "fa2b3e4a-b5d9-4d6d-8153-f726715b746c",
    "notes": "Must watch this weekend"
  }
  ```

#### `GET /watchlist`
* **Auth Requirement:** Authenticated Viewer
* **Description:** List the caller's bookmarked films.

#### `DELETE /watchlist/:filmId`
* **Auth Requirement:** Authenticated Viewer
* **Description:** Remove from watchlist.

---

#### Ratings & Reviews Operations (`/ratings`)

#### `GET /ratings/film/:filmId`
* **Auth Requirement:** None (Optional session context to view user-written reviews)
* **Description:** Get all published reviews/ratings for a specific film. Unpublished reviews are filtered out for guests.

#### `POST /ratings`
* **Auth Requirement:** Authenticated Viewer
* **Description:** Write or update a star rating (1 to 5) and review text.
* **Request Body:**
  ```json
  {
    "filmId": "fa2b3e4a-b5d9-4d6d-8153-f726715b746c",
    "rating": 5,
    "reviewTitle": "Incredible visuals!",
    "reviewBody": "Best science fiction film of the decade. Hands down."
  }
  ```

#### `PUT /ratings/:id` & `DELETE /ratings/:id`
* **Auth Requirement:** Authenticated Viewer (Must match review owner)
* **Description:** Edit or delete review rating entry.

#### `GET /ratings`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Admin dashboard list path to query and moderate all review submissions across the tenant storefront.

---

### 3.4 Upload Service (`/api/v1/upload`)

Orchestrates multi-part file chunks uploads, metadata validations, probes, and pipeline execution triggers.

#### `POST /`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Register an intent to upload a video file, triggering ingest job creation.
* **Request Body:**
  ```json
  {
    "filmId": "fa2b3e4a-b5d9-4d6d-8153-f726715b746c", // Optional
    "sourceType": "DIRECT", // Enum: ['DIRECT', 'RESUMABLE', 'S3_IMPORT', 'URL_IMPORT', 'MIGRATED']
    "originalFileName": "master_quantum_4k.mp4",
    "contentType": "video/mp4",
    "fileSizeBytes": 12500000000, // 12.5GB
    "checksumSha256": "abcdef1234567890f..." // Optional
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "id": "job_9281313-a7d5-896e-a7d5-8292120fa2bc",
    "status": "CREATED",
    "originalFileName": "master_quantum_4k.mp4",
    "storageProvider": "R2",
    "uploadUrl": "https://r2.cloudflare.com/temporary-presigned-put-url...",
    "maxRetries": 3
  }
  ```

#### `GET /`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** List ingest jobs matching caller's tenant.

#### `GET /:id`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Retrieve current status, validation summary, metadata, probes, and errors of an upload job.
* **Response (200 OK):**
  ```json
  {
    "id": "job_9281313-a7d5-896e-a7d5-8292120fa2bc",
    "status": "PROCESSING",
    "originalFileName": "master_quantum_4k.mp4",
    "fileSizeBytes": 12500000000,
    "validationStatus": "PASSED",
    "durationSeconds": 7200,
    "width": 3840,
    "height": 2160,
    "bitrateKbps": 13800,
    "codecVideo": "h264",
    "codecAudio": "aac",
    "containerFormat": "mov,mp4,m4a"
  }
  ```

#### `PUT /:id`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Update upload job parameters (used by worker nodes to report media dimensions, validation status, error messages, etc.).
* **Request Body:** Partial matching creation schema parameters.

#### `DELETE /:id`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Cancel and purge an upload job.

---

#### Nested Sub-Routers (`/:jobId/...`)

These routes report internal steps and parts. Typically accessed by ingestion workers or clients running direct chunked uploads.

#### `POST /:jobId/parts`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Log successful write of a multipart chunk upload sequence.
* **Request Body:**
  ```json
  {
    "partNumber": 1,
    "byteStart": 0,
    "byteEnd": 5242880, // 5MB chunk
    "fileSizeBytes": 5242880,
    "etag": "etag-chunk-checksum"
  }
  ```

#### `POST /:jobId/validations`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Log a specific validation event code report (e.g. resolution check, codec checks).
* **Request Body:**
  ```json
  {
    "code": "BAD_RESOLUTION", // Enum of validation failure codes
    "status": "WARNING", // Enum: ['PENDING', 'PASSED', 'FAILED', 'WARNING']
    "severity": "warning",
    "message": "Resolution 3840x2160 differs from the standard HD profile expectations.",
    "fieldName": "width",
    "expectedValue": "1920",
    "actualValue": "3840"
  }
  ```

#### `POST /:jobId/events`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Record audit progress timeline hooks (e.g. "VIRUS_SCAN_COMPLETED", "PROBE_SUCCESS").
* **Request Body:**
  ```json
  {
    "eventType": "VIRUS_SCAN_COMPLETED",
    "payload": {
      "scannedAt": "2026-07-27T09:51:00.000Z",
      "clean": true
    }
  }
  ```

#### `POST /:jobId/artifacts`
* **Auth Requirement:** `super_admin`, `tenant_admin`, or `tenant_staff`
* **Description:** Register references of processed assets outputted by transcoding pipelines (e.g. thumbnails, manifest directories).
* **Request Body:**
  ```json
  {
    "kind": "HLS_MANIFEST",
    "name": "master.m3u8",
    "storageProvider": "R2",
    "storageKey": "tenants/tenant_1/films/film_abc/hls/master.m3u8",
    "url": "https://cdn.acme.com/hls/master.m3u8",
    "mimeType": "application/x-mpegURL",
    "sizeBytes": 1200
  }
  ```

---

## 4. Error Response Format

The platform downstreams and API gateway use standard JSON structures for returning request failures:

```json
{
  "error": "Bad Request",
  "message": "Validation failed: 'email' must be a valid email address.",
  "statusCode": 400,
  "timestamp": "2026-07-27T09:50:35.000Z"
}
```

### Common HTTP Status Codes
* `400 Bad Request`: Payload validation failure or invalid UUID format.
* `401 Unauthorized`: Access token is missing, expired, or invalid.
* `403 Forbidden`: Authenticated context does not have the permissions required for the requested resource (or cross-tenant boundary violation).
* `404 Not Found`: Target endpoint, film ID, or tenant ID does not exist in db.
* `429 Too Many Requests`: Rate limit threshold exceeded for the resolved tenant.
* `500 Internal Server Error`: An unexpected backend error occurred.
