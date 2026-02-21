const fs = require('fs');

const data = JSON.parse(fs.readFileSync('ice_endpoints_clean.json', 'utf8'));

let seedContent = fs.readFileSync('prisma/seed.ts', 'utf8');

const icePlatformStr = `
    // ════════════════════════════════════════════
    // ICE MORTGAGE TECHNOLOGY
    // ════════════════════════════════════════════
    const icePlatform = await prisma.platform.upsert({
        where: { name: "ICE Mortgage Technology" },
        create: { name: "ICE Mortgage Technology", baseUrl: "https://api.icemortgagetechnology.com", authType: "OAuth2" },
        update: {},
    });\n
`;

const endpointCalls = data.map(e => {
    const safeSummary = e.summary.replace(/"/g, '\\"');
    return `    await upsertEndpoint(icePlatform.id, "${e.path}", "${e.method}", "${safeSummary}", "ICE Mortgage Technology API endpoint.", "ICE APIs");`;
}).join('\n');

const fullIceCode = icePlatformStr + endpointCalls + '\n\n    // ════════════════════════════════════════════\n    // KEY PARAMETERS';

seedContent = seedContent.replace(/\/\/ ════════════════════════════════════════════\s*\/\/\s*KEY PARAMETERS/, fullIceCode);

fs.writeFileSync('prisma/seed.ts', seedContent);
console.log("Successfully injected ICE Mortgage APIs into seed.ts");
