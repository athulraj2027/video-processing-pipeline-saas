"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { validateForgotPassword, ForgotPasswordErrors } from "@/utils/validation";

export default function ForgotPasswordForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<ForgotPasswordErrors>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = validateForgotPassword(email);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert("OTP verification code sent to your email!");
            router.push("/verify-otp");
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

            <div className="flex flex-col gap-4 pt-2">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Sending..." : "Reset Password"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                    Remember your password?{" "}
                    <Link href="/signin" className="font-semibold text-primary hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </form>
    );
}
