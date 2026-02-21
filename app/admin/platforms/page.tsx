"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface Platform {
    id: number;
    name: string;
    baseUrl: string;
    authType: string;
    _count?: { endpoints: number };
}

const EMPTY_FORM = { name: "", baseUrl: "", authType: "OAuth2" };

export default function PlatformsPage() {
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Platform | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [msg, setMsg] = useState("");

    const load = async () => {
        const res = await fetch("/api/platforms");
        setPlatforms(await res.json());
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setShowModal(true); };
    const openEdit = (p: Platform) => { setForm({ name: p.name, baseUrl: p.baseUrl, authType: p.authType }); setEditing(p); setShowModal(true); };

    const save = async () => {
        const url = editing ? `/api/platforms/${editing.id}` : "/api/platforms";
        const method = editing ? "PUT" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (res.ok) { setShowModal(false); load(); setMsg("Saved!"); setTimeout(() => setMsg(""), 2000); }
    };

    const del = async (id: number) => {
        if (!confirm("Delete this platform and all its endpoints?")) return;
        await fetch(`/api/platforms/${id}`, { method: "DELETE" });
        load();
    };

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Platforms</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {msg && <span style={{ color: "#22c55e", fontSize: "0.8rem" }}><Check size={13} style={{ display: "inline" }} /> {msg}</span>}
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> Add Platform</button>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr><th>Name</th><th>Base URL</th><th>Auth Type</th><th>Endpoints</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {platforms.map((p) => (
                        <tr key={p.id}>
                            <td style={{ fontWeight: 500 }}>{p.name}</td>
                            <td><code style={{ fontSize: "0.78rem" }}>{p.baseUrl}</code></td>
                            <td>{p.authType}</td>
                            <td style={{ color: "var(--text-muted)" }}>{p._count?.endpoints ?? 0}</td>
                            <td>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button className="btn btn-secondary" onClick={() => openEdit(p)}><Pencil size={12} /></button>
                                    <button className="btn btn-danger" onClick={() => del(p.id)}><Trash2 size={12} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {platforms.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No platforms yet. Add one to get started.</td></tr>
                    )}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-box">
                        <h2 className="modal-title">{editing ? "Edit Platform" : "Add Platform"}</h2>
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Salesforce" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Base URL</label>
                            <input className="form-input" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} placeholder="https://api.example.com" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Auth Type</label>
                            <select className="form-select" value={form.authType} onChange={(e) => setForm({ ...form, authType: e.target.value })}>
                                <option>OAuth2</option>
                                <option>API Key</option>
                                <option>Bearer Token</option>
                                <option>OAuth2 (Azure AD)</option>
                                <option>OAuth2 (Google)</option>
                                <option>Basic Auth</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}><X size={13} /> Cancel</button>
                            <button className="btn btn-primary" onClick={save}><Check size={13} /> {editing ? "Save Changes" : "Create"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
