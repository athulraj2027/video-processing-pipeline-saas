import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    shimmer?: boolean;
    color?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", shimmer = false, color, children, style, ...props }, ref) => {
        const baseClass = "group relative inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

        const isInlineColor = color && (color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl"));

        const getVariantClass = () => {
            if (variant !== "default") {
                const classes = {
                    destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                    outline: "border border-border/80 dark:border-gray-800 bg-background hover:bg-muted hover:text-foreground text-muted-foreground",
                    secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                    ghost: "hover:bg-muted hover:text-foreground text-muted-foreground",
                    link: "text-primary underline-offset-4 hover:underline",
                };
                return classes[variant];
            }

            if (!color) {
                return "bg-primary text-primary-foreground shadow-sm hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/30";
            }

            const tailwindColors: Record<string, string> = {
                primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/30",
                indigo: "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 dark:bg-indigo-500 dark:hover:bg-indigo-600",
                zinc: "bg-zinc-950 text-white hover:bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200",
                emerald: "bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30",
            };

            if (color in tailwindColors) {
                return tailwindColors[color];
            }

            return "text-white";
        };

        const sizeClasses = {
            default: "h-9 px-4 py-2",
            sm: "h-8 rounded-md px-3 text-xs",
            lg: "h-10 rounded-md px-8",
            icon: "h-9 w-9",
        };

        const overflowClass = shimmer ? "overflow-hidden" : "";

        const classes = [
            baseClass,
            getVariantClass(),
            sizeClasses[size],
            overflowClass,
            className
        ].filter(Boolean).join(" ");

        const customStyle: React.CSSProperties = {
            ...style,
            ...(isInlineColor ? { backgroundColor: color, boxShadow: `0 10px 15px -3px ${color}33` } : {})
        };

        return (
            <button ref={ref} className={classes} style={customStyle} {...props}>
                {shimmer && (
                    <span
                        aria-hidden="true"
                        className="absolute inset-0 -translate-x-[150%] skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out motion-safe:group-hover:translate-x-[150%]"
                    />
                )}
                <span className="relative flex items-center gap-2">
                    {children}
                </span>
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
