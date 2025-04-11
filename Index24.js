const CORS_PROXY = "https://proxy.techzbots1.workers.dev/?u=";

async function getCoverUrl(mangaId) {
    try {
        const res = await fetch(CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/cover?limit=1&manga[]=${mangaId}`));
        const data = await res.json();
        const fileName = data?.data?.[0]?.attributes?.fileName;
        return fileName ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg` : '';
    } catch (err) {
        console.error(`Error getting cover for ${mangaId}`, err);
        return '';
    }
}

function preloadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => resolve(''); // return empty if failed
        img.src = src;
    });
}

async function createMangaCard(title, imageUrl, mangaId) {
    const loadedUrl = await preloadImage(imageUrl);
    return `
        <div class="manga-card">
            <a href="https://mangadex.org/title/${mangaId}" target="_blank">
                <img src="${loadedUrl}" alt="${title}" />
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

        if (!Array.isArray(data?.data)) {
            console.error("Invalid trending data", data);
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

        const mangaIds = [...new Set(
            chapterData.data.map(ch => ch.relationships.find(r => r.type === "manga")?.id).filter(Boolean)
        )];

        if (!mangaIds.length) return;

        const mangaUrl = CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/manga?limit=15&ids[]=${mangaIds.join("&ids[]=")}`);
        const mangaRes = await fetch(mangaUrl);
        const mangaData = await mangaRes.json();

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
