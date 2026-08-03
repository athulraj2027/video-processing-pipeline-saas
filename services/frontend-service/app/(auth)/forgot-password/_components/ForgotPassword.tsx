"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPassword() {
    return (
        <Card variant="interactive" className="w-full max-w-md bg-card/70 backdrop-blur-sm border-border/80 dark:border-gray-800 shadow-xl">
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
