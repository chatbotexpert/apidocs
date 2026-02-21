const fs = require('fs');

async function getHtml() {
    const res = await fetch("https://developer.icemortgagetechnology.com/developer-connect/reference/browse-apis");
    const html = await res.text();
    fs.writeFileSync("ice_html.txt", html);
    console.log("Wrote ICE HTML to ice_html.txt");
}

getHtml();
