import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ingestOpenAPISpec } from "@/lib/ingest";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { platformId, spec } = body;

        if (!platformId || !spec) {
            return NextResponse.json(
                { error: "platformId and spec are required" },
                { status: 400 }
            );
        }

        // Verify platform exists
        const platform = await prisma.platform.findUnique({
            where: { id: platformId },
        });
        if (!platform) {
            return NextResponse.json({ error: "Platform not found" }, { status: 404 });
        }

        const results = await ingestOpenAPISpec(platformId, spec);

        return NextResponse.json({
            success: true,
            platform: platform.name,
            ...results,
        });
    } catch (err) {
        console.error("Ingest error:", err);
        return NextResponse.json(
            { error: "Ingestion failed", detail: String(err) },
            { status: 500 }
        );
    }
}
