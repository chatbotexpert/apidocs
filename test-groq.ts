import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function main() {
    try {
        console.log("Testing Groq...");
        const result = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            prompt: "Say hello",
        });
        console.log("Success:", result.text);
    } catch (e) {
        console.error("Error from Groq:", e);
    }
}

main();
