"use client";

import { useEffect, useState } from "react";
import { Upload, Check, AlertCircle } from "lucide-react";

interface Platform { id: number; name: string; }

const SAMPLE_SPEC = JSON.stringify({
    openapi: "3.0.0",
    info: { title: "Sample API", version: "1.0.0" },
    paths: {
        "/sample/v1/resource/{resourceId}": {
            get: {
                summary: "Get Resource",
                description: "Retrieves a resource by ID.",
                tags: ["Resources"],
                parameters: [
                    { name: "resourceId", in: "path", required: true, schema: { type: "string" }, description: "The resource GUID." }
                ]
            }
        }
    }
}, null, 2);

export default function IngestPage() {
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [platformId, setPlatformId] = useState("");
    const [spec, setSpec] = useState(SAMPLE_SPEC);
    const [result, setResult] = useState<object | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("/api/platforms").then((r) => r.json()).then((p) => {
            setPlatforms(p);
            if (p.length > 0) setPlatformId(String(p[0].id));
        });
    }, []);

    const run = async () => {
        setLoading(true);
        setResult(null);
        setError("");
        try {
            const parsed = JSON.parse(spec);
            const res = await fetch("/api/ingest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platformId: parseInt(platformId), spec: parsed }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Ingest failed");
            setResult(data);
        } catch (err) {
            setError(String(err));
        }
        setLoading(false);
    };

    return (
        <div>
            <h1 className="admin-page-title">Ingest OpenAPI Spec</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.85rem", maxWidth: "60ch" }}>
                Paste an OpenAPI 3.x JSON spec below. This will upsert all endpoints and parameters for the selected platform.
                Existing <strong>Parameter Guides</strong> are preserved and never overwritten.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Target Platform</label>
                    <select className="form-select" value={platformId} onChange={(e) => setPlatformId(e.target.value)}>
                        {platforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">OpenAPI 3.x JSON Spec</label>
                <textarea
                    className="form-textarea"
                    style={{ minHeight: "50vh", fontSize: "0.78rem" }}
                    value={spec}
                    onChange={(e) => setSpec(e.target.value)}
                />
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
                <button className="btn btn-primary" onClick={run} disabled={loading || !platformId}>
                    <Upload size={13} /> {loading ? "Running..." : "Run Ingest"}
                </button>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    This is the same endpoint your Python cron jobs call: <code>POST /api/ingest</code>
                </p>
            </div>

            {result && (
                <div style={{ padding: "1rem", background: "color-mix(in srgb, #22c55e 10%, var(--bg))", border: "1px solid #22c55e", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontWeight: 600 }}>
                        <Check size={15} color="#22c55e" /> Ingestion Complete
                    </div>
                    <pre style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}

            {error && (
                <div style={{ padding: "1rem", background: "color-mix(in srgb, #ef4444 10%, var(--bg))", border: "1px solid #ef4444", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, color: "#ef4444" }}>
                        <AlertCircle size={15} /> Error
                    </div>
                    <pre style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>{error}</pre>
                </div>
            )}
        </div>
    );
}
