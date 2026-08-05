---
name: frontend-service-ui-specs
description: Guidelines and technical specifications for the frontend service including colors, reusable components, and API integration utilities.
---

# Frontend Service UI & Architecture Specifications

Use these specifications when maintaining or creating new pages and components in the `frontend-service` workspace.

## 1. Design System & Color Palette
The app is styled using Vanilla CSS and Tailwind v4. The color tokens are defined as CSS custom properties in [globals.css](file:///d:/video-processing-pipeline/services/frontend-service/app/globals.css).

| Token | Light Mode Value | Dark Mode Value | Tailwind Color Mapping |
| :--- | :--- | :--- | :--- |
| `--background` | `#f8fafc` (Slate 50) | `#000000` (True Black) | `color-background` |
| `--foreground` | `#070809` (Slate 900) | `#f8fafc` | `color-foreground` |
| `--card` | `#ffffff` | `#000000` | `color-card` |
| `--card-foreground`| `#000000` | `#f8fafc` | `color-card-foreground`|
| `--border` | `#e2e8f0` (Slate 200) | `#000000` | `color-border` |
| `--primary` | `#1c1fa2` (Indigo 500) | `#165bc9` (Indigo 400) | `color-primary` |
| `--success` | `#10b981` | `#34d399` | `color-success` |

### Key Animations
- `reveal-blur`: Smooth entrance slide-up, fade-in, and blur transition.
- `fade-up`: Smooth translation and opacity transition.

---

## 2. Global Utilities & Core Abstractions

### API Requests (`fetchApi`)
All backend calls must use the unified request client from [api.ts](file:///d:/video-processing-pipeline/services/frontend-service/utils/api.ts).
- Automatically formats URLs and appends query variables.
- Serializes object bodies to JSON.
- Automatically reads and attaches authentication JWT `token` headers.
- Handles structured API responses and throws `ApiError` for `!response.ok`.

```typescript
import { fetchApi, ApiError } from "@/utils/api";

try {
    const data = await fetchApi<ResponseType>("/api/v1/some-endpoint", {
        method: "POST",
        body: { key: "value" },
    });
} catch (err) {
    if (err instanceof ApiError) {
        console.error(err.message, err.status, err.payload);
    }
}
```

### Environment Variables (`env.ts`)
Avoid accessing `process.env` directly. Use the validated config helper from [env.ts](file:///d:/video-processing-pipeline/services/frontend-service/utils/env.ts).
- Client-side variables (prefixed with `NEXT_PUBLIC_`) are validated in both client and server contexts.
- Server-only variables are dynamically validated only on server contexts to prevent runtime exceptions.

---

## 3. UI Component Library

### Toasts
Mount `<Toaster position="top-center" richColors />` in the layout. Always trigger notifications using the wrapped custom utility [toast.tsx](file:///d:/video-processing-pipeline/services/frontend-service/components/ui/toast.tsx) instead of the third-party package directly:

```typescript
import { toast } from "@/components/ui/toast";

toast.success("Action completed successfully!");
toast.error("An error occurred.");
```

### Suspense Loading Boundaries
Always wrap dynamic client components (especially those accessing URL search parameters or executing server fetches) in the custom `<AppSuspense>` component from [app-suspense.tsx](file:///d:/video-processing-pipeline/services/frontend-service/components/ui/app-suspense.tsx).

```typescript
import AppSuspense from "@/components/ui/app-suspense";

export default function Page() {
    return (
        <AppSuspense>
            <MyDynamicClientComponent />
        </AppSuspense>
    );
}
```
