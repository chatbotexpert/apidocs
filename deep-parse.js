const fs = require('fs');
const https = require('https');

// A function to fetch a JSON file
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function scrapeICE() {
    console.log("Starting ICE Mortgage API extraction...");

    // We can pull the underlying OpenAPI spec or index if possible,
    // but the site uses ReadMe API docs. ReadMe typically exposes an enterprise
    // specification or exposes data via __NEXT_DATA__ in the HTML.

    // Let's look at the HTML of a single endpoint to see if it contains __NEXT_DATA__
    const sampleHtml = fs.readFileSync('ice_html.txt', 'utf8');

    // Extract __NEXT_DATA__ if it exists
    const match = sampleHtml.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);

    if (match) {
        console.log("Found Next.js data payload. Parsing...");
        const nextData = JSON.parse(match[1]);

        const endpoints = [];

        // Let's traverse the tree to find API endpoints.
        // ReadMe usually stores this in props.pageProps.project.apiSettings or similar.
        // Or we can just stringify and regex search for endpoints.
        const allStr = JSON.stringify(nextData);

        // We really just want method, path, title.
        // Since it's huge, let's just use the links we already parsed and 
        // fetch the individual pages, or try to extract from the sidebar state.

        // It's faster to write a generic seed function that we can plug our URLs into,
        // and parse the title/methods out of each page's HTML.
        console.log("NextData length:", allStr.length);
        fs.writeFileSync("next_data.json", JSON.stringify(nextData, null, 2));
    } else {
        console.log("No Next Data found.");
    }
}

scrapeICE();
