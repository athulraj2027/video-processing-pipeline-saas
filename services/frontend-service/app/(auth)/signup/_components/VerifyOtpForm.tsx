"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { validateVerifyOtp } from "@/utils/validation";
import { ApiError } from "@/utils/api";
import { toast } from "@/components/ui/toast";
import { authService } from "@/services/auth";
import { ToastConstants } from "@/constants/toast.constants";

interface VerifyOtpFormProps {
    email?: string;
}

export default function VerifyOtpForm({ email: propEmail }: VerifyOtpFormProps = {}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryEmail = searchParams.get("email") || "";
    const email = propEmail || queryEmail;
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(59);
    const [errors, setErrors] = useState<string | null>(null);
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
                // Focus previous input and clear it
                newOtp[index - 1] = "";
                inputRefs.current[index - 1]?.focus();
            } else {
                newOtp[index] = "";
            }
            setOtp(newOtp);
            if (errors) setErrors(null);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text").trim();
        if (data.length === 6 && !isNaN(Number(data))) {
            const digits = data.split("");
            setOtp(digits);
            if (errors) setErrors(null);
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const otpError = validateVerifyOtp(otp);
        if (otpError) {
            setErrors(otpError);
            return;
        }

        setLoading(true);
        try {
            await authService.verifyEmail(email, otp.join(""));
            toast.success(ToastConstants.VERIFY_OTP_SUCCESS);
            setTimeout(() => {
                router.push("/dashboard");
                router.refresh()
            }, 1000);
        } catch (err) {
            if (err instanceof ApiError) {
                setErrors(err.message);
            } else {
                setErrors(ToastConstants.VERIFY_OTP_ERROR);
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
                await authService.resendVerifyOtp(email);
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
            {/* OTP Input Fields */}
            <div className="space-y-2">
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
                                "w-12 h-12 rounded-lg text-center font-semibold text-lg border bg-background/50 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                                errors ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : "border-border/85 dark:border-gray-800"
                            ].join(" ")}
                        />
                    ))}
                </div>
                {errors && (
                    <p className="text-xs text-destructive text-center font-medium mt-2">{errors}</p>
                )}
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

            <div className="flex flex-col gap-4">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Verifying..." : "Verify & Continue"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                    Back to{" "}
                    <Link href="/signin" className="font-semibold text-primary hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </form>
    );
}
