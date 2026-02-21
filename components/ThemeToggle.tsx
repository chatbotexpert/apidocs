"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
    const { dark, toggle } = useTheme();
    return (
        <button className="theme-toggle" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
            {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
    );
}
