const proxy = "https://proxy.techzbots1.workers.dev/?u=";

// Get cover image URL safely
function getCoverUrl(manga) {
    if (!manga.relationships) return '';
    const cover = manga.relationships.find(r => r.type === "cover_art");
    if (!cover || !cover.attributes || !cover.attributes.fileName) return '';
    const fileName = cover.attributes.fileName;
    return `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg`;
}

// Create manga card HTML
function createMangaCard(title, imageUrl) {
    return `
        <div style="display:inline-block; margin:10px; text-align:center;">
            <img src="${imageUrl || 'https://mangadex.org/img/cover-placeholder.png'}" 
                 alt="${title}" 
                 style="width:150px; height:225px; object-fit:cover; border-radius:5px; box-shadow:0 0 10px #0003;">
            <div style="margin-top:5px; color:white; font-size:14px;">${title}</div>
        </div>
    `;
}

// Fetch trending manga
async function fetchTrending() {
    const trendingUrl = `${proxy}https://api.mangadex.org/manga?limit=10&includes[]=cover_art&availableTranslatedLanguage[]=en&order[followedCount]=desc`;
    try {
        const res = await fetch(trendingUrl);
        const data = await res.json();

        if (!data || !data.data) {
            console.error("Trending data is missing or invalid", data);
            return;
        }

        const container = document.getElementById("latest2");
        container.innerHTML = ""; // Clear placeholder

        data.data.forEach(manga => {
            const title = manga.attributes?.title?.en || "No Title";
            const imageUrl = getCoverUrl(manga);
            container.innerHTML += createMangaCard(title, imageUrl);
        });
    } catch (err) {
        console.error("Error fetching trending manga:", err);
    }
}

// Fetch recent releases
async function fetchRecent() {
    const recentChaptersUrl = `${proxy}https://api.mangadex.org/chapter?limit=20&translatedLanguage[]=en&order[publishAt]=desc&includes[]=manga&includes[]=cover_art`;
    try {
        const res = await fetch(recentChaptersUrl);
        const data = await res.json();

        if (!data || !data.data) {
            console.error("Recent chapter data is missing or invalid", data);
            return;
        }

        const container = document.querySelector(".recento");
        container.innerHTML = ""; // Clear placeholder

        const seen = new Set();

        data.data.forEach(chap => {
            const mangaRel = chap.relationships?.find(r => r.type === "manga");
            if (mangaRel && mangaRel.attributes && !seen.has(mangaRel.id)) {
                seen.add(mangaRel.id);
                const title = mangaRel.attributes?.title?.en || "No Title";
                const imageUrl = getCoverUrl(mangaRel);
                container.innerHTML += createMangaCard(title, imageUrl);
            }
        });
    } catch (err) {
        console.error("Error fetching recent manga:", err);
    }
}

// On page load
document.addEventListener("DOMContentLoaded", () => {
    fetchTrending();
    fetchRecent();
});
