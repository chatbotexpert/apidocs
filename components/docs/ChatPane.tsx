"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ChatPane() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        const currentMessages = [...messages, userMessage];

        // Add a temporary empty assistant message
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: currentMessages })
            });

            if (!response.ok) throw new Error("Failed to chat");
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let fullText = "";

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    const chunkValue = decoder.decode(value, { stream: true });
                    fullText += chunkValue;
                    setMessages((prev) => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1].content = fullText;
                        return newMsgs;
                    });
                }
            }
        } catch (error) {
            console.error(error);
            setMessages((prev) => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = "Sorry, an error occurred while connecting to HashTurn AI.";
                return newMsgs;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="detail-pane" style={{ display: "flex", flexDirection: "column", height: "100%", padding: 0 }}>
            {/* Header */}
            <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem", margin: 0 }}>
                    <Sparkles size={20} style={{ color: "var(--accent)" }} />
                    HashTurn API Assistant
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                    Describe what you're trying to achieve, and I'll suggest the best API options available below.
                </p>
            </div>

            {/* Chat History */}
            <div style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: "center", margin: "auto", color: "var(--text-subtle)", maxWidth: "400px" }}>
                        <Bot size={40} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                        <p>Hi! I'm your HashTurn API Assistant.</p>
                        <p style={{ fontSize: "0.85rem" }}>Try asking: "How do I retrieve a customer in Stripe?" or "Is there an API to send emails with Google Workspace?"</p>
                    </div>
                )}
                {messages.map((message, index) => (
                    <div key={index} style={{
                        display: "flex",
                        gap: "1rem",
                        flexDirection: message.role === "user" ? "row-reverse" : "row"
                    }}>
                        <div style={{
                            width: "32px", height: "32px", borderRadius: "8px",
                            background: message.role === "user" ? "var(--accent)" : "var(--bg-tertiary)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0
                        }}>
                            {message.role === "user" ? <User size={16} color="white" /> : <Sparkles size={16} style={{ color: "var(--text)" }} />}
                        </div>
                        <div style={{
                            background: message.role === "user" ? "color-mix(in srgb, var(--accent) 15%, transparent)" : "var(--bg-secondary)",
                            padding: "1rem 1.25rem",
                            borderRadius: "12px",
                            border: message.role === "user" ? "none" : "1px solid var(--border)",
                            maxWidth: "80%",
                            fontSize: "0.9rem",
                            lineHeight: 1.6
                        }}>
                            {message.role === "assistant" ? (
                                <div className="markdown" style={{ margin: 0 }}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {message.content || "..."}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div>{message.content}</div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} style={{
                padding: "1.5rem",
                borderTop: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                display: "flex",
                gap: "1rem"
            }}>
                <input
                    className="search-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="E.g., Which API should I use to upload files?"
                    disabled={isLoading}
                    style={{ flex: 1, padding: "0.875rem 1rem", fontSize: "0.95rem" }}
                />
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading || !input.trim()}
                    style={{ padding: "0 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                    <Send size={16} />
                    {isLoading ? "Thinking..." : "Send"}
                </button>
            </form>
        </div>
    );
}
