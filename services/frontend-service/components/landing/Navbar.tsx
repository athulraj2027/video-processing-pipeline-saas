import Link from "next/link";
import ThemeToggle from "../ThemeToggle";
import { NavbarConstants } from "@/constants/constants";
import NavBtn from "./NavBtn";

const Navbar = () => {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-border dark:border-gray-900 bg-card/85 backdrop-blur-md transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href={`/`} className="text-xl font-bold tracking-tighter">
                        {NavbarConstants.SAAS_NAME}
                    </Link>
                    <div className="flex items-center gap-8">
                        <nav className="hidden md:flex items-center gap-6">
                            {NavbarConstants.OPTIONS.map((option) => (
                                <Link
                                    key={option.id}
                                    href={`/landing/#${option.name.toLowerCase().replace(/\s/g, "-")}`}
                                    className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                                >
                                    {option.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block">
                            <ThemeToggle />
                        </div>
                        <NavBtn />
                    </div>
                </div>
            </div>
        </header >
    );
};

export default Navbar;
