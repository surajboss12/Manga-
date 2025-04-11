const proxy = "https://proxy.techzbots1.workers.dev/?u=";

function getCoverUrl(mangaId, relationships) {
    const coverRel = relationships.find(rel => rel.type === "cover_art");
    if (!coverRel || !coverRel.attributes || !coverRel.attributes.fileName) return '';
    return `https://uploads.mangadex.org/covers/${mangaId}/${coverRel.attributes.fileName}.256.jpg`;
}

function createMangaCard(title, imageUrl) {
    return `
        <div style="display:inline-block;margin:10px;text-align:center;">
            <img src="${imageUrl || 'https://mangadex.org/img/cover-placeholder.png'}" 
                 alt="${title}" 
                 style="width:150px;height:225px;object-fit:cover;border-radius:8px;box-shadow:0 0 8px #0006;">
            <div style="margin-top:6px;color:white;font-size:14px;font-weight:bold;">${title}</div>
        </div>`;
}

// Load Most Popular Manga
async function fetchTrending() {
    const url = `${proxy}https://api.mangadex.org/manga?limit=10&availableTranslatedLanguage[]=en&order[followedCount]=desc&includes[]=cover_art`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        const list = document.getElementById("latest2");
        list.innerHTML = '';

        json.data.forEach(manga => {
            const title = manga.attributes?.title?.en || "No Title";
            const image = getCoverUrl(manga.id, manga.relationships || []);
            list.innerHTML += createMangaCard(title, image);
        });
    } catch (err) {
        console.error("Error fetching trending manga:", err);
    }
}

// Load Recent Releases
async function fetchRecent() {
    const url = `${proxy}https://api.mangadex.org/chapter?limit=20&translatedLanguage[]=en&order[publishAt]=desc&includes[]=manga&includes[]=cover_art`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        const list = document.querySelector(".recento");
        list.innerHTML = '';

        const mangaMap = new Map();

        json.data.forEach(chap => {
            const mangaRel = chap.relationships?.find(r => r.type === "manga");
            if (!mangaRel || mangaMap.has(mangaRel.id)) return;

            const title = mangaRel.attributes?.title?.en || "No Title";
            const image = getCoverUrl(mangaRel.id, mangaRel.relationships || []);
            mangaMap.set(mangaRel.id, createMangaCard(title, image));
        });

        mangaMap.forEach(card => {
            list.innerHTML += card;
        });
    } catch (err) {
        console.error("Error fetching recent manga:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchTrending();
    fetchRecent();
});
