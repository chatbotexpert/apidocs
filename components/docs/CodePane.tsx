"use client";

import { useState, useCallback } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

interface Endpoint {
    path: string;
    method: string;
    summary: string;
    platform: { name: string; baseUrl: string; authType: string };
    parameters: { name: string; type: string; location: string; isRequired: boolean }[];
}

type Lang = "curl" | "python" | "javascript";

function generateSnippet(endpoint: Endpoint, lang: Lang): string {
    const url = `${endpoint.platform.baseUrl}${endpoint.path}`;
    const pathParams = endpoint.parameters.filter((p) => p.location === "path");
    const queryParams = endpoint.parameters.filter((p) => p.location === "query");
    const bodyParams = endpoint.parameters.filter((p) => p.location === "body");

    // Replace path params with placeholders
    let filledUrl = url;
    for (const p of pathParams) {
        filledUrl = filledUrl.replace(`{${p.name}}`, `{${p.name.toUpperCase()}}`);
    }

    const queryStr = queryParams.length
        ? "?" + queryParams.map((p) => `${p.name}=<${p.name}>`).join("&")
        : "";

    const bodyObj = bodyParams.reduce((acc, p) => ({ ...acc, [p.name]: `<${p.name}>` }), {});

    if (lang === "curl") {
        const lines = [
            `curl -X ${endpoint.method} \\`,
            `  "${filledUrl}${queryStr}" \\`,
            `  -H "Authorization: Bearer YOUR_TOKEN" \\`,
            `  -H "Content-Type: application/json"`,
        ];
        if (bodyParams.length) {
            lines.push(`  -d '${JSON.stringify(bodyObj, null, 2)}'`);
        }
        return lines.join("\n");
    }

    if (lang === "python") {
        return `import requests

url = "${filledUrl}${queryStr}"
headers = {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
}
${bodyParams.length ? `payload = ${JSON.stringify(bodyObj, null, 4)}\n\nresponse = requests.${endpoint.method.toLowerCase()}(url, headers=headers, json=payload)` : `response = requests.${endpoint.method.toLowerCase()}(url, headers=headers)`}

print(response.status_code)
print(response.json())`;
    }

    // JavaScript
    return `const url = "${filledUrl}${queryStr}";

const response = await fetch(url, {
  method: "${endpoint.method}",
  headers: {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json",
  },${bodyParams.length ? `\n  body: JSON.stringify(${JSON.stringify(bodyObj, null, 4)}),` : ""}
});

const data = await response.json();
console.log(data);`;
}

const SAMPLE_RESPONSE = {
    id: "3f7a1b2c-4d5e-6f78-9012-abcdef123456",
    status: "success",
    data: {
        message: "Request processed successfully",
        timestamp: "2026-01-01T00:00:00.000Z",
    },
};

export function CodePane({ endpoint }: { endpoint: Endpoint }) {
    const [lang, setLang] = useState<Lang>("curl");
    const [copied, setCopied] = useState(false);

    const snippet = generateSnippet(endpoint, lang);

    const copy = useCallback(async () => {
        await navigator.clipboard.writeText(snippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [snippet]);

    const langMap: Record<Lang, string> = { curl: "bash", python: "python", javascript: "javascript" };

    return (
        <div className="code-pane">
            <div className="code-pane-header">
                <span className="code-pane-title">Code Snippet</span>
                <button className="copy-btn" onClick={copy}>
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>

            <div className="lang-tabs">
                {(["curl", "python", "javascript"] as Lang[]).map((l) => (
                    <button
                        key={l}
                        className={`lang-tab ${lang === l ? "active" : ""}`}
                        onClick={() => setLang(l)}
                    >
                        {l === "curl" ? "cURL" : l === "python" ? "Python" : "JavaScript"}
                    </button>
                ))}
            </div>

            <div className="code-block" style={{
                margin: "1rem",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(0,0,0,0.2)",
                boxShadow: "inset 0 4px 12px rgba(0,0,0,0.1)",
                padding: "0.25rem"
            }}>
                <SyntaxHighlighter
                    language={langMap[lang]}
                    style={vscDarkPlus}
                    customStyle={{
                        background: "transparent",
                        fontSize: "0.82rem",
                        lineHeight: 1.6,
                        margin: 0,
                        padding: "1rem",
                    }}
                    wrapLongLines
                >
                    {snippet}
                </SyntaxHighlighter>
            </div>

            <div style={{
                margin: "0 1rem 1rem",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(0,0,0,0.2)",
                boxShadow: "inset 0 4px 12px rgba(0,0,0,0.1)"
            }}>
                <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "0.7rem", color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Sample Response
                </div>
                <SyntaxHighlighter
                    language="json"
                    style={vscDarkPlus}
                    customStyle={{
                        background: "#010409",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        margin: 0,
                        maxHeight: "200px",
                    }}
                >
                    {JSON.stringify(SAMPLE_RESPONSE, null, 2)}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
