"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PRICING_CONTENT } from "@/constants/constants";

type BillingPeriod = "monthly" | "yearly";

export default function Pricing() {
    const [billing, setBilling] = useState<BillingPeriod>("monthly");
    const [selectedId, setSelectedId] = useState<string>(
        PRICING_CONTENT.plans.find((p) => p.popular)?.id ?? PRICING_CONTENT.plans[0].id
    );
    const [autoRenew, setAutoRenew] = useState(true);

    const selectedPlan =
        PRICING_CONTENT.plans.find((p) => p.id === selectedId) ?? PRICING_CONTENT.plans[0];

    // Parses "$49" -> 49. Non-numeric prices (e.g. "Custom") pass through untouched.
    const numericPrice = Number(String(selectedPlan.price).replace(/[^0-9.]/g, ""));
    const hasNumericPrice = !Number.isNaN(numericPrice) && numericPrice > 0;

    const displayPrice = (plan: (typeof PRICING_CONTENT.plans)[number]) => {
        const raw = Number(String(plan.price).replace(/[^0-9.]/g, ""));
        if (Number.isNaN(raw) || raw <= 0) return plan.price;
        const value = billing === "yearly" ? Math.round(raw * 0.8) : raw;
        return `$${value}`;
    };

    const renewalPrice = hasNumericPrice ? Math.round(numericPrice * 12 * 0.8) : null;

    return (
        <section id="pricing" className="bg-background px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl rounded-3xl border border-border dark:border-gray-900 bg-card/40 dark:bg-zinc-950/20 backdrop-blur-md p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex items-center rounded-full bg-muted/80 dark:bg-muted/30 border border-border/50 px-4 py-1.5 text-xs font-semibold text-muted-foreground">
                        Pricing
                    </span>
                    <h2 className="mt-6 text-2xl font-bold tracking-tighter leading-[1.1] text-foreground sm:text-3xl lg:text-4xl">
                        {PRICING_CONTENT.title}
                    </h2>
                    <p className="mt-4 text-sm sm:text-base leading-relaxed font-medium text-muted-foreground">
                        {PRICING_CONTENT.desc}
                    </p>
                </div>

                {/* Billing toggle */}
                <div className="mt-6 flex justify-center">
                    <div className="inline-flex rounded-full bg-muted border border-border/60 dark:border-gray-800/80 p-1">
                        {(["yearly", "monthly"] as BillingPeriod[]).map((period) => (
                            <button
                                key={period}
                                type="button"
                                onClick={() => setBilling(period)}
                                className={`rounded-full px-5 py-1.5 text-xs font-semibold capitalize transition-all ${billing === period
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Plans + includes */}
                <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px] lg:gap-6">
                    {/* Plan list */}
                    <div className="flex flex-col gap-3">
                        {PRICING_CONTENT.plans.map((plan) => {
                            const isSelected = plan.id === selectedId;
                            return (
                                <button
                                    key={plan.id}
                                    type="button"
                                    onClick={() => setSelectedId(plan.id)}
                                    className={`relative flex items-center justify-between overflow-hidden rounded-xl border p-4 sm:p-5 text-left transition-all ${isSelected
                                        ? "border-transparent bg-primary text-primary-foreground shadow-md shadow-primary/5 dark:shadow-primary/10"
                                        : "border-border/60 dark:border-gray-800/80 bg-card/60 text-foreground hover:border-muted-foreground/30 hover:bg-card/90"
                                        }`}
                                >
                                    {isSelected && (
                                        <div
                                            aria-hidden
                                            className="pointer-events-none absolute inset-0 opacity-[0.06]"
                                            style={{
                                                backgroundImage:
                                                    "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                                                backgroundSize: "18px 18px",
                                            }}
                                        />
                                    )}

                                    <div className="relative flex items-center gap-4">
                                        <span
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${isSelected
                                                ? "border-primary-foreground bg-primary-foreground"
                                                : "border-border bg-muted dark:bg-zinc-900"
                                                }`}
                                        >
                                            {isSelected && <Check className="h-3.5 w-3.5 text-primary" strokeWidth={4} />}
                                        </span>

                                        <span>
                                            <span className="block text-base font-semibold">{plan.name}</span>
                                            <span
                                                className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${isSelected
                                                    ? "bg-primary-foreground/20 text-primary-foreground"
                                                    : "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground/90"
                                                    }`}
                                            >
                                                Save 20%
                                            </span>
                                        </span>
                                    </div>

                                    <span className="relative text-xl font-bold sm:text-2xl">
                                        {displayPrice(plan)}
                                        {String(plan.price).startsWith("$") && (
                                            <span className="text-xs font-semibold opacity-80 ml-0.5">
                                                {plan.period ?? "/month"}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Includes panel */}
                    <div className="rounded-xl border border-border/80 dark:border-gray-800 bg-card/20 p-5">
                        <h3 className="text-sm font-semibold text-foreground">Includes:</h3>
                        <ul className="mt-3 flex flex-col divide-y divide-border/40 dark:divide-gray-800/40">
                            {selectedPlan.features.map((feature) => (
                                <li
                                    key={feature}
                                    className="flex items-center justify-between gap-4 py-2 text-xs sm:text-sm text-muted-foreground"
                                >
                                    <span>{feature}</span>
                                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={3} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="mt-6 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
                    <button
                        type="button"
                        className="w-full sm:w-auto rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer"
                    >
                        {selectedPlan.btn ?? "Choose Plan"}
                    </button>

                    {renewalPrice !== null && (
                        <button
                            type="button"
                            onClick={() => setAutoRenew((v) => !v)}
                            className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            <span
                                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${autoRenew ? "bg-primary" : "bg-muted border border-border/80 dark:border-gray-800"
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white dark:bg-gray-200 shadow transition-transform ${autoRenew ? "translate-x-4.5" : "translate-x-0.5"
                                        }`}
                                />
                            </span>
                            Renewed at a price of ${renewalPrice}/year
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}