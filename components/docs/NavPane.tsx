"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
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

interface NavPaneProps {
    activeId?: number;
}

export function NavPane({ activeId }: NavPaneProps) {
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
                <div className="nav-header">
                    <span className="logo">Hash<span>Turn</span> API</span>
                    <ThemeToggle />
                </div>
                <div style={{ padding: "0.5rem 0.75rem 0" }}>
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
                                            return (
                                                <div key={cat} className="category-group">
                                                    <div className="category-label">{cat}</div>
                                                    {catEndpoints.map((ep) => (
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
