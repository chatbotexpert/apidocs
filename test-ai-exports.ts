import * as ai from "ai";
import * as fs from "fs";

fs.writeFileSync("ai-exports.json", JSON.stringify(Object.keys(ai).filter(k => k.toLowerCase().includes("data")), null, 2));
