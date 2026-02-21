"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUp, Bot, User, Sparkles } from "lucide-react";

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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative", background: "var(--bg)" }}>
            {/* Header */}
            <div className="glass-panel" style={{
                padding: "1rem 2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                zIndex: 10,
                borderBottom: "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                borderRadius: 0,
                boxShadow: "none"
            }}>
                <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem", margin: 0, fontWeight: 600 }}>
                    <Sparkles size={16} style={{ color: "var(--accent)" }} />
                    HashTurn API Assistant
                </h1>
            </div>

            {/* Chat History */}
            <div style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "100%", maxWidth: "768px", display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "120px" }}>
                    {messages.length === 0 && (
                        <div style={{ textAlign: "center", margin: "4rem auto", color: "var(--text-subtle)", animation: "fade-in 0.5s ease" }}>
                            <div style={{
                                width: "48px", height: "48px", borderRadius: "12px",
                                background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                                color: "var(--accent)",
                                display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center",
                                margin: "0 auto 1.5rem"
                            }}>
                                <Sparkles size={24} />
                            </div>
                            <h2 style={{ fontSize: "1.25rem", color: "var(--text)", marginBottom: "0.5rem", fontWeight: 500 }}>How can I help you build?</h2>
                            <p style={{ fontSize: "0.95rem" }}>Ask me about endpoints, parameters, or ways to integrate.</p>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div key={index} style={{
                            display: "flex",
                            gap: "1.25rem",
                            width: "100%",
                            flexDirection: message.role === "user" ? "row-reverse" : "row"
                        }}>
                            <div style={{
                                width: "32px", height: "32px", borderRadius: "50%",
                                background: message.role === "user" ? "var(--bg-tertiary)" : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0
                            }}>
                                {message.role === "user" ?
                                    <User size={16} style={{ color: "var(--text-muted)" }} /> :
                                    <Sparkles size={20} style={{ color: "var(--accent)" }} />
                                }
                            </div>

                            <div style={{
                                background: message.role === "user" ? "var(--bg-tertiary)" : "transparent",
                                padding: message.role === "user" ? "0.75rem 1.25rem" : "0 0.25rem",
                                borderRadius: "18px",
                                borderTopRightRadius: message.role === "user" ? "4px" : "18px",
                                borderTopLeftRadius: message.role === "assistant" ? "4px" : "18px",
                                maxWidth: "85%",
                                fontSize: "0.95rem",
                                lineHeight: 1.6,
                                color: "var(--text)",
                                wordBreak: "break-word"
                            }}>
                                {message.role === "assistant" ? (
                                    <div className="markdown" style={{ margin: 0 }}>
                                        {message.content === "" ? (
                                            <span style={{ display: "inline-block", width: "8px", height: "8px", background: "var(--accent)", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
                                        ) : (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {message.content}
                                            </ReactMarkdown>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ whiteSpace: "pre-wrap" }}>{message.content}</div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Form Floating */}
            <div style={{
                position: "absolute",
                bottom: "2rem",
                left: "0",
                right: "0",
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
                padding: "0 2rem",
                zIndex: 20
            }}>
                <form onSubmit={handleSubmit} className="glass-pill" style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "768px",
                    pointerEvents: "auto",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "0.5rem 0.75rem",
                    transition: "box-shadow 0.2s ease, transform 0.2s ease"
                }}>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message HashTurn API Assistant..."
                        disabled={isLoading}
                        rows={1}
                        style={{
                            flex: 1,
                            padding: "0.5rem 0.5rem",
                            fontSize: "0.95rem",
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            color: "var(--text)",
                            resize: "none",
                            maxHeight: "200px",
                            fontFamily: "inherit",
                            lineHeight: "1.5"
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: (input.trim() && !isLoading) ? "var(--text)" : "var(--bg-tertiary)",
                            color: (input.trim() && !isLoading) ? "var(--bg)" : "var(--text-subtle)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            cursor: (input.trim() && !isLoading) ? "pointer" : "default",
                            transition: "all 0.2s ease",
                            marginBottom: "0.25rem",
                            flexShrink: 0
                        }}
                    >
                        <ArrowUp size={16} strokeWidth={2.5} />
                    </button>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0% { opacity: 0.4; }
                    50% { opacity: 1; }
                    100% { opacity: 0.4; }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .markdown p:first-child { margin-top: 0; }
                .markdown p:last-child { margin-bottom: 0; }
            `}} />
        </div>
    );
}
