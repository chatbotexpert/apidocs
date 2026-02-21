"use client";

import { useEffect, useState } from "react";
import { BookOpen, Save, Eye, EyeOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Guide {
    id: number;
    parameterId: number;
    markdown: string;
    parameter: {
        name: string;
        type: string;
        endpoint: {
            path: string;
            method: string;
            platform: { name: string };
        };
    };
}

interface Parameter {
    id: number;
    name: string;
    type: string;
    guide: { markdown: string } | null;
    endpoint: {
        path: string;
        method: string;
        platform: { name: string };
    };
}

export default function GuidesPage() {
    const [params, setParams] = useState<Parameter[]>([]);
    const [selected, setSelected] = useState<Parameter | null>(null);
    const [markdown, setMarkdown] = useState("");
    const [preview, setPreview] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Fetch all endpoints with their parameters and guides
        fetch("/api/endpoints")
            .then((r) => r.json())
            .then(async (endpoints) => {
                const all: Parameter[] = [];
                for (const ep of endpoints) {
                    const detail = await fetch(`/api/endpoints/${ep.id}`).then((r) => r.json());
                    for (const p of detail.parameters ?? []) {
                        all.push({ ...p, endpoint: { path: ep.path, method: ep.method, platform: { name: ep.platform?.name ?? "" } } });
                    }
                }
                setParams(all);
            });
    }, []);

    const select = (p: Parameter) => {
        setSelected(p);
        setMarkdown(p.guide?.markdown ?? "");
        setPreview(false);
        setSaved(false);
    };

    const save = async () => {
        if (!selected) return;
        setSaving(true);
        await fetch(`/api/parameters/${selected.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markdown }),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        // Update local state
        setParams((prev) => prev.map((p) => p.id === selected.id ? { ...p, guide: { markdown } } : p));
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem" }}>
            {/* Parameter list */}
            <div>
                <h1 className="admin-page-title">Parameter Guides</h1>
                <div style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
                    {params.length === 0 && (
                        <div style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.82rem", textAlign: "center" }}>
                            Loading parameters...
                        </div>
                    )}
                    {params.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => select(p)}
                            style={{
                                padding: "0.65rem 0.9rem",
                                borderBottom: "1px solid var(--border)",
                                cursor: "pointer",
                                background: selected?.id === p.id ? "color-mix(in srgb, var(--accent) 8%, var(--bg))" : "var(--bg)",
                                borderLeft: selected?.id === p.id ? "3px solid var(--accent)" : "3px solid transparent",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <code style={{ fontSize: "0.8rem" }}>{p.name}</code>
                                {p.guide && <BookOpen size={11} color="var(--accent)" />}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                                {p.endpoint.platform.name} · <span className={`badge badge-${p.endpoint.method}`}>{p.endpoint.method}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor */}
            {selected ? (
                <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <div>
                            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
                                Guide for <code>{selected.name}</code>
                            </h2>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {selected.endpoint.platform.name} · {selected.endpoint.method} {selected.endpoint.path}
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            {saved && <span style={{ color: "#22c55e", fontSize: "0.8rem" }}>✓ Saved</span>}
                            <button className="btn btn-secondary" onClick={() => setPreview(!preview)}>
                                {preview ? <EyeOff size={13} /> : <Eye size={13} />}
                                {preview ? "Edit" : "Preview"}
                            </button>
                            <button className="btn btn-primary" onClick={save} disabled={saving}>
                                <Save size={13} />
                                {saving ? "Saving..." : "Save Guide"}
                            </button>
                        </div>
                    </div>

                    {preview ? (
                        <div className="guide-content markdown">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
                        </div>
                    ) : (
                        <textarea
                            className="form-textarea"
                            style={{ minHeight: "60vh", fontFamily: "JetBrains Mono, monospace", fontSize: "0.82rem" }}
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                            placeholder={`## How to Find Your ${selected.name}\n\nWrite step-by-step instructions here using Markdown...\n\n### Step 1\n...\n\n### Step 2\n...\n\n\`\`\`\nExample value here\n\`\`\``}
                        />
                    )}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon"><BookOpen size={32} /></div>
                    <div className="empty-title">Select a parameter</div>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Choose a parameter from the list to write or edit its guide.</p>
                </div>
            )}
        </div>
    );
}
