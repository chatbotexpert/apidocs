import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Feed a reasonable context of available APIs to the LLM (limit to prevent context overflow)
        const allEndpoints = await prisma.endpoint.findMany({
            take: 75,
            include: { platform: true }
        });

        let apiContext = "Available API Platforms and Endpoints:\n\n";
        for (const endpoint of allEndpoints) {
            apiContext += `- [${endpoint.platform.name}] ${endpoint.method} ${endpoint.path}: ${endpoint.summary}\n`;
        }

        const systemPrompt = `You are a highly intelligent API Assistant named Whodocs AI. 
The user is going to tell you what they want to achieve (e.g., "I want to charge a customer in Stripe").
Your job is to read their request and suggest the BEST endpoints available from our database to accomplish it.

${apiContext}

Rules:
1. Be concise, friendly, and helpful.
2. If the user asks about something we have an API for, suggest the exact path and method.
3. Do not make up APIs that are not in the list.
4. Provide Markdown formatting, using code blocks (\`\`) for paths and bolding for emphasis.`;

        const result = await streamText({
            model: groq("llama-3.3-70b-versatile"),
            system: systemPrompt,
            messages: messages as any, // Bypass TS CoreMessage mismatch
        });

        return result.toTextStreamResponse();

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
