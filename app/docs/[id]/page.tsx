import { prisma } from "@/lib/prisma";
import { DetailPane } from "@/components/docs/DetailPane";
import { CodePane } from "@/components/docs/CodePane";
import { notFound } from "next/navigation";

interface Props { params: Promise<{ id: string }> }

export default async function EndpointPage({ params }: Props) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) notFound();

    const endpoint = await prisma.endpoint.findUnique({
        where: { id },
        include: {
            platform: true,
            guide: true,
            parameters: { include: { guide: true } },
        },
    });

    if (!endpoint) notFound();

    return (
        <>
            <DetailPane endpoint={endpoint} />
            <CodePane endpoint={endpoint} />
        </>
    );
}

export async function generateStaticParams() {
    return [];
}
