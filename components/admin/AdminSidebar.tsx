"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Globe, Link2, BookOpen, Upload, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOut } from "next-auth/react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/platforms", label: "Platforms", icon: Globe },
    { href: "/admin/endpoints", label: "Endpoints", icon: Link2 },
    { href: "/admin/guides", label: "Param Guides", icon: BookOpen },
    { href: "/admin/ingest", label: "Ingest", icon: Upload },
];

export function AdminSidebar() {
    const path = usePathname();
    return (
        <aside className="admin-sidebar">
            <div className="admin-header">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="logo" style={{ fontSize: "1rem" }}>Hash<span style={{ color: "var(--accent)" }}>Turn</span> Admin</span>
                    <ThemeToggle />
                </div>
                <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: "0.3rem" }}>API Documentation CMS</p>
            </div>
            <nav>
                {navItems.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`admin-nav-item ${path === href ? "active" : ""}`}
                    >
                        <Icon size={15} />
                        {label}
                    </Link>
                ))}
            </nav>
            <div style={{ marginTop: "auto", padding: "1rem" }}>
                <button
                    onClick={() => signOut({ callbackUrl: "/admin/login" })}
                    className="btn btn-secondary"
                    style={{ width: "100%", justifyContent: "center" }}
                >
                    <LogOut size={13} /> Sign Out
                </button>
            </div>
        </aside>
    );
}
