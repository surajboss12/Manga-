const CORS_PROXY = "https://proxy.techzbots1.workers.dev/?u=";

function preloadImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = url;
        img.style.display = "none";
        document.body.appendChild(img);
    });
}

async function getCoverUrl(mangaId) {
    try {
        const res = await fetch(CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/cover?limit=1&manga[]=${mangaId}`));
        const data = await res.json();
        const fileName = data?.data?.[0]?.attributes?.fileName;
        if (!fileName) return '';

        const directUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`;
        const proxiedUrl = CORS_PROXY + encodeURIComponent(directUrl);

        // Preload the image
        await preloadImage(proxiedUrl);
        return proxiedUrl;
    } catch (err) {
        console.error(`Error getting cover for ${mangaId}`, err);
        return '';
    }
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
        const url = CORS_PROXY + encodeURIComponent("https://api.mangadex.org/manga?limit=10&availableTranslatedLanguage[]=en&order[followedCount]=desc&order[updatedAt]=desc");
        const res = await fetch(url);
        const data = await res.json();

        if (!data?.data || !Array.isArray(data.data)) {
            console.error("Trending data is missing or invalid", data);
            return;
        }

        const cards = await Promise.all(data.data.map(async (manga) => {
            const title = manga.attributes.title.en || "Untitled";
            const imageUrl = await getCoverUrl(manga.id);
            return createMangaCard(title, imageUrl, manga.id);
        }));

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

        const mangaUrl = CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/manga?limit=15&ids[]=${mangaIds.join("&ids[]=")}`);
        const mangaRes = await fetch(mangaUrl);
        const mangaData = await mangaRes.json();

        if (!mangaData?.data || !Array.isArray(mangaData.data)) {
            console.error("Manga data fetch failed", mangaData);
            return;
        }

        const cards = await Promise.all(mangaData.data.map(async (manga) => {
            const title = manga.attributes.title.en || "Untitled";
            const imageUrl = await getCoverUrl(manga.id);
            return createMangaCard(title, imageUrl, manga.id);
        }));

        document.querySelector('.recento').innerHTML = cards.join('');
    } catch (err) {
        console.error("Error fetching recent manga:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchTrending();
    fetchRecent();
});
