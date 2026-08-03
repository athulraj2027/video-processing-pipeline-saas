import Navbar from "@/components/landing/Navbar";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
