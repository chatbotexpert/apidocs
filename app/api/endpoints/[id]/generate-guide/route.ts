import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await context.params;
        const id = parseInt(idStr);

        // Fetch endpoint details
        const endpoint = await prisma.endpoint.findUnique({
            where: { id },
            include: {
                platform: true,
                parameters: true,
            },
        });

        if (!endpoint) return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });

        // Build the context string for the AI
        let promptContext = `
Please act as an expert Developer Advocate and technical writer. 
Write a highly engaging, practical, and clean Markdown guide explaining how to use the following API endpoint.

**API Details:**
- **Platform:** ${endpoint.platform.name}
- **Method & Path:** ${endpoint.method} ${endpoint.path}
- **Summary:** ${endpoint.summary}
- **Description:** ${endpoint.description || "N/A"}

**Parameters:**
`;

        if (endpoint.parameters.length > 0) {
            endpoint.parameters.forEach(p => {
                promptContext += `- **${p.name}** (${p.type}, ${p.location}): ${p.isRequired ? "REQUIRED" : "Optional"}. ${p.description || "No description provided."}\n`;
            });
        } else {
            promptContext += "- None\n";
        }

        promptContext += `
**Requirements for the output:**
1. Do NOT put the response inside a markdown code block (\`\`\`markdown ... \`\`\`). Output raw Markdown directly.
2. Start directly with an H1 title (e.g., "# Using [Feature Name]").
3. Briefly explain what this endpoint does and why it's useful (common use cases).
4. Provide a practical \`curl\` or \`fetch\` example. Be sure to use \`YOUR_TOKEN\` or standard placeholders for auth.
5. Provide a tip or cautionary warning using GitHub-style alerts (e.g., \`> [!TIP]\` or \`> [!CAUTION]\`).
6. Keep the tone professional, concise, and helpful.
`;

        // Stream the response using the Vercel AI SDK
        const result = streamText({
            model: groq("llama-3.3-70b-versatile"),
            system: "You are an elite API documentation engineer. Provide clear, beautifully formatted Markdown.",
            prompt: promptContext,
            async onFinish({ text }) {
                // Save it back to the database once complete
                await prisma.endpointGuide.upsert({
                    where: { endpointId: id },
                    create: { endpointId: id, markdown: text },
                    update: { markdown: text },
                });
            }
        });

        return result.toTextStreamResponse();

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate guide", details: error.message || String(error) }, { status: 500 });
    }
}
