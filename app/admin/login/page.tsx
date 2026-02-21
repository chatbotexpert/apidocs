"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
    const [creds, setCreds] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await signIn("credentials", {
            ...creds,
            redirect: false,
        });
        setLoading(false);
        if (res?.ok) {
            router.push("/admin");
        } else {
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg)",
        }}>
            <div style={{
                width: "360px",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "2rem",
                background: "var(--bg-secondary)",
            }}>
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <div style={{ display: "inline-flex", padding: "0.75rem", borderRadius: "12px", background: "color-mix(in srgb, var(--accent) 12%, transparent)", marginBottom: "0.75rem" }}>
                        <Lock size={20} color="var(--accent)" />
                    </div>
                    <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)" }}>Admin Portal</h1>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>HashTurn API Documentation CMS</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            className="form-input"
                            type="text"
                            value={creds.username}
                            onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                            placeholder="admin"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            value={creds.password}
                            onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {error && (
                        <p style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "0.75rem" }}>{error}</p>
                    )}
                    <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p style={{ marginTop: "1rem", fontSize: "0.72rem", color: "var(--text-subtle)", textAlign: "center" }}>
                    Default: admin / admin123 (change in .env.local)
                </p>
            </div>
        </div>
    );
}
