import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Fuse from "fuse.js";

let cachedResults: object[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 30_000; // 30 seconds

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";

    if (!q || q.length < 2) {
        return NextResponse.json([]);
    }

    try {
        // Refresh cache if stale
        if (!cachedResults || Date.now() - cacheTime > CACHE_TTL) {
            const endpoints = await prisma.endpoint.findMany({
                include: {
                    platform: { select: { name: true } },
                    parameters: { select: { name: true, description: true } },
                },
            });
            cachedResults = endpoints.map((e) => ({
                id: e.id,
                platformId: e.platformId,
                platformName: e.platform.name,
                path: e.path,
                method: e.method,
                summary: e.summary,
                category: e.category,
                parameterNames: e.parameters.map((p) => p.name).join(" "),
            }));
            cacheTime = Date.now();
        }

        const fuse = new Fuse(cachedResults as object[], {
            keys: ["path", "summary", "category", "platformName", "parameterNames"],
            threshold: 0.35,
            minMatchCharLength: 2,
        });

        const results = fuse.search(q).slice(0, 20).map((r) => r.item);
        return NextResponse.json(results);
    } catch {
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
