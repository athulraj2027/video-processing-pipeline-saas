import { Button } from "@/components/ui/button";
import { HERO_CONTENT } from "@/constants/constants";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="flex justify-start h-[100vh] md:h-[90vh] items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl flex flex-col items-start gap-5">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.1] motion-safe:animate-[reveal-blur_1.4s_cubic-bezier(0.16,1,0.3,1)_both] will-change-[transform,opacity,filter]">
                        {HERO_CONTENT.title}
                    </h1>
                    <p className="text-sm sm:text-lg w-2/3 font-medium text-gray-600 dark:text-gray-400 motion-safe:animate-[fade-up_1.1s_cubic-bezier(0.16,1,0.3,1)_both_500ms] will-change-[transform,opacity]">
                        {HERO_CONTENT.subheading}
                    </p>
                    <Link href={`/signup`}>
                        <Button
                            shimmer
                            color="primary"
                            className="motion-safe:animate-[fade-up_1.1s_cubic-bezier(0.16,1,0.3,1)_both_500ms] will-change-[transform,opacity]"
                        >
                            {HERO_CONTENT.btn}
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}