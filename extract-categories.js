const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('ice_html.txt', 'utf8');
const $ = cheerio.load(html);

const endpoints = [];

$('a[href^="/developer-connect/reference/"]').each((i, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    if (href.includes('browse-apis') || href.includes('getting-started') || href.includes('/developer-connect/reference#')) return;

    let method = "GET";
    const methodText = $el.find('[class*="method"]').text().trim().toUpperCase();
    if (methodText && ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(methodText)) {
        method = methodText;
    } else {
        const cls = $el.html();
        if (cls.includes('-get"')) method = "GET";
        else if (cls.includes('-post"')) method = "POST";
        else if (cls.includes('-put"')) method = "PUT";
        else if (cls.includes('-patch"')) method = "PATCH";
        else if (cls.includes('-delete"')) method = "DELETE";
    }

    let title = $el.text().replace(methodText, '').trim();
    if (!title) {
        const parts = href.split('/');
        const slug = parts[parts.length - 1];
        title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    // Remove lingering HTTP verbs from title if any
    title = title.replace(/get$/i, '').replace(/post$/i, '').replace(/put$/i, '').replace(/patch$/i, '').replace(/del$/i, '').replace(/delete$/i, '').replace(/\s+/g, ' ').trim();

    // Find Category by going to the wrapping <ul> and looking at its previous sibling button/div
    let category = "General";
    let ul = $el.closest('ul');
    if (ul.length) {
        let prev = ul.prev();
        if (prev.length) {
            let catText = prev.text().trim();
            // Readme specific: Sometimes the button has an icon text mixed in
            // Just take the cleanest part
            if (catText && catText.length < 50) {
                category = catText;
            } else if (prev.length && prev[0].name === 'a') {
                category = prev.text().trim();
            }
        } else {
            // Maybe nested ul?
            let outerUl = ul.parent().closest('ul');
            if (outerUl.length) {
                let outerPrev = outerUl.prev();
                if (outerPrev.length) {
                    category = outerPrev.text().trim();
                }
            }
        }
    }

    if (method && !endpoints.find(e => e.path === href)) {
        endpoints.push({
            method: method,
            path: href.replace('/developer-connect/reference/', '/'),
            summary: title,
            category: category
        });
    }
});

fs.writeFileSync('ice_endpoints_clean.json', JSON.stringify(endpoints, null, 2));
console.log(`Extracted ${endpoints.length} valid endpoints!`);
