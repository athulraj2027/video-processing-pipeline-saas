# Pay-Per-View VOD SaaS Platform
## Full Project Specification

---

## Table of Contents
- [1. Project Overview](#1-project-overview)
- [2. Product Scope](#2-product-scope)
- [3. User Roles & Workflows](#3-user-roles--workflows)
- [4. Feature List](#4-feature-list)
- [5. Video Processing Pipeline](#5-video-processing-pipeline)
- [6. Microservices Architecture](#6-microservices-architecture)
- [7. Folder Structure (Monorepo)](#7-folder-structure-monorepo)
- [8. Infrastructure Notes](#8-infrastructure-notes-single-tenant-reference-deployment-12gb-constraint)
- [9. Key Decisions & Rationale](#9-key-decisions--rationale)
- [10. Suggested Build Order](#10-suggested-build-order)
- [11. Edge Cases to Design For Early](#11-edge-cases-to-design-for-early)
- [12. Competitive Landscape & Pricing Model](#12-competitive-landscape--pricing-model)
- [13. Open Questions to Resolve Before Building](#13-open-questions-to-resolve-before-building)

---

## 1. Project Overview

* **What this is:** A multi-tenant SaaS platform that lets studios/creators ("tenants") launch their own branded pay-per-view (PPV) / subscription (SVOD) video streaming storefront — without building their own video infrastructure. Think "Shopify for streaming video," modeled loosely on Uscreen / Vimeo OTT.
* **What this is not (v1):** Not a live-streaming platform. Video-on-demand only.
* **Core value proposition:**
  - Tenants upload finished films/videos &rarr; platform handles transcoding, subtitles, thumbnails, delivery, payments, and playback security.
  - Tenants monetize via PPV, rental windows, or subscriptions.
  - Platform takes a SaaS fee + optional transaction cut.

---

## 2. Product Scope

### v1 (Single-tenant proof of concept)
Prove the core pipeline works end-to-end for one catalog owner before building multi-tenancy.

### v1.5 (Multi-tenant SaaS)
Retrofit multi-tenancy, billing, self-serve onboarding, and white-label storefronts.

### v2+ (Scale & differentiation)
DRM, per-title encoding, API/webhooks for integrators, custom domains, and enterprise features (SSO, audit logs).

---

## 3. User Roles & Workflows

### 3.1 Platform Super Admin (SaaS operator)
1. **Dashboard Monitoring:** Monitors platform-wide metrics (MRR, active tenants, churn, infrastructure health).
2. **Tenant Approvals:** Approves and reviews new tenant signups.
3. **Lifecycle Management:** Suspends, upgrades/downgrades, or applies custom usage overrides.
4. **Platform Billing:** Handles Stripe subscription events and dunning workflows.
5. **Cost vs. Revenue Analysis:** Monitors storage/bandwidth costs against revenue generated per tenant.
6. **Support Escalation:** Impersonates tenants to resolve issues.
7. **Entitlements Management:** Reviews DRM and premium feature entitlements per plan.
8. **Compliance:** Reviews platform-wide DMCA escalations.

### 3.2 Tenant Admin (studio/creator)
1. **Onboarding:** Signs up, selects a plan, and configures subdomain/branding.
2. **Team Access:** Invites staff members with scoped permissions.
3. **Catalog Management:** Uploads films, triggers automatic pipelines, sets pricing, rental windows, geo-restrictions, and publishes.
4. **Monetization Setup:** Configures PPV, subscription, or hybrid payment models, bundles, and coupons.
5. **Payout Settings:** Connects a Stripe Connect account for automated payouts.
6. **Analytics Tracking:** Monitors sales, retention, conversion rates, and storage/bandwidth consumption.
7. **Viewer Support:** Manages customer support and processes refunds.
8. **Compliance:** Handles DMCA and regional compliance settings.
9. **Scaling Plan:** Upgrades SaaS plan tier when resource limits are reached.

### 3.3 Tenant Staff
1. **Scoped Console Access:** Limits access to uploading content and editing catalog features (no access to billing or team configuration).
2. **Media Ops:** Uploads content, tracks pipeline status, and reviews transcode output prior to publishing.
3. **Viewer Support:** Provides first-line customer support, escalating refund requests to the Tenant Admin.

### 3.4 Viewer (end customer)
1. **Storefront Landing:** Browses catalog on tenant's branded, custom-themed website.
2. **Discovery:** Browses and searches content dynamically.
3. **Auth:** Tenant-scoped customer account registration and login.
4. **Checkout:** Purchases/subscribes via Stripe Connect checkout flow.
5. **Playback:** Secured via signed URLs. Supports multi-bitrate HLS playback, subtitle selection, and cross-device resume.
6. **Account Console:** Manages purchase histories, active subscriptions, and profile details.
7. **Support Request:** Submits requests for support or refunds directly to the tenant.

### 3.5 Support / Ops Role
* **Platform-side:** Resolves tenant billing issues, infrastructure complaints, and escalated DMCA reports.
* **Tenant-side:** Resolves viewer refunds, access issues, and playback complaints.
* Requires a dedicated "support" permission tier, rather than sharing administrative credentials.

> [!IMPORTANT]
> **Open Design Decision:** Are viewer accounts scoped per-tenant, or unified across tenants (like one Amazon account across sellers)?
> * **Recommendation:** **Per-tenant accounts for v1.**
> * **Rationale:** Per-tenant is simpler and better isolated. A unified cross-tenant identity adds real complexity to entitlements, billing, and data separation.

---

## 4. Feature List

### Content & Upload (Admin)
- **4K MP4 Upload:** Automatically triggers backend ingest and processing.
- **Rich Metadata:** Title, description, cast, genre, tags, release date, and artwork/banners.
- **Subtitles:** Multi-language subtitle tracks (auto-generated using AI speech-to-text with manual overrides).
- **Scrub-Preview Thumbnails:** Sprite sheets generated automatically for video player scrubbing.
- **Auto-Trailers:** AI scene-detection based trailer clipping or manual trailer upload.
- **Pipeline Monitoring:** Granular track status: `uploading` &rarr; `transcoding` &rarr; `subtitling` &rarr; `review` &rarr; `published`.
- **Bulk Uploads:** Batch upload queue with concurrent job monitoring.
- **System Health:** Container/infrastructure health indicators.

### Catalog & Discovery
- **Search & Filters:** Search catalog with genre, language, and release year filters.
- **Recommendation Engine:** Tag-similarity recommendation rail to start.
- **Viewer Tools:** Watchlist, continue watching queue, and historical view logs.
- **Reviews (Optional):** Interactive ratings and reviews (introduces moderation burden).

### Monetization
- **PPV Purchase:** Single film purchase integration via Stripe.
- **Rental Windows:** Time-limited access (e.g., 48-hour viewing window) vs. permanent purchase ownership.
- **Subscriptions (SVOD):** Flat monthly/yearly fees with full or partial catalog access.
- **Hybrid Monetization:** Mixed catalogs (some titles are subscription-included, others are PPV/rental-only).
- **Promotions:** Bundling, digital gift codes, and custom promotional coupon codes.
- **Entitlement Engine:** Centralized entitlement records (`user_id`, `film_id`, `expires_at`, `purchase_type`).
- **Access Gating:** Signed playback URLs generated and validated against entitlements.
- **Billing Ops:** Digital invoices, transaction receipts, and customer refund processing.

### Playback
- **Adaptive Bitrate HLS:** Powered by `hls.js` with manual resolution selection (`2K`, `1080p`, `720p`, `480p`).
- **Subtitle Controls:** Toggleable multi-language subtitle tracks.
- **Scrub-Preview:** Visual thumbnails displayed on the timeline scrub bar.
- **Resume Playback:** Saved playback state synced to resume watching across devices.

### Multi-Tenancy (v1.5)
- **Onboarding:** Self-serve tenant registration with automated subdomain routing (e.g., `tenant.yourapp.com`).
- **White-Label Branding:** Branded logo uploading, custom color palettes, and styled video player skin.
- **Isolated Tenant Dashboard:** Tenant admins see only their own scoped workspace and users.
- **API Keys:** Secure access credentials for developers to manage their assets programmatically.
- **Custom Domains:** CNAME domain mapping (Paid add-on, deferred to post-v1).

### Billing
- **Platform SaaS Plans:** Tiered subscription structures (based on storage, bandwidth, title counts, and transcode minutes).
- **Overage Metrics:** Automatic calculation of pay-as-you-go bandwidth/storage overage charges.
- **Transaction Processing:** Automated billing fee cuts per transaction (flat fee + % of tenant PPV transactions via Stripe Connect).

### Analytics
- **Tenant Analytics:** Storefront sales, customer retention, watch-time distributions, conversion funnels, and trending content.
- **Platform Analytics:** MRR, churn rate, infrastructure cost attribution vs. revenue generated per tenant.

### Admin/Ops Tools
- **Sales Hub:** Revenue charts, revenue split tracking, and top-selling media reports.
- **Account Controls:** User account locking, refund tools, and subscription overrides.
- **Compliance Control:** Manual content takedowns and regional geo-restrictions.
- **Social Publisher:** Auto-publish trailers to YouTube, Instagram, and TikTok.

### Security & Compliance
- **Data Isolation:** Row-Level Security (RLS) policies implemented at the database level.
- **DRM (Digital Rights Management):** Widevine and FairPlay protection (Premium tier add-on).
- **DMCA Workflow:** Integrated copyright claim submission and takedown interface.
- **Audit Logging:** System actions logged for tenant configuration changes and billing actions.

### Developer Surface
- **API Access:** Public API for managing catalog assets.
- **Webhooks:** Automated webhooks for critical events (`purchase.completed`, `transcode.completed`, `subtitle.generated`).
- **Player SDK:** Lightweight player embedding script.

---

## 5. Video Processing Pipeline

### Core Stages
1. **Upload Validation:** Sanity check resolution, duration, bitrate, and file integrity before initiating resource-heavy compute jobs.
2. **Transcoding:** Multi-bitrate transcoding (4K source down to `2K`/`1080p`/`720p`/`480p` renditions) using `FFmpeg`.
3. **HLS Packaging:** Segmenting files into `.ts` chunks and compiling master and rendition `.m3u8` manifests.
4. **Subtitle Generation:** Transcription via `faster-whisper`, translated using translation models (NLLB-200 or translation APIs), and outputted to multi-language WebVTT files.
5. **Thumbnail Generation:** High-res poster frames + scrub-preview sprite sheet generation with timeline `.vtt` mapping.
6. **Audio Normalization:** EBU R128/LUFS loudness standard target normalization, transcoded to stereo AAC.

### Additional Processing to Consider
| Feature | Why | Priority |
| :--- | :--- | :--- |
| **AV1 / HEVC Encoding** | 30–50% better compression, lower storage and CDN egress costs. | **v2** (due to device compatibility tradeoffs) |
| **Two-Pass / CRF Encoding** | Significantly improves quality-per-bit ratio. | **v1.5** |
| **Forensic Watermarking** | Session/user-specific watermarks to deter PPV piracy. | **v1.5** |
| **DRM Integration** | Strong encryption (Widevine/FairPlay) to prevent direct segment downloads. | **v2** (Premium tier) |
| **Scene/Chapter Detection** | Automatically detects video scene changes to generate trailers & chapter markers. | **v1.5** |
| **Video Fingerprinting** | Digital fingerprinting to automatically detect duplicate uploads and pirated material. | **v2+** |
| **Audio Description Tracks** | Accessibility Compliance (legally required for governmental and enterprise markets). | **v1.5 - v2** |
| **Per-Title Encoding** | Dynamic optimization of bitrate depending on video complexity (e.g., action movie vs. talk show). | **v2** |

### Pipeline Roadmap Priority
* **v1:** Transcoding, HLS Packaging, Subtitles, Thumbnails, Audio Normalization, and Signed Playback URLs.
* **v1.5:** Forensic Watermarking, Chapter & Scene Detection.
* **v2:** DRM, Per-Title Encoding, AV1 Codec.

---

## 6. Microservices Architecture

| Service | Responsibility | Data Store |
| :--- | :--- | :--- |
| **Identity/Auth** | Tenant and viewer authentication, role resolution, and JWT management. | PostgreSQL |
| **Tenant Management** | Tenant CRUD lifecycle, custom subdomain routing, and branding parameters. | PostgreSQL |
| **Catalog** | Film metadata, catalog organization, pricing structures, and geo-restrictions. | PostgreSQL |
| **Upload/Ingest** | Secure file uploading, initial sanity validation, and queue dispatch. | PostgreSQL + Cloudflare R2 |
| **Job Orchestrator** | Pipeline orchestration, failure recovery, worker task scheduling, and state reporting. | Redis + PostgreSQL |
| **Transcode Worker** | Executing `FFmpeg` multi-bitrate HLS conversion tasks. | Stateless (utilizes R2) |
| **Subtitle Worker** | Running speech-to-text (`faster-whisper`) and translation (`NLLB-200`). | Stateless (utilizes R2) |
| **Thumbnail Worker** | Poster frames, scrub-preview sprite generation, and `.vtt` file compilation. | Stateless (utilizes R2) |
| **Entitlement** | Storing active customer entitlements, checking rental windows and subscription status. | PostgreSQL |
| **Billing (Platform)** | Tracking SaaS plan tiers, usage metrics, and subscription cycles. | Stripe + PostgreSQL |
| **Payments (Tenant)** | Managing viewer Stripe Connect checkouts and payout transactions. | Stripe Connect |
| **Playback** | Validating entitlements and generating short-lived signed media URLs. | Cloudflare Worker + Redis |
| **Analytics** | Tracking viewer watch-time, engagement graphs, and sales analytics. | ClickHouse or Postgres + TimescaleDB |
| **Notification** | Dispatching system emails, transactional receipts, and webhook events. | Redis + Amazon SES/Resend |
| **Support/Ops** | Managing ticketing, logs, and admin session impersonation flows. | PostgreSQL |
| **DRM Service** | Key distribution and license issuance for protected content. | Third-party License server |

### Communication Patterns
* **Synchronous (REST / gRPC):** Used for low-latency operations like authentication checks, catalog retrieval, and playback entitlement validation during startup.
* **Asynchronous (Event Bus):** Used to decouple stages of the media pipeline and side-effects. Utilizes Redis Streams or NATS (Kafka is bypassed to avoid infrastructure bloat).
  * *Example Event Flow:* `film.uploaded` &rarr; Ingest notifies Orchestrator &rarr; Transcode Worker starts. On `transcode.completed`, Subtitle and Thumbnail workers run in parallel. On `purchase.completed` &rarr; Entitlement and Billing services update.

### Gateway & Edge Routing
* **Edge API Gateway:** Dynamic tenant resolution by incoming host name (handles custom domains natively instead of parsing subdomains). Manages routing, global rate-limiting, and early JWT validation.
* **Cloudflare Worker:** Lightweight, globally distributed proxy handling secure token checks and generating signed URLs directly in front of Cloudflare R2 CDN buckets.
* **Nginx:** Internal reverse-proxy routing requests across microservices.

### Data Isolation & Scaling
* **Database Tenant Isolation:** A single PostgreSQL cluster utilizing `tenant_id` scopes with strict PostgreSQL Row-Level Security (RLS) policies.
* **Storage Isolation:** Cloudflare R2 storage directories organized using the `tenant_id/film_id/...` pattern, ensuring absolute partition security and easy bulk deletes.
* **Horizontal Auto-scaling:** Workers (Transcode, Subtitle, Thumbnail) run in scale-out pools driven by job queue depth. Stateless API services scale based on memory footprint thresholds.
* **Consistency:** Entitlement and Billing workflows bypass aggressive caching to eliminate double-spend/unauthorized access races.

---

## 7. Folder Structure (Monorepo)

```text
saas-vod-platform/
├── services/
│   ├── identity-service/
│   ├── tenant-service/
│   ├── catalog-service/
│   ├── upload-service/
│   ├── job-orchestrator/
│   ├── transcode-worker/
│   ├── subtitle-worker/        # Python (faster-whisper/NLLB)
│   ├── thumbnail-worker/
│   ├── entitlement-service/
│   ├── billing-service/        # platform ← tenant
│   ├── payments-service/       # viewer ← tenant (Connect)
│   ├── playback-service/       # + Cloudflare Worker script
│   ├── analytics-service/
│   ├── notification-service/
│   ├── support-service/
│   └── drm-service/            # optional/premium
├── gateway/
│   ├── edge-api/
│   └── nginx/
├── apps/
│   ├── admin-dashboard/        # tenant admin + super admin
│   ├── storefront/             # viewer-facing, themed per tenant
│   └── player-sdk/             # embeddable player
├── libs/
│   ├── event-bus/              # NATS/Redis Streams wrapper
│   ├── db-client/              # Postgres + RLS helpers
│   ├── auth-middleware/
│   ├── types/
│   └── logger/
├── infra/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   ├── k8s/                    # (or Swarm configuration)
│   ├── terraform/              # Infrastructure-as-code for Cloudflare R2, DNS
│   └── scripts/
├── docs/
│   ├── spec.md
│   ├── architecture.md
│   ├── api-specs/
│   └── event-schemas/
├── .env.example
└── README.md
```

> [!NOTE]
> * Shared logic is maintained in `libs/` to prevent drift (auth middleware, db client connections, event-bus wrappers).
> * The `subtitle-worker` utilizes Python (to run native ML audio models) and is packaged independently of the TypeScript/Node.js monorepo codebase.
> * Establishing schema validation in `docs/event-schemas/` early is critical to prevent integration bugs across distributed workers.

---

## 8. Infrastructure Notes (Single-Tenant Reference Deployment, 12GB Constraint)

| Container | RAM Budget |
| :--- | :--- |
| **HLS Converter** | 4 – 5 GB |
| **Workers** (Subtitles, Thumbnails, Ingest) | 2.5 – 3 GB |
| **Edge API Gateway** (Auto-scale trigger @ 900MB/1024MB, up to 2 replicas) | 1 GB &times; N |
| **Admin Panel** | 512 MB – 1 GB |
| **Redis** (Job Queue & Cache) | 256 – 512 MB |
| **PostgreSQL** | 1 – 1.5 GB |
| **Nginx** | 128 – 256 MB |

> [!WARNING]
> **Autoscaling Limitation:** Plain `docker-compose` does not support native auto-scaling. Production dynamic scaling requires Docker Swarm mode (`docker service scale`, lightweight option) or Kubernetes (`k3s` / `k8s`), coupled with a lightweight monitoring agent that polls stats and triggers replica scale-out when memory limits are exceeded.

**Stack Summary:** Docker Containers + Cloudflare (CDN, Workers for Signed URL validation, R2 storage bucket) + Nginx reverse proxy.

---

## 9. Key Decisions & Rationale

| Decision Topic | Recommendation | Rationale |
| :--- | :--- | :--- |
| **Streaming Style** | **VOD-only** for v1. | Live streaming requires complex real-time pipeline management. Focusing strictly on VOD ensures core business validation first. |
| **Tenancy Roadmap** | Start **Single-tenant**; scale to multi-tenant. | Multi-tenancy adds significant software engineering overhead. Validate value loop with 2–3 early clients first. |
| **Custom Domains** | Subdomains for v1; custom domains as paid add-on later. | Custom domains require complex CNAME matching, automated TLS provisioning, and routing management. |
| **Domain Resolution** | Host header lookup from day one. | Bypasses subdomain-only parsing logic, making the addition of custom domains a zero-refactor feature later. |
| **Viewer Authentication** | Scoped per-tenant accounts. | Simplifies identity, access token boundaries, and entitlement tracking compared to a unified cross-tenant account. |
| **DB Tenancy Model** | Shared database + Row-Level Security (RLS). | Optimal balance between infrastructure cost-efficiency and data security. |
| **Broker Technology** | Redis Streams or NATS. | Apache Kafka introduces severe operational overhead that is unjustified at this phase. |
| **Content Security** | Signed URLs (v1) &rarr; DRM (v2). | Playback signature URLs stop hotlinking immediately; premium DRM is too costly and complex for initial launch. |
| **Codec Strategy** | **H.264** base profile. | Ensures 100% universal device playback compatibility. Optimize with AV1/HEVC encoding later to save egress costs. |

---

## 10. Suggested Build Order

### Phase 1: Core Pipeline & Single-Tenant Loop
1. **Pipeline Ingest:** MP4 upload &rarr; `FFmpeg` transcoding &rarr; HLS segmentation &rarr; Cloudflare R2 upload.
2. **Access Control:** User Auth, entitlement logs, and Stripe checkout page.
3. **Player Integration:** Signed URL play validation in front of CDN files.
4. **Browse & Discovery:** Simple catalog search and category listing.
5. **AI Enhancements:** Subtitle generation (Whisper) and timeline scrub-preview sprites.
6. **Operations:** Simple admin dashboard tracking sales and upload queues.

### Phase 2: Multi-Tenant SaaS Retrofit
7. **SaaS Architecture:** Tenant record model, Row-Level Security rules, and subdomain routing.
8. **Tenant Registration:** Self-serve client onboarding, custom landing, and SaaS Stripe Subscription plans.
9. **Creator Console:** Tenant-specific catalog uploads, asset settings, and customer revenue lists.
10. **Revenue Splits:** Stripe Connect implementation for automated payout splits (tenant payout vs. platform fee).
11. **Theming Engine:** Dynamic branding controls (injecting logo, colors, custom CSS variables to player).

### Phase 3: Scale, Security & Polish
12. **Analytics Aggregation:** Tenant analytics (watch charts, conversion drop-off) and SaaS operator dashboard (churn, infra margin).
13. **Integration Layer:** Public developer API and event webhooks.
14. **Video Protections:** Session-based visual watermarking and automated chapter generation.
15. **DRM Licensing:** Widevine/FairPlay key servers integration.
16. **Social Syndication:** Auto-trailers published to TikTok, YouTube, and Instagram API.
17. **Custom Domains:** Automated SSL and domain binding (CNAME management).
18. **Enterprise Compliance:** SSO integration, Audit Logs, and customized SLA models.

---

## 11. Edge Cases to Design For Early

* **Pipeline Failures:** Elegant worker panic recovery, automatic retry scheduling, and prompt admin alerting.
* **Entitlement Race Conditions:** Payment validation success arriving slightly after player requests content. Mitigated via a brief entitlement grace period.
* **Device Abuse:** Limiting concurrent playback streams per purchase entitlement (e.g., maximum 3 active sessions).
* **Domain Binding Failures:** Clear UI status indicators when a tenant configures DNS/CNAME incorrectly to prevent silent broken links.
* **Resource Starvation:** One tenant performing bulk catalog uploads should not starve the transcoding queues of other tenants. Solved using fair-queueing schedulers or queue limits.
* **Viewing Expiry:** Managing rental expiration mid-playback (e.g., stopping active streams gracefully rather than crashing player).

---

## 12. Competitive Landscape & Pricing Model

### 12.1 Competitor Comparison
| Platform | Pricing Structure | Key Characteristics & Notes |
| :--- | :--- | :--- |
| **Uscreen** | Flat SaaS plan (~$49–$199+/mo) + ~$2 per active subscriber/mo + 5–10% PPV transaction fee | Current market leader. Meters storage strictly by video minutes, charging steep overage fees. |
| **Vimeo OTT** | No flat fee; $1 per subscriber/mo + payment processing (SVOD), 10% + $0.50 per sale (PPV/TVOD) | Very affordable at zero subscribers. Becomes a massive "growth tax" as audiences grow; scales into expensive Enterprise plans. |
| **Muvi / Vodlix / Dacast** | Flat infrastructure-based tiers (focused on storage/bandwidth) | Positioned as direct alternatives to Vimeo/Uscreen per-subscriber fees; highly popular with scaling content networks. |
| **JW Player / Kaltura** | Custom enterprise contracts (high-volume bandwidth/storage model) | Aimed at media enterprises; high barrier to entry for standard creators. |

### 12.2 Market Opportunities
Currently, there are two primary pricing models in the VOD SaaS industry:
1. **Per-Subscriber Transaction Tax** (Vimeo OTT, Uscreen): Low entry cost, but becomes highly punitive as a tenant's business expands. While highly profitable for the platform, it causes significant customer friction.
2. **Flat Infrastructure Tiers** (Muvi): Highly predictable for the creator. However, it exposes the platform to financial risk if a tenant's video bandwidth consumption outpaces their tier limit.

### 12.3 Recommended Pricing Model
Position the platform as a **hybrid, predictable, creator-friendly model** targeting creators frustrated by standard platform subscriber taxes.

| Plan Tier | Target Audience | Fee Structure |
| :--- | :--- | :--- |
| **Starter** | Independent Creators | Flat fee (~$39–59/mo), set storage/bandwidth allowances, restricted titles. First 200 subscribers are free (no subscriber tax). |
| **Growth** | Growing Video Studios | Flat fee (~$150–250/mo) + lower, capped subscriber fee (~$0.50/sub), expanded storage. |
| **Enterprise** | Major Networks / Distributors | **Pure flat infrastructure-based pricing** (billing directly on storage/bandwidth/transcode). **No subscriber success tax**. |

> [!TIP]
> **Transaction Fee Strategy:** Match competitor rates of 5–10% per PPV sale rather than undercutting. Creators are highly sensitive to recurring subscriber taxes, but accept industry-standard transaction cuts for processing.

#### Key Positioning Takeaway
Do not try to be the cheapest platform. Compete on **predictability at scale**. An Enterprise plan with no subscriber penalty directly targets Uscreen and Vimeo's biggest customer pain point.

### 12.4 Validation & Financial Sanity Checks
- **Customer Interviews:** Discuss with 2–3 target creators. Verify if "no subscriber tax" is a compelling differentiator.
- **Break-Even Analysis:** Model actual bandwidth, storage, and transcoding compute costs against Starter tier margins.
- **Revenue Share Alignment:** Confirm if the platform fee (Section 6, Billing service) includes a percentage cut of all PPV transactions, or if SaaS tiers represent the sole revenue source.

---

## 13. Open Questions to Resolve Before Building

1. **Viewer Identity:** Should viewer accounts be per-tenant (strictly isolated) or unified across the network?
2. **Platform Fee Scope:** Do we charge a transaction percentage on top of SaaS monthly fees, or does the subscription cover all usage?
3. **DRM Necessity:** Is baseline DRM required for v1 to attract piracy-sensitive studios, or is HLS signed URLs sufficient to launch?
4. **Database Multi-Tenancy:** Is a single database with RLS policies adequate, or do we need automated database provisioning per enterprise client?
5. **Customer Validation:** Have prospective clients verified the core feature roadmap before starting development?
