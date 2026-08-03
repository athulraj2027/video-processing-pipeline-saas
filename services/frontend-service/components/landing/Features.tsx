"use client";

import { useEffect, useRef, useState } from "react";
import { FEATURES_CONTENT } from "@/constants/constants";

const getDotLeft = (index: number) => {
    // Stable pseudo-random offsets: e.g. 45%, 53%, 47%, 55%, 50%
    const offsets = [-5, 3, -3, 5, 0, -4, 4];
    const offset = offsets[index % offsets.length];
    return 50 + offset;
};

export default function Features() {
    const trackRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
    const [fillPercent, setFillPercent] = useState(0);
    const [visibleIds, setVisibleIds] = useState<Set<string | number>>(new Set());

    // SVG tracking state
    const containerRef = useRef<HTMLDivElement>(null);
    const dotRefs = useRef<Array<HTMLDivElement | null>>([]);
    const pathRef = useRef<SVGPathElement>(null);
    const [dotCoords, setDotCoords] = useState<{ x: number; y: number }[]>([]);
    const [pathLength, setPathLength] = useState(0);

    // Scroll-driven line fill — the center line fills top-down as the
    // section moves through the viewport, so the timeline feels like
    // it's being drawn in as you read through it.
    useEffect(() => {
        let raf = 0;

        const updateFill = () => {
            const track = trackRef.current;
            if (track) {
                const rect = track.getBoundingClientRect();
                const viewportCenter = window.innerHeight * 0.5;
                const total = rect.height + viewportCenter;
                const traveled = viewportCenter - rect.top;
                const pct = Math.min(100, Math.max(0, (traveled / total) * 100));
                setFillPercent(pct);
            }
            raf = requestAnimationFrame(updateFill);
        };

        raf = requestAnimationFrame(updateFill);
        return () => cancelAnimationFrame(raf);
    }, []);

    // Reveal each card + light up its dot once it enters the viewport.
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute("data-id");
                        if (id) {
                            setVisibleIds((prev) => new Set(prev).add(id));
                        }
                    }
                });
            },
            { threshold: 0.35, rootMargin: "0px 0px -10% 0px" }
        );

        itemRefs.current.forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    // Measure positions of dots for SVG path
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateCoords = () => {
            const containerRect = container.getBoundingClientRect();
            const coords = dotRefs.current
                .map((dot) => {
                    if (!dot) return null;
                    const rect = dot.getBoundingClientRect();
                    return {
                        x: rect.left + rect.width / 2 - containerRect.left,
                        y: rect.top + rect.height / 2 - containerRect.top,
                    };
                })
                .filter((coord): coord is { x: number; y: number } => coord !== null);

            setDotCoords(coords);
        };

        const observer = new ResizeObserver(() => {
            updateCoords();
        });
        observer.observe(container);

        updateCoords();
        const timer = setTimeout(updateCoords, 100);

        window.addEventListener("resize", updateCoords);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", updateCoords);
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (pathRef.current) {
            try {
                setPathLength(pathRef.current.getTotalLength());
            } catch (e) {
                // Fail-safe if getTotalLength fails before mount
            }
        }
    }, [dotCoords]);

    const generatePathD = (coords: { x: number; y: number }[]) => {
        if (coords.length === 0) return "";
        return coords.reduce((acc, coord, idx) => {
            return idx === 0 ? `M ${coord.x} ${coord.y}` : `${acc} L ${coord.x} ${coord.y}`;
        }, "");
    };

    return (
        <section id="features" className="relative bg-background px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
                <h1 className="mt-6 text-3xl font-bold tracking-tighter leading-[1.1] text-foreground sm:text-4xl lg:text-5xl">
                    {FEATURES_CONTENT.title}
                </h1>
                <p className="mt-5 text-base leading-relaxed font-medium text-gray-600 dark:text-gray-400 sm:text-lg">
                    {FEATURES_CONTENT.desc}
                </p>
            </div>

            <div ref={containerRef} className="relative mx-auto mt-24 max-w-5xl">
                {/* trackRef tracks the overall timeline block height for scroll percent calculation */}
                <div ref={trackRef} className="absolute inset-0 pointer-events-none" />

                {/* Mobile timeline lines (straight on the left) */}
                <div className="absolute left-5 top-0 h-full w-px -translate-x-1/2 bg-gray-200 dark:bg-gray-800 sm:hidden" />
                <div
                    className="absolute left-5 top-0 w-px -translate-x-1/2 bg-primary transition-[height] duration-150 ease-out sm:hidden"
                    style={{ height: `${fillPercent}%` }}
                />

                {/* Desktop timeline lines (SVG zig-zag) */}
                <svg className="absolute inset-0 h-full w-full hidden sm:block pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    {/* Base path */}
                    <path
                        d={generatePathD(dotCoords)}
                        fill="none"
                        stroke="currentColor"
                        className="text-gray-200 dark:text-gray-800"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Filled path */}
                    <path
                        ref={pathRef}
                        d={generatePathD(dotCoords)}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2"
                        strokeDasharray={pathLength}
                        strokeDashoffset={pathLength * (1 - fillPercent / 100)}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-[stroke-dashoffset] duration-150 ease-out"
                    />
                </svg>

                <div className="flex flex-col gap-2 sm:gap-6">
                    {FEATURES_CONTENT.features.map((feature, index) => {
                        const isRight = index % 2 === 1;
                        const isVisible = visibleIds.has(String(feature.id));
                        const order = String(index + 1).padStart(2, "0");

                        return (
                            <div
                                key={feature.id}
                                ref={(el) => {
                                    itemRefs.current[index] = el;
                                }}
                                data-id={feature.id}
                                className={`relative flex items-center py-8 ${isRight ? "justify-start sm:justify-end" : "justify-start"
                                    }`}
                            >
                                {/* Dot */}
                                <div
                                    ref={(el) => {
                                        dotRefs.current[index] = el;
                                    }}
                                    style={{ "--dot-left": `${getDotLeft(index)}%` } as React.CSSProperties}
                                    className="absolute left-5 sm:left-[var(--dot-left)] top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                                >
                                    <span
                                        className={`block h-3 w-3 rounded-full border-2 bg-card transition-all duration-500 ${isVisible
                                            ? "scale-100 border-primary shadow-[0_0_0_5px_color-mix(in_srgb,var(--primary)_15%,transparent)]"
                                            : "scale-75 border-gray-300 dark:border-gray-700"
                                            }`}
                                    />
                                </div>

                                {/* Card */}
                                <div
                                    className={`w-[calc(100%-2.5rem)] pl-10 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 sm:w-[42%] sm:pl-0 ${isRight ? "sm:ml-auto" : "sm:mr-auto"
                                        } ${isVisible
                                            ? "translate-x-0 opacity-100"
                                            : `opacity-0 ${isRight
                                                ? "sm:translate-x-6 -translate-x-0"
                                                : "sm:-translate-x-6 translate-x-0"
                                            } translate-y-3`
                                        }`}
                                >
                                    <div
                                        className={`group rounded-xl border border-gray-200 dark:border-gray-800 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 dark:hover:shadow-primary/10 motion-reduce:hover:translate-y-0 ${isRight ? "sm:text-right" : "sm:text-left"
                                            }`}
                                    >
                                        <div
                                            className={`flex items-center gap-3 ${isRight ? "sm:flex-row-reverse" : ""
                                                }`}
                                        >
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {order}
                                            </span>
                                            {(feature as any).tag && (
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                                    {(feature as any).tag}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="mt-3 text-lg font-semibold text-foreground">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
