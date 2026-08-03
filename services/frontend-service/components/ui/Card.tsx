import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "interactive" | "glass" | "primary";
    padding?: "none" | "sm" | "md" | "lg";
    children?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
        const baseClass = "rounded-xl border transition-all duration-300";
        
        const variantClasses = {
            default: "border-border/80 dark:border-gray-800 bg-card text-card-foreground",
            interactive: "border-border/80 dark:border-gray-800 bg-card text-card-foreground hover:-translate-y-1 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 dark:hover:shadow-primary/10 motion-reduce:hover:translate-y-0",
            glass: "border-border/60 dark:border-gray-800/80 bg-card/40 dark:bg-zinc-950/20 backdrop-blur-md text-card-foreground",
            primary: "border-transparent bg-primary text-primary-foreground shadow-md shadow-primary/5 dark:shadow-primary/10",
        };

        const paddingClasses = {
            none: "p-0",
            sm: "p-4",
            md: "p-6",
            lg: "p-8",
        };

        const classes = [
            baseClass,
            variantClasses[variant],
            paddingClasses[padding],
            className
        ].filter(Boolean).join(" ");

        return (
            <div ref={ref} className={classes} {...props}>
                {children}
            </div>
        );
    }
);
Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={["flex flex-col gap-1.5 pb-4", className].filter(Boolean).join(" ")}
                {...props}
            >
                {children}
            </div>
        );
    }
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children?: React.ReactNode;
}

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <h3
                ref={ref}
                className={["text-lg font-semibold leading-none tracking-tight", className].filter(Boolean).join(" ")}
                {...props}
            >
                {children}
            </h3>
        );
    }
);
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children?: React.ReactNode;
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={["text-sm text-muted-foreground opacity-90", className].filter(Boolean).join(" ")}
                {...props}
            >
                {children}
            </p>
        );
    }
);
CardDescription.displayName = "CardDescription";

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={["text-sm leading-relaxed", className].filter(Boolean).join(" ")}
                {...props}
            >
                {children}
            </div>
        );
    }
);
CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={["flex items-center pt-4", className].filter(Boolean).join(" ")}
                {...props}
            >
                {children}
            </div>
        );
    }
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
