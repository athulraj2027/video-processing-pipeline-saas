"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import { PAGE_CONTENTS } from "@/constants/constants";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const content = PAGE_CONTENTS[pathname] || PAGE_CONTENTS["/signin"];

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2">
                {/* Left Panel: Solid, plain brand background */}
                <div className="hidden lg:flex flex-col justify-center bg-muted/30 dark:bg-zinc-950/20 border-r border-border/80 dark:border-gray-800/80 p-16">
                    <div className="max-w-md mx-auto space-y-4">
                        <span className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground px-3.5 py-1 text-xs font-semibold tracking-wide">
                            {content.badge}
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl leading-[1.15]">
                            {content.title}
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                            {content.description}
                        </p>
                    </div>
                </div>

                {/* Right Panel: Centered card container */}
                <div className="flex items-center justify-center p-8 sm:p-12">
                    {children}
                </div>
            </div>
        </div>
    );
}
