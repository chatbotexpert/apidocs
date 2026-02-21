import { NavPane } from "@/components/docs/NavPane";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="docs-layout">
            <NavPane />
            {children}
        </div>
    );
}
