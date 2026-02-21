const fs = require('fs');

try {
    const html = fs.readFileSync('ice_html.txt', 'utf8');

    // Find all links that look like API reference links
    // Format is usually /developer-connect/reference/{api-name}
    const regex = /href="(\/developer-connect\/reference\/[^"]+)"/g;

    const links = new Set();
    let match;

    while ((match = regex.exec(html)) !== null) {
        // Exclude general pages
        if (!match[1].includes("browse-apis") && !match[1].includes("getting-started")) {
            links.add(match[1]);
        }
    }

    const uniqueLinks = Array.from(links).sort();

    console.log(`Found ${uniqueLinks.length} API reference links.`);
    console.log("First 10 links:");
    uniqueLinks.slice(0, 10).forEach(link => console.log(link));

    // Save all links for easy access
    fs.writeFileSync('ice_links.json', JSON.stringify(uniqueLinks, null, 2));
} catch (e) {
    console.error(e);
}
