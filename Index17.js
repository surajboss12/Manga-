const CORS_PROXY = "https://proxy.techzbots1.workers.dev/?u=";

function getCoverImageUrl(manga) {
    const coverArt = manga.relationships.find(rel => rel.type === "cover_art");
    const fileName = coverArt?.attributes?.fileName;
    return fileName
        ? `${CORS_PROXY}${encodeURIComponent(`https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg`)}`
        : "";
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

        if (!data?.data) {
            console.error("Invalid response from MangaDex:", data);
            return;
        }

        const cards = data.data.map((manga) => {
            const title = manga.attributes.title.en || "Untitled";
            const imageUrl = getCoverImageUrl(manga);
            return createMangaCard(title, imageUrl, manga.id);
        });

        document.querySelector('.popularg').innerHTML = cards.join('');
    } catch (err) {
        console.error("Error fetching trending manga:", err);
    }
}

async function fetchRecent() {
    try {
        const chapterUrl = CORS_PROXY + encodeURIComponent("https://api.mangadex.org/chapter?limit=15&translatedLanguage[]=en&order[publishAt]=desc");
        const chapterRes = await fetch(chapterUrl);
        const chapterData = await chapterRes.json();

        const mangaIds = [
            ...new Set(
                chapterData.data
                    .map(ch => ch.relationships.find(rel => rel.type === "manga")?.id)
                    .filter(Boolean)
            )
        ];

        if (!mangaIds.length) return;

        const mangaUrl = CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/manga?includes[]=cover_art&ids[]=${mangaIds.join("&ids[]=")}`);
        const mangaRes = await fetch(mangaUrl);
        const mangaData = await mangaRes.json();

        const cards = mangaData.data.map((manga) => {
            const title = manga.attributes.title.en || "Untitled";
            const imageUrl = getCoverImageUrl(manga);
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
