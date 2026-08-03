"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import SignupForm from "./SignupForm";

export default function Signup() {
    return (
        <Card variant="interactive" className="w-full max-w-md bg-card/70 backdrop-blur-sm border-border/80 dark:border-gray-800 shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                    Create your video store
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                    Set up your custom subdomain and start selling videos
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SignupForm />
            </CardContent>
        </Card>
    );
}