import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const platforms = await prisma.platform.findMany({
            include: {
                _count: { select: { endpoints: true } },
            },
            orderBy: { name: "asc" },
        });
        return NextResponse.json(platforms);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch platforms" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const platform = await prisma.platform.create({
            data: {
                name: body.name,
                baseUrl: body.baseUrl,
                authType: body.authType,
                logoUrl: body.logoUrl ?? null,
            },
        });
        return NextResponse.json(platform, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create platform" }, { status: 400 });
    }
}
