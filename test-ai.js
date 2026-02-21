fetch("http://localhost:3000/api/endpoints/23/generate-guide", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
}).then(async res => {
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text.substring(0, 200));
}).catch(e => console.error("Fetch Error:", e));
