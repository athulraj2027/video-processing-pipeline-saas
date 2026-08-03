"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import VerifyOtpForm from "./VerifyOtpForm";

export default function VerifyOtp() {
    return (
        <Card variant="interactive" className="w-full max-w-md bg-card/70 backdrop-blur-sm border-border/80 dark:border-gray-800 shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                    Verify your email
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                    We sent a 6-digit verification code to your email.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <VerifyOtpForm />
            </CardContent>
        </Card>
    );
}
