"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { MethodBadge } from "./MethodBadge";
import { useRouter } from "next/navigation";

interface SearchResult {
    id: number;
    platformId: number;
    platformName: string;
    path: string;
    method: string;
    summary: string;
    category: string;
}

export function SearchModal({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const search = useCallback(async (q: string) => {
        if (q.length < 2) { setResults([]); return; }
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setSelected(0);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => search(query), 180);
        return () => clearTimeout(timer);
    }, [query, search]);

    const navigate = (item: SearchResult) => {
        router.push(`/docs/${item.id}`);
        onClose();
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
        if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
        if (e.key === "Enter" && results[selected]) navigate(results[selected]);
        if (e.key === "Escape") onClose();
    };

    return (
        <div className="search-overlay" onClick={onClose}>
            <div className="search-modal" onClick={(e) => e.stopPropagation()}>
                <div className="search-input-wrap">
                    <Search size={16} color="var(--text-muted)" />
                    <input
                        ref={inputRef}
                        className="search-input"
                        placeholder="Search endpoints, parameters..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKey}
                    />
                    {query && (
                        <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="search-results">
                    {results.length === 0 && query.length >= 2 && (
                        <div className="search-empty">No endpoints found for &ldquo;{query}&rdquo;</div>
                    )}
                    {results.length === 0 && query.length < 2 && (
                        <div className="search-empty">Type to search across all API endpoints...</div>
                    )}
                    {results.map((r, i) => (
                        <div
                            key={r.id}
                            className={`search-result-item ${i === selected ? "selected" : ""}`}
                            onClick={() => navigate(r)}
                        >
                            <MethodBadge method={r.method} />
                            <div className="search-result-info">
                                <div className="search-result-summary">{r.summary}</div>
                                <div className="search-result-meta">{r.platformName} · {r.path}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
