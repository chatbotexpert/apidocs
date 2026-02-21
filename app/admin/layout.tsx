import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session) {
        redirect("/admin/login");
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-content">{children}</main>
        </div>
    );
}
