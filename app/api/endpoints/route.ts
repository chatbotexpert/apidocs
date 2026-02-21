import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const platformId = searchParams.get("platformId");

    try {
        const endpoints = await prisma.endpoint.findMany({
            where: platformId ? { platformId: parseInt(platformId) } : undefined,
            include: {
                platform: { select: { name: true } },
                _count: { select: { parameters: true } },
            },
            orderBy: [{ platformId: "asc" }, { category: "asc" }, { path: "asc" }],
        });
        return NextResponse.json(endpoints);
    } catch {
        return NextResponse.json({ error: "Failed to fetch endpoints" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const endpoint = await prisma.endpoint.create({
            data: {
                platformId: body.platformId,
                path: body.path,
                method: body.method.toUpperCase(),
                summary: body.summary,
                description: body.description ?? null,
                category: body.category ?? "General",
            },
        });
        return NextResponse.json(endpoint, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create endpoint" }, { status: 400 });
    }
}
