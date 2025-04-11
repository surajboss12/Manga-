const proxy = "https://proxy.techzbots1.workers.dev/?u=";

function getCoverUrl(mangaId, relationships) {
    const cover = relationships?.find(r => r.type === 'cover_art');
    if (!cover?.attributes?.fileName) return 'https://mangadex.org/img/cover-placeholder.png';
    return `https://uploads.mangadex.org/covers/${mangaId}/${cover.attributes.fileName}.256.jpg`;
}

function createMangaCard(title, imgUrl) {
    return `
        <div style="display:inline-block;margin:10px;text-align:center;">
            <img src="${imgUrl}" alt="${title}" style="width:150px;height:225px;object-fit:cover;border-radius:8px;box-shadow:0 0 8px #0006;">
            <div style="margin-top:6px;color:white;font-size:14px;font-weight:bold;">${title}</div>
        </div>`;
}

// Fetch Most Popular Manga
async function fetchTrending() {
    const url = `${proxy}https://api.mangadex.org/manga?limit=10&availableTranslatedLanguage[]=en&order[followedCount]=desc&includes[]=cover_art`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        const container = document.getElementById("most-popular");
        container.innerHTML = "";

        json.data.forEach(manga => {
            const title = manga.attributes.title.en || "No Title";
            const coverUrl = getCoverUrl(manga.id, manga.relationships);
            container.innerHTML += createMangaCard(title, coverUrl);
        });
    } catch (err) {
        console.error("Error fetching trending manga:", err);
    }
}

// Fetch Recent Releases
async function fetchRecent() {
    const url = `${proxy}https://api.mangadex.org/chapter?limit=20&translatedLanguage[]=en&order[publishAt]=desc&includes[]=manga&includes[]=cover_art`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        const container = document.getElementById("recent-release");
        container.innerHTML = "";

        const added = new Set();

        json.data.forEach(chap => {
            const manga = chap.relationships.find(r => r.type === "manga");
            if (!manga || added.has(manga.id)) return;

            const title = manga.attributes?.title?.en || "No Title";
            const coverUrl = getCoverUrl(manga.id, manga.relationships);
            container.innerHTML += createMangaCard(title, coverUrl);
            added.add(manga.id);
        });
    } catch (err) {
        console.error("Error fetching recent manga:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchTrending();
    fetchRecent();
});
