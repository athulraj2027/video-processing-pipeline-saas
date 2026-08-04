export interface PageContent {
    badge: string;
    title: string;
    description: string;
}

export const NavbarConstants = {
    SAAS_NAME: 'flow studio',
    SAAS_LOGO: '',
    OPTIONS: [
        { id: 1, name: 'Product', href: '#' },
        { id: 2, name: 'Features', href: '#' },
        { id: 3, name: 'Pricing', href: '#' },
        // { id: 4, name: 'Customers', href: '#' },
        // { id: 5, name: 'Docs', href: '#' },
    ]
}

export const HERO_CONTENT = {
    title: 'The Shopify for Videos: Launch Your Video Storefront',
    subheading: 'Claim your custom subdomain, upload your video catalog, and sell, rent, or stream content instantly with our AI-powered processing pipeline.',
    btn: 'Create Your Store'
}

export const FEATURES_CONTENT = {
    title: 'Everything you need to sell & stream videos',
    desc: "Launch your custom video storefront in seconds. Get a custom subdomain, import your media, set flexible pricing models (sell, rent, subscribe), and let AI handle transcription and thumbnail generation automatically.",
    features: [
        {
            id: 1,
            title: 'Your Own Subdomain & Branding',
            desc: 'Claim your free subdomain (e.g., yourstore.flowstudio.com) or map your own custom domain. Personalize your storefront to match your unique brand identity.',
            icon: '',
        },
        {
            id: 2,
            title: 'Sell, Rent, or Offer Subscriptions',
            desc: 'Monetize your video content with flexible pricing models. Sell lifetime access, set up time-limited rentals, or run recurring subscription (SVOD) plans.',
            icon: '',
        },
        {
            id: 3,
            title: 'AI-Powered Transcription & Subtitles',
            desc: 'Reach a global audience instantly. AI-powered transcription and translation with timestamp-accurate captions in 30+ languages.',
            icon: '',
        },
        {
            id: 4,
            title: 'Auto-Generate Thumbnails & Trailers',
            desc: 'Create eye-catching visuals that convert. AI automatically generates multiple thumbnail options and short preview clips optimized for attention.',
            icon: '',
        },
        {
            id: 5,
            title: 'Store Owner Dashboard',
            desc: "Track sales, manage customer accounts, view detailed stream analytics, and monitor video upload pipelines all from a single powerful dashboard.",
            icon: ''
        }
    ]

}
export const PRICING_CONTENT = {
    title: "Simple pricing for video stores of every size",
    desc: "Choose a plan that fits your catalog, usage, and growth stage. Scale from a branded storefront to enterprise-grade video operations.",
    plans: [
        {
            id: "starter",
            name: "Starter",
            price: "$49",
            period: "/month",
            popular: false,
            btn: "Start Free Trial",
            features: [
                "Free subdomain access",
                "Sell & Rent monetization",
                "Up to 10 video products",
                "50 GB secure video hosting",
                "Basic analytics dashboard",
                "Email support",
            ],
        },
        {
            id: "growth",
            name: "Growth",
            price: "$149",
            period: "/month",
            popular: true,
            btn: "Start Free Trial",
            features: [
                "Custom domain mapping",
                "Subscription plans (SVOD)",
                "Up to 50 video products",
                "250 GB storage & hosting",
                "AI subtitles and trailers",
                "Priority support",
            ],
        },
        {
            id: "enterprise",
            name: "Enterprise",
            price: "Custom",
            period: "",
            popular: false,
            btn: "Contact Sales",
            features: [
                "Unlimited video products",
                "Custom storage & bandwidth scale",
                "Advanced streaming DRM",
                "API & webhook access",
                "SSO & custom storefront theme",
                "Dedicated manager support",
            ],
        },
    ],
} as const;

export const PAGE_CONTENTS: Record<string, PageContent> = {
    "/signup": {
        badge: "Get Started",
        title: "Launch Your Video Store",
        description: "Create your account to claim your subdomain, set your pricing, and launch your video storefront in minutes.",
    },
    "/signin": {
        badge: "Welcome Back",
        title: "Manage Your Channel",
        description: "Access your dashboard to upload new content, view sales analytics, manage subscriptions, and track payouts.",
    },
    "/forgot-password": {
        badge: "Security First",
        title: "Recover Your Account",
        description: "Confirm your registered email address to receive a secure one-time passcode and reset your administrator password.",
    },
    "/verify-otp": {
        badge: "Verification",
        title: "Protect Your Account",
        description: "Enter the six-digit verification code sent to your inbox to confirm your identity and secure your store dashboard.",
    },
};