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

        const guide = await prisma.parameterGuide.upsert({
            where: { parameterId: id },
            create: { parameterId: id, markdown: body.markdown },
            update: { markdown: body.markdown },
        });
        return NextResponse.json(guide);
    } catch {
        return NextResponse.json({ error: "Failed to update guide" }, { status: 400 });
    }
}

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await context.params;
        const id = parseInt(idStr);
        await prisma.parameterGuide.delete({ where: { parameterId: id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete guide" }, { status: 400 });
    }
}
