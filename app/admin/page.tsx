import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Globe, Link2, BookOpen, Upload } from "lucide-react";

export default async function AdminDashboard() {
    const [platforms, endpoints, params, guides] = await Promise.all([
        prisma.platform.count(),
        prisma.endpoint.count(),
        prisma.parameter.count(),
        prisma.parameterGuide.count(),
    ]);

    const stats = [
        { label: "Platforms", value: platforms, icon: Globe, href: "/admin/platforms" },
        { label: "Endpoints", value: endpoints, icon: Link2, href: "/admin/endpoints" },
        { label: "Parameters", value: params, icon: "📋", href: "/admin/endpoints" },
        { label: "Guides Written", value: guides, icon: BookOpen, href: "/admin/guides" },
    ];

    const recentEndpoints = await prisma.endpoint.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { platform: { select: { name: true } } },
    });

    return (
        <div>
            <h1 className="admin-page-title">Dashboard</h1>
            <div className="stats-grid">
                {stats.map(({ label, value, href }) => (
                    <Link key={label} href={href} style={{ textDecoration: "none" }}>
                        <div className="stat-card" style={{ cursor: "pointer", transition: "border-color 0.15s" }}>
                            <div className="stat-label">{label}</div>
                            <div className="stat-value">{value}</div>
                        </div>
                    </Link>
                ))}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <div className="section-title">Recently Added Endpoints</div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Platform</th>
                            <th>Method</th>
                            <th>Path</th>
                            <th>Summary</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentEndpoints.map((ep) => (
                            <tr key={ep.id}>
                                <td style={{ color: "var(--text-muted)" }}>{ep.platform.name}</td>
                                <td><span className={`badge badge-${ep.method}`}>{ep.method}</span></td>
                                <td><code style={{ fontSize: "0.78rem" }}>{ep.path}</code></td>
                                <td>{ep.summary}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ padding: "1rem", background: "var(--bg-secondary)", borderRadius: "10px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Upload size={15} color="var(--accent)" />
                    <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>Quick Ingest</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                    Push a new OpenAPI spec to automatically update endpoints. Go to the Ingest page to run it manually.
                </p>
                <Link href="/admin/ingest" className="btn btn-primary" style={{ width: "fit-content" }}>
                    Open Ingest Tool →
                </Link>
            </div>
        </div>
    );
}
