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

function createMangaCard(title, imageUrl, mangaId) {
    const card = document.createElement("div");
    card.className = "manga-card";
    card.innerHTML = `
        <a href="https://mangadex.org/title/${mangaId}" target="_blank">
            <img src="${imageUrl}" alt="${title}" loading="lazy" />
            <p>${title}</p>
        </a>
    `;
    return card;
}

async function fetchTrending() {
    try {
        const container = document.querySelector('.popularg');
        container.innerHTML = 'Loading...';
        const url = CORS_PROXY + encodeURIComponent("https://api.mangadex.org/manga?limit=10&availableTranslatedLanguage[]=en&order[followedCount]=desc&order[updatedAt]=desc");
        const res = await fetch(url);
        const data = await res.json();

        if (!Array.isArray(data?.data)) {
            container.innerHTML = 'Failed to load data.';
            console.error("Trending data invalid:", data);
            return;
        }

        container.innerHTML = ''; // Clear loading
        for (const manga of data.data) {
            const title = manga.attributes.title?.en || Object.values(manga.attributes.title)[0] || "Untitled";
            const imageUrl = await getCoverUrl(manga.id);
            const card = createMangaCard(title, imageUrl, manga.id);
            container.appendChild(card);
        }
    } catch (err) {
        console.error("Error fetching trending manga:", err);
    }
}

async function fetchRecent() {
    try {
        const container = document.querySelector('.recento');
        container.innerHTML = 'Loading...';

        const chapterUrl = CORS_PROXY + encodeURIComponent("https://api.mangadex.org/chapter?limit=15&translatedLanguage[]=en&order[publishAt]=desc");
        const chapterRes = await fetch(chapterUrl);
        const chapterData = await chapterRes.json();

        const mangaIds = [...new Set(
            chapterData?.data
                ?.map(ch => ch.relationships.find(r => r.type === "manga")?.id)
                .filter(Boolean)
        )];

        if (!mangaIds.length) {
            container.innerHTML = 'No manga found.';
            return;
        }

        const mangaQuery = `https://api.mangadex.org/manga?limit=15&ids[]=${mangaIds.join("&ids[]=")}`;
        const mangaUrl = CORS_PROXY + encodeURIComponent(mangaQuery);
        const mangaRes = await fetch(mangaUrl);
        const mangaData = await mangaRes.json();

        if (!Array.isArray(mangaData?.data)) {
            container.innerHTML = 'Failed to load manga.';
            console.error("Manga data fetch failed", mangaData);
            return;
        }

        container.innerHTML = ''; // Clear loading
        for (const manga of mangaData.data) {
            const title = manga.attributes.title?.en || Object.values(manga.attributes.title)[0] || "Untitled";
            const imageUrl = await getCoverUrl(manga.id);
            const card = createMangaCard(title, imageUrl, manga.id);
            container.appendChild(card);
        }
    } catch (err) {
        console.error("Error fetching recent manga:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchTrending();
    fetchRecent();
});
