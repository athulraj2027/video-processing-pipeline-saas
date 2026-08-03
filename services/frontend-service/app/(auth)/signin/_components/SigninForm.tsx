"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function SigninForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newErrors.email = "Email address is required";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert("Signed in successfully!");
        }, 1500);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Password Field */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-primary hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>
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

            {/* Remember Me */}
            <div className="flex items-center gap-2 py-1">
                <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked)}
                />
                <label
                    htmlFor="remember-me"
                    className="text-sm text-muted-foreground select-none cursor-pointer"
                >
                    Remember me
                </label>
            </div>

            <div className="flex flex-col gap-4 pt-2">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Signing In..." : "Sign In"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                    Don't have a store?{" "}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </form>
    );
}
