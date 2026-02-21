import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config({ path: ".env" });

async function main() {
    try {
        const result = streamText({
            model: groq("llama-3.3-70b-versatile"),
            prompt: "Say hello",
        });

        fs.writeFileSync("stream-result.json", JSON.stringify({
            isPromise: result instanceof Promise,
            keys: Object.keys(result),
            type: typeof result
        }, null, 2));

        if (result instanceof Promise) {
            const resolved = await result;
            fs.writeFileSync("stream-result-resolved.json", JSON.stringify({
                keys: Object.keys(resolved)
            }, null, 2));
        }
    } catch (e) {
        console.error("Error from Groq:", e);
    }
}

main();
