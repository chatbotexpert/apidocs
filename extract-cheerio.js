const fs = require('fs');
const cheerio = require('cheerio');

async function extractIceApis() {
    const html = fs.readFileSync('ice_html.txt', 'utf8');
    const $ = cheerio.load(html);

    const endpoints = [];

    // In ReadMe, the sidebar items typically look like this:
    // <a href="/developer-connect/reference/..." class="...">
    //   <span class="rm-api-method rm-api-method-get">get</span>
    //   <span class="rm-Sidebar-heading">Get User</span>
    // </a>

    // We can also just search all 'a' tags that link to reference
    $('a[href^="/developer-connect/reference/"]').each((i, el) => {
        const href = $(el).attr('href');
        if (href.includes('browse-apis') || href.includes('getting-started') || href.includes('/developer-connect/reference#')) return;

        // Find method block
        let method = "GET"; // default
        const methodText = $(el).find('[class*="method"]').text().trim().toUpperCase();
        if (methodText && ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(methodText)) {
            method = methodText;
        } else {
            // Sometimes it's encoded differently or missing in sidebar, so we use a fallback regex on the classes
            const cls = $(el).html();
            if (cls.includes('-get"')) method = "GET";
            else if (cls.includes('-post"')) method = "POST";
            else if (cls.includes('-put"')) method = "PUT";
            else if (cls.includes('-patch"')) method = "PATCH";
            else if (cls.includes('-delete"')) method = "DELETE";
        }

        let title = $(el).text().replace(methodText, '').trim();
        if (!title) {
            // Backup, try getting title from URL slug
            const parts = href.split('/');
            const slug = parts[parts.length - 1];
            title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }

        // Clean title
        title = title.replace(/\s+/g, ' ').trim();

        // Only add if it's an actual endpoint (has a method) and not already added
        if (method && !endpoints.find(e => e.path === href)) {
            endpoints.push({
                method: method,
                // Make the path look like a standard API suffix since we don't have the real path yet
                // For ICE, base URL is usually https://api.icemortgagetechnology.com
                path: href.replace('/developer-connect/reference/', '/'),
                summary: title
            });
        }
    });

    console.log(`Extracted ${endpoints.length} valid endpoints!`);
    fs.writeFileSync('ice_endpoints.json', JSON.stringify(endpoints, null, 2));

    if (endpoints.length > 0) {
        console.log("First 5:");
        console.log(endpoints.slice(0, 5));
    }
}

extractIceApis();
