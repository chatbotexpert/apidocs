import { NavPane } from "@/components/docs/NavPane";

export default function DocsHomePage() {
    return (
        <div className="docs-layout">
            <NavPane />
            <div className="detail-pane">
                <div className="empty-state">
                    <div className="empty-icon">📡</div>
                    <div className="empty-title">Select an endpoint to get started</div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "360px" }}>
                        Choose a platform and endpoint from the left navigation to view its documentation, parameters, and auto-generated code snippets.
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>
                        Press <kbd style={{ padding: "0.1rem 0.4rem", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "4px" }}>
                            Ctrl+K
                        </kbd> to search all endpoints
                    </p>
                </div>
            </div>
            <div className="code-pane">
                <div style={{ padding: "1rem", borderBottom: "1px solid #21262d" }}>
                    <span className="code-pane-title">Code Snippet</span>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#8b949e", fontSize: "0.82rem", textAlign: "center", padding: "2rem" }}>
                    Select an endpoint to generate code snippets
                </div>
            </div>
        </div>
    );
}
