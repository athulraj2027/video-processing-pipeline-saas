"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { validateSignup, SignupErrors } from "@/utils/validation";
import { GoogleButton } from "@/components/ui/google-button";
import { ApiError } from "@/utils/api";
import { toast } from "@/components/ui/toast";
import { authService } from "@/services/auth";
import { ToastConstants } from "@/constants/toast.constants";
import { useRouter } from "next/navigation";

interface SignupFormProps {
    onSignupSuccess: (email: string) => void;
}

export default function SignupForm({ onSignupSuccess }: SignupFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<SignupErrors>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = validateSignup(email, password, confirmPassword);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        setLoading(true);
        try {
            await authService.signup(email, password, 'tenant_admin');
            toast.success(ToastConstants.SIGNUP_SUCCESS);
            setTimeout(() => {
                onSignupSuccess(email);
            }, 500);
        } catch (err) {
            if (err instanceof ApiError) {
                setErrors({
                    apiError: err.message,
                });
            } else {
                setErrors({
                    apiError: ToastConstants.SIGNUP_ERROR,
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                        }}
                        className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""}`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.password}</p>
                )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                        }}
                        className={`pr-10 ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""}`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                        {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.confirmPassword}</p>
                )}
            </div>

            <div className="flex flex-col gap-4 pt-2">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating Account..." : "Sign Up"}
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
                    Already have an account?{" "}
                    <Link href="/signin" className="font-semibold text-primary hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </form>
    );
}
