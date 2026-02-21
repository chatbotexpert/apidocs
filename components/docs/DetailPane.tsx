"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MethodBadge } from "@/components/MethodBadge";
import { ChevronDown, ChevronRight, BookOpen, Sparkles } from "lucide-react";

interface ParameterGuide {
    markdown: string;
}

interface Parameter {
    id: number;
    name: string;
    type: string;
    location: string;
    isRequired: boolean;
    description: string | null;
    guide: ParameterGuide | null;
}

interface Endpoint {
    id: number;
    path: string;
    method: string;
    summary: string;
    description: string | null;
    category: string | null;
    guide: { markdown: string } | null;
    platform: { name: string; baseUrl: string; authType: string };
    parameters: Parameter[];
}

function GuideSection({ guide }: { guide: ParameterGuide }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ marginBottom: open ? "1rem" : "0" }}>
            <button
                className="guide-toggle"
                onClick={() => setOpen(!open)}
                style={{
                    borderRadius: open ? "6px 6px 0 0" : "6px",
                    border: "1px solid var(--border)",
                    borderBottom: open ? "none" : "1px solid var(--border)",
                    background: "var(--bg-secondary)",
                    padding: "0.6rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginTop: "0.5rem"
                }}
            >
                <Sparkles size={14} style={{ color: "var(--accent)" }} />
                <span style={{ fontWeight: 600, color: "var(--text)" }}>AI Explanation Guide</span>
                <span style={{ flex: 1 }}></span>
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {open && (
                <div className="guide-content" style={{
                    borderTop: "none",
                    borderRadius: "0 0 6px 6px",
                    margin: 0,
                    background: "var(--bg)",
                    borderLeft: "1px solid var(--border)",
                    borderRight: "1px solid var(--border)",
                    borderBottom: "1px solid var(--border)"
                }}>
                    <div className="markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {guide.markdown}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}

export function DetailPane({ endpoint }: { endpoint: Endpoint }) {
    const [activeTab, setActiveTab] = useState<"overview" | "ai">("overview");
    const [completion, setCompletion] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const generateExplanation = async () => {
        try {
            setIsLoading(true);
            setCompletion("");

            const response = await fetch(`/api/endpoints/${endpoint.id}/generate-guide`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: "" })
            });

            if (!response.ok) throw new Error("Failed to generate guide");
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    const chunkValue = decoder.decode(value, { stream: true });
                    setCompletion((prev) => prev + chunkValue);
                }
            }
        } catch (error) {
            console.error("Stream parsing error:", error);
            setCompletion("An error occurred while generating the guide.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="detail-pane">
            {/* Header */}
            <div style={{
                marginBottom: "2rem",
                padding: "2rem",
                background: "linear-gradient(135deg, color-mix(in srgb, var(--code-bg) 60%, transparent), transparent)",
                border: "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
                borderRadius: "16px",
                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)"
            }}>
                <div className="endpoint-header">
                    <MethodBadge method={endpoint.method} />
                    <code className="endpoint-path">{endpoint.path}</code>
                    <span className="platform-tag">{endpoint.platform.name}</span>
                </div>
                <h1 className="endpoint-summary">{endpoint.summary}</h1>
                {endpoint.description && (
                    <p className="endpoint-description">{endpoint.description}</p>
                )}
                <div style={{
                    display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    paddingTop: "1.5rem", marginTop: "1rem",
                    borderTop: "1px solid color-mix(in srgb, var(--border) 30%, transparent)"
                }}>
                    <span>Base URL: <code style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)" }}>{endpoint.platform.baseUrl}</code></span>
                    <span>Auth: <code style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)" }}>{endpoint.platform.authType}</code></span>
                    {endpoint.category && <span>Category: <code style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)" }}>{endpoint.category}</code></span>}
                </div>
            </div>

            {/* Tabs for Overview vs AI Content */}
            <div style={{
                display: "flex", gap: "0.5rem", marginBottom: "2rem",
                borderBottom: "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
                paddingBottom: "1rem"
            }}>
                <button
                    onClick={() => setActiveTab("overview")}
                    style={{
                        padding: "0.6rem 1.25rem",
                        background: activeTab === "overview" ? "color-mix(in srgb, var(--text) 5%, transparent)" : "transparent",
                        color: activeTab === "overview" ? "var(--text)" : "var(--text-muted)",
                        border: activeTab === "overview" ? "1px solid color-mix(in srgb, var(--border) 60%, transparent)" : "1px solid transparent",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        boxShadow: activeTab === "overview" ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.2s ease"
                    }}
                >
                    <BookOpen size={14} />
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab("ai")}
                    style={{
                        padding: "0.6rem 1.25rem",
                        background: activeTab === "ai" ? "color-mix(in srgb, var(--text) 5%, transparent)" : "transparent",
                        color: activeTab === "ai" ? "var(--accent)" : "var(--text-muted)",
                        border: activeTab === "ai" ? "1px solid color-mix(in srgb, var(--border) 60%, transparent)" : "1px solid transparent",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        boxShadow: activeTab === "ai" ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.2s ease"
                    }}
                >
                    <Sparkles size={14} />
                    AI Explanation
                </button>
            </div>

            {/* Main Content Area */}
            {activeTab === "overview" ? (
                /* Parameters section */
                <>
                    {endpoint.parameters.length > 0 && (
                        <div style={{ marginBottom: "2rem" }}>
                            <div className="section-title">Parameters</div>
                            <table className="params-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>In</th>
                                        <th>Required</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {endpoint.parameters.map((param) => (
                                        <React.Fragment key={param.id}>
                                            <tr>
                                                <td><code>{param.name}</code></td>
                                                <td><span style={{ color: "var(--text-muted)" }}>{param.type}</span></td>
                                                <td><span style={{ color: "var(--text-muted)" }}>{param.location}</span></td>
                                                <td>
                                                    {param.isRequired ? (
                                                        <><span className="required-dot" />required</>
                                                    ) : (
                                                        <span style={{ color: "var(--text-subtle)" }}>optional</span>
                                                    )}
                                                </td>
                                                <td style={{ color: "var(--text-muted)" }}>{param.description ?? "—"}</td>
                                            </tr>
                                            {param.guide && (
                                                <tr>
                                                    <td colSpan={5} style={{ padding: 0, borderBottom: "none" }}>
                                                        <GuideSection guide={param.guide} />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {endpoint.parameters.length === 0 && (
                        <div style={{ color: "var(--text-subtle)", fontSize: "0.82rem", marginBottom: "1rem" }}>
                            No parameters for this endpoint.
                        </div>
                    )}
                </>
            ) : (
                /* Endpoint AI Explanation Area */
                <div className="markdown glass-panel" style={{
                    padding: "2rem",
                    borderRadius: "12px",
                    border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                }}>
                    {endpoint.guide ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {endpoint.guide.markdown}
                        </ReactMarkdown>
                    ) : (
                        completion ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {completion}
                            </ReactMarkdown>
                        ) : isLoading ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent)", marginBottom: "1rem" }}>
                                    <Sparkles size={16} className="spin-slow" />
                                    <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Cerebras AI is generating your guide...</span>
                                </div>
                                <div className="skeleton-line" style={{ width: "100%", height: "24px", borderRadius: "12px", background: "var(--bg-tertiary)", animation: "pulse 1.5s infinite" }} />
                                <div className="skeleton-line" style={{ width: "90%", height: "16px", borderRadius: "8px", background: "var(--bg-tertiary)", animation: "pulse 1.5s infinite", animationDelay: "0.2s" }} />
                                <div className="skeleton-line" style={{ width: "95%", height: "16px", borderRadius: "8px", background: "var(--bg-tertiary)", animation: "pulse 1.5s infinite", animationDelay: "0.4s" }} />
                                <div className="skeleton-line" style={{ width: "80%", height: "16px", borderRadius: "8px", background: "var(--bg-tertiary)", animation: "pulse 1.5s infinite", animationDelay: "0.6s" }} />
                            </div>
                        ) : (
                            <div style={{ textAlign: "center", padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{
                                    width: "80px", height: "80px", borderRadius: "24px",
                                    background: "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 20%, transparent), transparent)",
                                    border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    marginBottom: "1.5rem", boxShadow: "0 10px 30px color-mix(in srgb, var(--accent) 10%, transparent)"
                                }}>
                                    <Sparkles size={36} style={{ color: "var(--accent)" }} />
                                </div>
                                <h3 style={{ marginBottom: "0.75rem", color: "var(--text)", fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.01em" }}>Supercharge your docs</h3>
                                <p style={{ color: "var(--text-muted)", marginBottom: "2rem", maxWidth: "400px", lineHeight: 1.6, fontSize: "0.95rem" }}>
                                    Instantly generate a comprehensive, production-ready Markdown guide with code examples and best practices.
                                </p>
                                <button
                                    onClick={generateExplanation}
                                    style={{
                                        background: "var(--text)", color: "var(--bg)", border: "none",
                                        padding: "0.75rem 1.75rem", borderRadius: "100px", fontSize: "0.9rem",
                                        fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem",
                                        cursor: "pointer", boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                                        transition: "transform 0.2s ease, box-shadow 0.2s ease"
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                                    onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                                >
                                    <Sparkles size={16} />
                                    Generate AI Explanation
                                </button>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
