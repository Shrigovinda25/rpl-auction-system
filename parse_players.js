const fs = require('fs');

function convertGDriveUrl(url) {
    if (!url || !url.includes("drive.google.com")) return url;
    const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/) || url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
    return url;
}

const csvData = fs.readFileSync('c:/D_drive/RPL-Auction/Form Responses 1.csv', 'utf8');
const lines = csvData.split(/\r?\n/);
const dataLines = lines.slice(2); // Skip multi-line header

const players = [];

for (const line of dataLines) {
    if (!line.trim()) continue;
    
    // Simple CSV split (handling some quotes)
    // For a more robust solution we'd use a library, but let's try this simple regex
    const row = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    // Rewriting the split to be more reliable for this specific CSV
    // Actually, let's just use a basic split and manually fix the quoted ones
    const parts = [];
    let currentPart = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            parts.push(currentPart.trim());
            currentPart = "";
        } else {
            currentPart += char;
        }
    }
    parts.push(currentPart.trim());

    if (parts.length < 8) continue;

    const name = parts[1].replace(/^"|"$/g, '');
    if (!name || name === "Player Name") continue;

    const sportsRaw = parts[2].replace(/^"|"$/g, '');
    const sportList = sportsRaw.split(/[;,]/).map(s => s.trim()).filter(Boolean);

    const gender = parts[3].replace(/^"|"$/g, '');
    const imageUrl = convertGDriveUrl(parts[4].replace(/^"|"$/g, ''));
    const achievements = parts[5].replace(/^"|"$/g, '');
    const role = parts[6].replace(/^"|"$/g, '');
    const basePrice = parseInt(parts[7].replace(/^"|"$/g, '')) || 100;

    const combinedAchievements = (role && role !== "Nil") ? `Role: ${role} | ${achievements}` : achievements;

    players.push({
        name: name,
        sport: sportList,
        gender: gender,
        basePrice: basePrice,
        image: imageUrl || null,
        achievements: combinedAchievements,
        status: "Waiting"
    });
}

// Sort: Female first, then Male
players.sort((a, b) => {
    if (a.gender === "Female" && b.gender !== "Female") return -1;
    if (a.gender !== "Female" && b.gender === "Female") return 1;
    return a.name.localeCompare(b.name);
});

console.log(JSON.stringify(players, null, 2));
