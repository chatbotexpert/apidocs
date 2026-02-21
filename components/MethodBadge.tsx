export function MethodBadge({ method }: { method: string }) {
    const m = method.toUpperCase();
    return <span className={`badge badge-${m}`}>{m}</span>;
}
