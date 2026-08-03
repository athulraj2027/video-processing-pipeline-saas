"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import SigninForm from "./SigninForm";

export default function Signin() {
    return (
        <Card variant="interactive" className="w-full max-w-md bg-card/70 backdrop-blur-sm border-border/80 dark:border-gray-800 shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                    Sign in to your store
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                    Welcome back! Please enter your details.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SigninForm />
            </CardContent>
        </Card>
    );
}
