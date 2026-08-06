"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import ForgotPasswordForm from "./ForgotPasswordForm";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isSent, setIsSent] = useState(false);

    const handleEmailSubmitted = (submittedEmail: string) => {
        setEmail(submittedEmail);
        setIsSent(true);
    };

    return (
        <Card variant="interactive" className="w-full max-w-[378px] bg-card/70 backdrop-blur-sm border-border/80 dark:border-gray-800 shadow-xl motion-safe:animate-[reveal-blur_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                    {isSent ? "Reset Password" : "Forgot password?"}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                    {isSent 
                        ? `Enter the 6-digit code sent to ${email} and your new password.` 
                        : "No worries, we'll send you reset instructions."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isSent ? (
                    <ResetPasswordForm email={email} />
                ) : (
                    <ForgotPasswordForm onEmailSubmit={handleEmailSubmitted} />
                )}
            </CardContent>
        </Card>
    );
}
