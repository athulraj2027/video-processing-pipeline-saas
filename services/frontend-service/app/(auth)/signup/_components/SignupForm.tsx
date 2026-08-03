"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { validateSignup, SignupErrors } from "@/utils/validation";

export default function SignupForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subdomain, setSubdomain] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<SignupErrors>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = validateSignup(name, email, subdomain, password);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert("Signup successful! Welcome to flow studio.");
        }, 1500);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    className={errors.name ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""}
                />
                {errors.name && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.name}</p>
                )}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                    id="email"
                    type="text"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    className={errors.email ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""}
                />
                {errors.email && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.email}</p>
                )}
            </div>

            {/* Subdomain Field */}
            <div className="space-y-1">
                <Label htmlFor="subdomain">Store Subdomain</Label>
                <div className="flex items-center">
                    <Input
                        id="subdomain"
                        type="text"
                        placeholder="my-video-shop"
                        value={subdomain}
                        onChange={(e) => {
                            setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                            if (errors.subdomain) setErrors((prev) => ({ ...prev, subdomain: "" }));
                        }}
                        className={`rounded-r-none ${errors.subdomain ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""}`}
                    />
                    <span className="inline-flex items-center rounded-r-lg border border-l-0 border-border/80 dark:border-gray-800 bg-muted/65 dark:bg-zinc-900/60 px-3 py-2 h-9 text-sm text-muted-foreground font-medium select-none">
                        .flowstudio.com
                    </span>
                </div>
                {errors.subdomain && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.subdomain}</p>
                )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    className={errors.password ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""}
                />
                {errors.password && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.password}</p>
                )}
            </div>

            <div className="flex flex-col gap-4 pt-2">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating Store..." : "Launch Your Store"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                    Already have a store?{" "}
                    <Link href="/signin" className="font-semibold text-primary hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </form>
    );
}
