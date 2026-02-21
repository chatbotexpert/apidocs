"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Search, Sparkles } from "lucide-react";
import { MethodBadge } from "@/components/MethodBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchModal } from "@/components/SearchModal";

interface Endpoint {
    id: number;
    path: string;
    method: string;
    summary: string;
    category: string | null;
    platformId: number;
    platform: { name: string };
}

interface Platform {
    id: number;
    name: string;
    endpoints?: Endpoint[];
}

export function NavPane() {
    const pathname = usePathname();
    const activeId = pathname.startsWith("/docs/") && pathname !== "/docs/chat"
        ? parseInt(pathname.split("/").pop() || "")
        : undefined;

    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch("/api/platforms").then((r) => r.json()),
            fetch("/api/endpoints").then((r) => r.json()),
        ]).then(([p, e]) => {
            setPlatforms(p);
            setEndpoints(e);
        });
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setShowSearch(true);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const togglePlatform = (id: number) => {
        setCollapsed((c) => ({ ...c, [id]: !c[id] }));
    };

    return (
        <>
            {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
            <nav className="nav-pane">
                <div className="nav-header" style={{ position: "relative", paddingBottom: "1.25rem", borderBottom: "1px solid color-mix(in srgb, var(--border) 40%, transparent)", marginBottom: "1rem" }}>
                    <Link href="/docs" style={{ textDecoration: "none" }}>
                        <span className="logo" style={{
                            fontSize: "1.35rem",
                            fontWeight: 800,
                            letterSpacing: "-0.03em",
                            background: "linear-gradient(270deg, var(--text) 0%, var(--accent) 50%, var(--text) 100%)",
                            backgroundSize: "200% auto",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            animation: "gradient-shift 6s ease infinite",
                            display: "inline-block"
                        }}>
                            Who<span style={{
                                animation: "pulse-glow 3s infinite",
                                color: "var(--accent)",
                                WebkitTextFillColor: "var(--accent)"
                            }}>docs</span>
                        </span>
                    </Link>
                    <ThemeToggle />
                </div>
                <div style={{ padding: "0.5rem 0.75rem 0" }}>
                    <Link href="/docs/chat" style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.5rem 0.75rem", borderRadius: "6px",
                        background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                        color: "var(--accent)", textDecoration: "none",
                        fontWeight: 500, fontSize: "0.85rem", marginBottom: "0.5rem",
                        border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
                        transition: "all 0.2s ease"
                    }} className="search-trigger">
                        <Sparkles size={14} />
                        <span>Whodocs AI Assistant</span>
                    </Link>
                    <button className="search-trigger" onClick={() => setShowSearch(true)}>
                        <Search size={13} />
                        <span>Search endpoints...</span>
                        <span className="search-kbd">⌘K</span>
                    </button>
                </div>
                <div style={{ paddingTop: "0.5rem" }}>
                    {platforms.map((platform) => {
                        const platformEndpoints = endpoints.filter((e) => e.platformId === platform.id);
                        const categories = [...new Set(platformEndpoints.map((e) => e.category ?? "General"))];
                        const isCollapsed = collapsed[platform.id];

                        return (
                            <div key={platform.id} className="platform-group">
                                <div
                                    className="platform-header"
                                    onClick={() => togglePlatform(platform.id)}
                                >
                                    <span>{platform.name}</span>
                                    {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                                </div>
                                {!isCollapsed && (
                                    <div>
                                        {categories.map((cat) => {
                                            const catEndpoints = platformEndpoints.filter(
                                                (e) => (e.category ?? "General") === cat
                                            );
                                            const catKey = `${platform.id}-${cat}`;
                                            const isCatCollapsed = collapsed[catKey];

                                            // Toggle just the category string
                                            const toggleCategory = (e: React.MouseEvent) => {
                                                e.stopPropagation();
                                                setCollapsed((c) => ({ ...c, [catKey]: !c[catKey] }));
                                            };

                                            return (
                                                <div key={cat} className="category-group">
                                                    <div
                                                        className="category-label"
                                                        onClick={toggleCategory}
                                                        style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                                    >
                                                        <span>{cat}</span>
                                                        {isCatCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                                                    </div>
                                                    {!isCatCollapsed && catEndpoints.map((ep) => (
                                                        <Link
                                                            key={ep.id}
                                                            href={`/docs/${ep.id}`}
                                                            className={`nav-endpoint ${activeId === ep.id ? "active" : ""}`}
                                                        >
                                                            <MethodBadge method={ep.method} />
                                                            <span style={{
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                            }}>
                                                                {ep.summary}
                                                            </span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
