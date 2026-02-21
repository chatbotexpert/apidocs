import { Sparkles, Command } from "lucide-react";

export default function DocsHomePage() {
    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
            {/* Premium Background Glows */}
            <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 15%, transparent) 0%, transparent 60%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }}></div>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, padding: "2rem" }}>
                <div className="glass-panel" style={{
                    maxWidth: "500px",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "3rem 2rem",
                    borderRadius: "24px",
                    textAlign: "center",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
                    border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                }}>
                    <div style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "16px",
                        background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1.5rem",
                        boxShadow: "inset 0 2px 4px rgba(255,255,255,0.1)"
                    }}>
                        <Sparkles size={32} style={{ color: "var(--accent)" }} />
                    </div>

                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
                        Explore API Documentation
                    </h1>

                    <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "2.5rem" }}>
                        Select a platform and endpoint from the navigation sidebar to view its detailed parameters, test out code snippets, and generate AI-powered integration guides.
                    </p>

                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1.25rem",
                        borderRadius: "100px",
                        background: "var(--bg-tertiary)",
                        border: "1px solid color-mix(in srgb, var(--border) 60%, transparent)",
                        color: "var(--text-subtle)",
                        fontSize: "0.85rem",
                        fontWeight: 500
                    }}>
                        <Command size={14} />
                        <span>Press <kbd style={{ padding: "0.15rem 0.4rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "0.75rem", margin: "0 0.2rem", color: "var(--text)" }}>Ctrl</kbd> + <kbd style={{ padding: "0.15rem 0.4rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "0.75rem", margin: "0 0.2rem", color: "var(--text)" }}>K</kbd> to search endpoints</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
