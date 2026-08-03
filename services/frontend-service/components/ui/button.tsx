import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        const baseClass = "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]";
        
        const variantClasses = {
            default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/10",
            destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
            outline: "border border-border/80 dark:border-gray-800 bg-background hover:bg-muted hover:text-foreground text-muted-foreground",
            secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
            ghost: "hover:bg-muted hover:text-foreground text-muted-foreground",
            link: "text-primary underline-offset-4 hover:underline",
        };

        const sizeClasses = {
            default: "h-9 px-4 py-2",
            sm: "h-8 rounded-md px-3 text-xs",
            lg: "h-10 rounded-md px-8",
            icon: "h-9 w-9",
        };

        const classes = [
            baseClass,
            variantClasses[variant],
            sizeClasses[size],
            className
        ].filter(Boolean).join(" ");

        return (
            <button ref={ref} className={classes} {...props} />
        );
    }
);
Button.displayName = "Button";

export { Button };
