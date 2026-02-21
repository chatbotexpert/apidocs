"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MethodBadge } from "@/components/MethodBadge";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";

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
    platform: { name: string; baseUrl: string; authType: string };
    parameters: Parameter[];
}

function GuideSection({ guide }: { guide: ParameterGuide }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button className="guide-toggle" onClick={() => setOpen(!open)}>
                <BookOpen size={12} />
                <span>How to find this value</span>
                {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
            {open && (
                <div className="guide-content">
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
    return (
        <div className="detail-pane">
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <div className="endpoint-header">
                    <MethodBadge method={endpoint.method} />
                    <code className="endpoint-path">{endpoint.path}</code>
                    <span className="platform-tag">{endpoint.platform.name}</span>
                </div>
                <h1 className="endpoint-summary">{endpoint.summary}</h1>
                {endpoint.description && (
                    <p className="endpoint-description">{endpoint.description}</p>
                )}
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    <span>Base URL: <code>{endpoint.platform.baseUrl}</code></span>
                    <span>Auth: <code>{endpoint.platform.authType}</code></span>
                    {endpoint.category && <span>Category: <code>{endpoint.category}</code></span>}
                </div>
            </div>

            {/* Parameters section */}
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
        </div>
    );
}
