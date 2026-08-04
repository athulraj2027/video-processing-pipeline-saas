import { Suspense, ReactNode } from "react";

interface AppSuspenseProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Reusable Suspense wrapper for handling loading states throughout the application.
 * Renders a visually aligned, premium spinner fallback by default.
 */
export default function AppSuspense({ children, fallback }: AppSuspenseProps) {
    const defaultFallback = (
        <div className="flex items-center justify-center min-h-[200px] w-full py-12">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-xs text-muted-foreground font-semibold tracking-wide animate-pulse">Loading...</p>
            </div>
        </div>
    );

    return (
        <Suspense fallback={fallback || defaultFallback}>
            {children}
        </Suspense>
    );
}
