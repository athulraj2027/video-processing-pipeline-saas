"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { validateSignin, SigninErrors } from "@/utils/validation";
import { GoogleButton } from "@/components/ui/google-button";
import { ApiError } from "@/utils/api";
import { toast } from "@/components/ui/toast";
import { authService } from "@/services/auth";
import { ToastConstants } from "@/constants/toast.constants";
import { useRouter } from "next/navigation";
import { setAuthTokens } from "@/utils/auth";

export default function SigninForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<SigninErrors>({});
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = validateSignin(email, password);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        setLoading(true);
        try {
            const data = await authService.login(email, password);
            toast.success(ToastConstants.SIGNIN_SUCCESS);
            if (data.accessToken) {
                setAuthTokens(data.accessToken, data.refreshToken);
            }
            if (data) {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setErrors({
                    apiError: err.message,
                });
            } else {
                setErrors({
                    apiError: ToastConstants.SIGNIN_ERROR,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errors.apiError && (
                <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20 animate-in fade-in-50 slide-in-from-top-1">
                    {errors.apiError}
                </div>
            )}
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

                <div className="relative flex items-center justify-center my-1">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/80 dark:border-gray-800" />
                    </div>
                    <span className="relative bg-card px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Or
                    </span>
                </div>

                <GoogleButton type="button" />

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
