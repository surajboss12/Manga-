const CORS_PROXY = "https://proxy.techzbots1.workers.dev/?u=";

function getCoverFromRelationships(manga) {
    const coverRel = manga.relationships.find(rel => rel.type === "cover_art");
    const fileName = coverRel?.attributes?.fileName;
    if (!fileName) return '';
    
    // Load image through proxy to avoid Mangadex hotlinking block
    const originalUrl = `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg`;
    return `${CORS_PROXY}${encodeURIComponent(originalUrl)}`;
}

function createMangaCard(title, imageUrl, mangaId) {
    return `
        <div class="manga-card">
            <a href="https://mangadex.org/title/${mangaId}" target="_blank">
                <img src="${imageUrl}" alt="${title}" />
                <p>${title}</p>
            </a>
        </div>
    `;
}

async function fetchTrending() {
    try {
        const url = CORS_PROXY + encodeURIComponent("https://api.mangadex.org/manga?limit=10&availableTranslatedLanguage[]=en&includes[]=cover_art&order[followedCount]=desc&order[updatedAt]=desc");
        const res = await fetch(url);
        const data = await res.json();

        if (!data?.data || !Array.isArray(data.data)) {
            console.error("Trending data is missing or invalid", data);
            return;
        }

        const cards = data.data.map((manga) => {
            const title = manga.attributes.title.en || "Untitled";
            const imageUrl = getCoverFromRelationships(manga);
            return createMangaCard(title, imageUrl, manga.id);
        });

        document.querySelector('.popularg').innerHTML = cards.join('');
    } catch (err) {
        console.error("Error fetching trending manga:", err);
    }
}

async function fetchRecent() {
    try {
        const url = CORS_PROXY + encodeURIComponent("https://api.mangadex.org/chapter?limit=15&translatedLanguage[]=en&order[publishAt]=desc");
        const chapterRes = await fetch(url);
        const chapterData = await chapterRes.json();

        if (!chapterData?.data || !Array.isArray(chapterData.data)) {
            console.error("Recent chapter data is missing or invalid", chapterData);
            return;
        }

        const mangaIds = [...new Set(
            chapterData.data.map(ch => ch.relationships.find(r => r.type === "manga")?.id).filter(Boolean)
        )];

        if (!mangaIds.length) {
            console.error("No manga IDs found from recent chapters");
            return;
        }

        const mangaUrl = CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/manga?limit=15&includes[]=cover_art&ids[]=${mangaIds.join("&ids[]=")}`);
        const mangaRes = await fetch(mangaUrl);
        const mangaData = await mangaRes.json();

        if (!mangaData?.data || !Array.isArray(mangaData.data)) {
            console.error("Manga data fetch failed", mangaData);
            return;
        }

        const cards = mangaData.data.map((manga) => {
            const title = manga.attributes.title.en || "Untitled";
            const imageUrl = getCoverFromRelationships(manga);
            return createMangaCard(title, imageUrl, manga.id);
        });

        document.querySelector('.recento').innerHTML = cards.join('');
    } catch (err) {
        console.error("Error fetching recent manga:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchTrending();
    fetchRecent();
});
