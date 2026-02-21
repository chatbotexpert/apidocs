const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('ice_html.txt', 'utf8');
const $ = cheerio.load(html);

console.log("Analyzing DOM structure...");

$('a[href^="/developer-connect/reference/"]').slice(0, 3).each((i, el) => {
    console.log("Link:", $(el).text().trim().substring(0, 50));

    let parent = $(el).parent();
    for (let j = 0; j < 4; j++) {
        if (!parent.length) break;
        console.log(`  Parent ${j} <${parent[0].name}> Class:`, parent.attr('class'));

        let prev = parent.prev();
        if (prev.length) {
            console.log(`    PrevSibling <${prev[0].name}> Class:`, prev.attr('class'));
            console.log(`    PrevSibling Text:`, prev.text().trim().substring(0, 50));
        }
        parent = parent.parent();
    }
    console.log("----");
});
