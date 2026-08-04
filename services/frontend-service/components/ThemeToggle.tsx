"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    if (!mounted) {
        return (
            <div className="w-9 h-9 rounded-lg border border-border/80 dark:border-gray-800 bg-card/50" />
        );
    }

    return (
        <button
            onClick={toggleTheme}
            type="button"
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border/80 dark:border-gray-800 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Toggle theme"
        >
            {theme === "light" ? (
                <Moon className="w-[18px] h-[18px] transition-transform duration-300" />
            ) : (
                <Sun className="w-[18px] h-[18px] transition-transform duration-300 text-yellow-500" />
            )}
        </button>
    );
}
