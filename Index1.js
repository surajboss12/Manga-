// index.js

// Fetch cover image for a manga by ID
async function getCoverUrl(mangaId) {
    try {
        const res = await fetch(`https://api.mangadex.org/cover?limit=1&manga[]=${mangaId}`);
        const data = await res.json();
        const fileName = data.data[0]?.attributes?.fileName;
        return fileName ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg` : '';
    } catch (err) {
        console.error('Cover fetch error:', err);
        return '';
    }
}

// Create manga card HTML
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

// Fetch and display Most Popular manga
async function fetchPopular() {
    try {
        const res = await fetch("https://api.mangadex.org/manga?limit=10&availableTranslatedLanguage[]=en&order[followedCount]=desc");
        const data = await res.json();

        const cards = await Promise.all(data.data.map(async (manga) => {
            const title = manga.attributes.title.en || "Untitled";
            const imageUrl = await getCoverUrl(manga.id);
            return createMangaCard(title, imageUrl, manga.id);
        }));

        document.querySelector('.popularg').innerHTML = cards.join('');
    } catch (err) {
        console.error('Popular manga fetch error:', err);
    }
}

// Fetch and display Recent Releases
async function fetchRecent() {
    try {
        const res = await fetch("https://api.mangadex.org/chapter?limit=15&translatedLanguage[]=en&order[publishAt]=desc");
        const chapterData = await res.json();

        // Get unique manga IDs from chapters
        const mangaIds = [...new Set(chapterData.data.map(ch => {
            const rel = ch.relationships.find(r => r.type === "manga");
            return rel?.id;
        }).filter(Boolean))];

        const mangaRes = await fetch(`https://api.mangadex.org/manga?limit=15&ids[]=${mangaIds.join("&ids[]=")}`);
        const mangaData = await mangaRes.json();

        const cards = await Promise.all(mangaData.data.map(async (manga) => {
            const title = manga.attributes.title.en || "Untitled";
            const imageUrl = await getCoverUrl(manga.id);
            return createMangaCard(title, imageUrl, manga.id);
        }));

        document.querySelector('.recento').innerHTML = cards.join('');
    } catch (err) {
        console.error('Recent release fetch error:', err);
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
    fetchPopular();
    fetchRecent();
});
