"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeCtx = createContext({ dark: false, toggle: () => { } });
export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        if (saved === "dark") {
            setDark(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggle = () => {
        setDark((d) => {
            const next = !d;
            document.documentElement.classList.toggle("dark", next);
            localStorage.setItem("theme", next ? "dark" : "light");
            return next;
        });
    };

    return <ThemeCtx.Provider value={{ dark, toggle }}>{children}</ThemeCtx.Provider>;
}
