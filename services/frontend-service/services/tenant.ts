import { fetchApi } from "@/utils/api";

export interface TenantBranding {
    logoUrl?: string | null;
    faviconUrl?: string | null;
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    playerSkin?: string;
    customCss?: string | null;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    status: string;
    planType: string;
    billingStatus: string;
    primarySubdomain?: string | null;
    primaryDomain?: string | null;
    customDomain?: string | null;
    branding?: TenantBranding;
    settings?: any;
    limits?: any;
    features?: any;
}

export const tenantService = {
    createTenant: async (name: string, slug: string) => {
        return fetchApi<{ tenant: Tenant }>("/api/v1/tenants", {
            method: "POST",
            body: { 
                name, 
                slug,
                primarySubdomain: slug,
            },
        });
    },

    getTenant: async (id: string) => {
        return fetchApi<{ tenant: Tenant }>(`/api/v1/tenants/${id}`, {
            method: "GET",
        });
    },
};
