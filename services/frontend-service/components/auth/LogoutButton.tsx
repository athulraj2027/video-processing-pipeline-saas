"use client";

import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

import { toast } from "../ui/toast";

export function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        try {
            // Clear client cookies
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
            document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";

            toast.success("Logged out successfully");
            router.push("/signin");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("An error occurred during logout.");
        }
    }

    return (
        <Button onClick={handleLogout}>
            Logout
        </Button>
    );
}