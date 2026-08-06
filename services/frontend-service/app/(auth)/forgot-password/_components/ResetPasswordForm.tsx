"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/utils/api";
import { toast } from "@/components/ui/toast";
import { authService } from "@/services/auth";
import { ToastConstants } from "@/constants/toast.constants";

interface ResetPasswordFormProps {
    email: string;
}

export default function ResetPasswordForm({ email }: ResetPasswordFormProps) {
    const router = useRouter();
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [timer, setTimer] = useState(59);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const inputRefs = useRef<HTMLInputElement[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;

        const val = element.value;
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);

        if (errors) setErrors(null);

        // Move focus to next input if filled
        if (val !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            const newOtp = [...otp];
            if (otp[index] === "" && index > 0) {
                newOtp[index - 1] = "";
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            } else {
                newOtp[index] = "";
                setOtp(newOtp);
            }
            if (errors) setErrors(null);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").trim();
        if (pasteData.length === 6 && !isNaN(Number(pasteData))) {
            const newOtp = pasteData.split("");
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate OTP
        if (otp.some(digit => digit === "")) {
            setErrors("Please enter the full 6-digit verification code.");
            return;
        }

        // Validate Password
        if (password.length < 8) {
            setPasswordError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(email, otp.join(""), password);
            toast.success("Password reset successfully! Please sign in with your new password.");
            setTimeout(() => {
                router.push("/signin");
            }, 1000);
        } catch (err) {
            if (err instanceof ApiError) {
                setErrors(err.message);
            } else {
                setErrors("Failed to reset password. Please verify the code and try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer === 0) {
            if (!email) {
                setErrors("Email address is missing. Please try requesting a reset again.");
                return;
            }
            setLoading(true);
            try {
                await authService.forgotPassword(email);
                setTimer(59);
                toast.success(ToastConstants.OTP_RESEND_SUCCESS);
            } catch (err) {
                if (err instanceof ApiError) {
                    setErrors(err.message);
                } else {
                    setErrors(ToastConstants.OTP_RESEND_ERROR);
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errors && (
                <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20 animate-in fade-in-50 slide-in-from-top-1">
                    {errors}
                </div>
            )}

            {/* OTP Input Fields */}
            <div className="space-y-2">
                <Label className="text-center block text-sm font-medium mb-1">Verification Code</Label>
                <div className="flex justify-between items-center gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                if (el) inputRefs.current[index] = el;
                            }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onPaste={handlePaste}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={[
                                "w-11 h-11 rounded-lg text-center font-semibold text-lg border bg-background/50 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                                errors ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : "border-border/85 dark:border-gray-800"
                            ].join(" ")}
                        />
                    ))}
                </div>
            </div>

            {/* Timer / Resend */}
            <div className="text-center text-xs">
                {timer > 0 ? (
                    <p className="text-muted-foreground">
                        Resend code in <span className="font-semibold text-foreground">{timer}s</span>
                    </p>
                ) : (
                    <button
                        type="button"
                        onClick={handleResend}
                        className="font-semibold text-primary hover:underline cursor-pointer"
                    >
                        Resend Code
                    </button>
                )}
            </div>

            {/* New Password Fields */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (passwordError) setPasswordError(null);
                        }}
                        className={passwordError ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""}
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (passwordError) setPasswordError(null);
                        }}
                        className={passwordError ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""}
                    />
                    {passwordError && (
                        <p className="text-xs text-destructive mt-1 font-medium">{passwordError}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Verifying..." : "Reset Password"}
                </Button>
            </div>
        </form>
    );
}
