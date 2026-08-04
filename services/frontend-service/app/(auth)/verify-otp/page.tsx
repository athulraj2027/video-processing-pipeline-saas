import AppSuspense from "@/components/ui/app-suspense";
import VerifyOtp from "./_components/VerifyOtp";

export default function VerifyOtpPage() {
    return (
        <AppSuspense>
            <VerifyOtp />
        </AppSuspense>
    );
}