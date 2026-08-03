import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";

const LandingPage = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <Features />
            <Pricing />
        </>
    );
}

export default LandingPage;