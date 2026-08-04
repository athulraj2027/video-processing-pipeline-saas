import { toast as sonnerToast } from "sonner";

/**
 * Unified toast utility. Wrap notifications in this custom module so that
 * any potential library migrations or custom global style overrides are centralized.
 */
export const toast = {
    success: (message: string, description?: string) => {
        return sonnerToast.success(message, {
            description,
        });
    },
    error: (message: string, description?: string) => {
        return sonnerToast.error(message, {
            description,
        });
    },
    info: (message: string, description?: string) => {
        return sonnerToast.info(message, {
            description,
        });
    },
    warning: (message: string, description?: string) => {
        return sonnerToast.warning(message, {
            description,
        });
    },
    // Fallback/Access to raw sonner instance
    raw: sonnerToast,
};
