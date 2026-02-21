import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await context.params;
        const id = parseInt(idStr);
        const body = await req.json();
        const platform = await prisma.platform.update({
            where: { id },
            data: { name: body.name, baseUrl: body.baseUrl, authType: body.authType, logoUrl: body.logoUrl ?? null },
        });
        return NextResponse.json(platform);
    } catch {
        return NextResponse.json({ error: "Failed to update platform" }, { status: 400 });
    }
}

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await context.params;
        const id = parseInt(idStr);
        await prisma.platform.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete platform" }, { status: 400 });
    }
}
