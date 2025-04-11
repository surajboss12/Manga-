// Get cover image from Manga ID
async function getCoverUrl(mangaId) {
    const res = await fetch(`https://api.mangadex.org/cover?limit=1&manga[]=${mangaId}`);
    const data = await res.json();
    const fileName = data.data[0]?.attributes?.fileName;
    return fileName ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg` : '';
}

// Create manga card
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

// Trending Now: manga sorted by followed count and recent update
async function fetchTrending() {
    const res = await fetch(`https://api.mangadex.org/manga?limit=10&availableTranslatedLanguage[]=en&order[relevance]=desc&order[followedCount]=desc&order[updatedAt]=desc`);
    const data = await res.json();

    const cards = await Promise.all(data.data.map(async (manga) => {
        const title = manga.attributes.title.en || "Untitled";
        const imageUrl = await getCoverUrl(manga.id);
        return createMangaCard(title, imageUrl, manga.id);
    }));

    document.querySelector('.popularg').innerHTML = cards.join('');
}

// Recent Releases: get recent chapters, then fetch related manga
async function fetchRecent() {
    const chapterRes = await fetch(`https://api.mangadex.org/chapter?limit=15&translatedLanguage[]=en&order[publishAt]=desc`);
    const chapterData = await chapterRes.json();

    const mangaIds = [...new Set(
        chapterData.data.map(ch => ch.relationships.find(r => r.type === "manga")?.id).filter(Boolean)
    )];

    const mangaRes = await fetch(`https://api.mangadex.org/manga?limit=15&ids[]=${mangaIds.join("&ids[]=")}`);
    const mangaData = await mangaRes.json();

    const cards = await Promise.all(mangaData.data.map(async (manga) => {
        const title = manga.attributes.title.en || "Untitled";
        const imageUrl = await getCoverUrl(manga.id);
        return createMangaCard(title, imageUrl, manga.id);
    }));

    document.querySelector('.recento').innerHTML = cards.join('');
}

// Init on page load
document.addEventListener("DOMContentLoaded", () => {
    fetchTrending();
    fetchRecent();
});
