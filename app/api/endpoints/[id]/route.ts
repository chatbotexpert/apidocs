import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await context.params;
        const id = parseInt(idStr);
        const endpoint = await prisma.endpoint.findUnique({
            where: { id },
            include: {
                platform: true,
                parameters: { include: { guide: true } },
                guide: true,
            },
        });
        if (!endpoint) return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
        return NextResponse.json(endpoint);
    } catch {
        return NextResponse.json({ error: "Failed to fetch endpoint" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await context.params;
        const id = parseInt(idStr);
        const body = await req.json();
        const endpoint = await prisma.endpoint.update({
            where: { id },
            data: { summary: body.summary, description: body.description, category: body.category },
        });
        return NextResponse.json(endpoint);
    } catch {
        return NextResponse.json({ error: "Failed to update endpoint" }, { status: 400 });
    }
}

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await context.params;
        const id = parseInt(idStr);
        await prisma.endpoint.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete endpoint" }, { status: 400 });
    }
}
