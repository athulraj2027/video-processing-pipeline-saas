import { HERO_CONTENT } from "@/constants/constants";

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
                    <button className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/30 motion-safe:active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer motion-safe:animate-[fade-up_1.1s_cubic-bezier(0.16,1,0.3,1)_both_500ms] will-change-[transform,opacity]"
                    >
                        <span
                            aria-hidden="true"
                            className="absolute inset-0 -translate-x-[150%] skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out motion-safe:group-hover:translate-x-[150%]"
                        />

                        <span className="relative">{HERO_CONTENT.btn}</span>

                    </button>
                </div>
            </div>
        </section>
    );
}