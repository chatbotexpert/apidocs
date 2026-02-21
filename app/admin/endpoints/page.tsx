"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Endpoint {
    id: number;
    path: string;
    method: string;
    summary: string;
    category: string | null;
    platformId: number;
    platform: { name: string };
    _count: { parameters: number };
}

interface Platform { id: number; name: string; }

export default function EndpointsPage() {
    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [filter, setFilter] = useState("");
    const [editing, setEditing] = useState<Endpoint | null>(null);
    const [form, setForm] = useState({ summary: "", description: "", category: "" });

    const load = async () => {
        const [e, p] = await Promise.all([
            fetch("/api/endpoints").then((r) => r.json()),
            fetch("/api/platforms").then((r) => r.json()),
        ]);
        setEndpoints(e);
        setPlatforms(p);
    };

    useEffect(() => { load(); }, []);

    const filtered = endpoints.filter((e) =>
        filter === "" ||
        e.path.includes(filter) ||
        e.summary.toLowerCase().includes(filter.toLowerCase()) ||
        e.platform.name.toLowerCase().includes(filter.toLowerCase())
    );

    const openEdit = (ep: Endpoint) => {
        setForm({ summary: ep.summary, description: "", category: ep.category ?? "" });
        setEditing(ep);
    };

    const save = async () => {
        if (!editing) return;
        await fetch(`/api/endpoints/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setEditing(null);
        load();
    };

    const del = async (id: number) => {
        if (!confirm("Delete this endpoint?")) return;
        await fetch(`/api/endpoints/${id}`, { method: "DELETE" });
        load();
    };

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Endpoints</h1>
                <input
                    className="form-input"
                    style={{ width: "260px" }}
                    placeholder="Filter by path, summary, platform..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            <table className="data-table">
                <thead>
                    <tr><th>Platform</th><th>Method</th><th>Path</th><th>Summary</th><th>Category</th><th>Params</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {filtered.map((ep) => (
                        <tr key={ep.id}>
                            <td style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>{ep.platform.name}</td>
                            <td><span className={`badge badge-${ep.method}`}>{ep.method}</span></td>
                            <td><code style={{ fontSize: "0.75rem" }}>{ep.path}</code></td>
                            <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ep.summary}</td>
                            <td style={{ color: "var(--text-muted)" }}>{ep.category ?? "—"}</td>
                            <td style={{ color: "var(--text-muted)" }}>{ep._count.parameters}</td>
                            <td>
                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                    <Link href={`/docs/${ep.id}`} target="_blank" className="btn btn-secondary" style={{ padding: "0.3rem 0.5rem" }}><ExternalLink size={11} /></Link>
                                    <button className="btn btn-secondary" onClick={() => openEdit(ep)}><Pencil size={11} /></button>
                                    <button className="btn btn-danger" style={{ padding: "0.3rem 0.5rem" }} onClick={() => del(ep.id)}><Trash2 size={11} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No endpoints found.</td></tr>
                    )}
                </tbody>
            </table>

            {editing && (
                <div className="modal-backdrop">
                    <div className="modal-box">
                        <h2 className="modal-title">Edit Endpoint</h2>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                            <span className={`badge badge-${editing.method}`}>{editing.method}</span> <code>{editing.path}</code>
                        </p>
                        <div className="form-group">
                            <label className="form-label">Summary</label>
                            <input className="form-input" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Users, Loans, Mail" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ minHeight: "100px" }} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setEditing(null)}><X size={13} /> Cancel</button>
                            <button className="btn btn-primary" onClick={save}><Check size={13} /> Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
