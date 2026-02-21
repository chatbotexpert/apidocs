async function main() {
    try {
        const response = await fetch("http://localhost:3000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ messages: [{ role: "user", content: "How do I create a customer in stripe?" }] })
        });

        console.log("Status:", response.status);

        const text = await response.text();
        console.log("Body:");
        console.log(text.substring(0, 500) + (text.length > 500 ? "..." : ""));
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

main();
