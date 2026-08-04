"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPassword() {
    return (
        <Card variant="interactive" className="w-full max-w-[378px] bg-card/70 backdrop-blur-sm border-border/80 dark:border-gray-800 shadow-xl motion-safe:animate-[reveal-blur_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                    Forgot password?
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                    No worries, we'll send you reset instructions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ForgotPasswordForm />
            </CardContent>
        </Card>
    );
}
