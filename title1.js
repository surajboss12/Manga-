const CORS_PROXY = "https://proxy.techzbots1.workers.dev/?u=";
const IMAGE_PROXY = "https://truyen0hay.site/proxy-0hay?url=";

function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function getCoverUrl(mangaId) {
    try {
        const res = await fetch(CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/cover?limit=1&manga[]=${mangaId}`));
        const data = await res.json();
        const fileName = data?.data?.[0]?.attributes?.fileName;
        return fileName ? `${IMAGE_PROXY}https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg` : '';
    } catch (err) {
        console.error(`Error getting cover for ${mangaId}`, err);
        return '';
    }
}

async function fetchMangaDetails() {
    const mangaId = getIdFromUrl();
    if (!mangaId) return;

    try {
        const url = CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/manga/${mangaId}?includes[]=author&includes[]=artist&includes[]=cover_art`);
        const res = await fetch(url);
        const data = await res.json();

        const manga = data.data;
        const attributes = manga.attributes;
        const title = attributes.title.en || "Untitled";
        const description = attributes.description.en || "No description available.";
        const status = attributes.status || "Unknown";
        const tags = attributes.tags.map(tag => tag.attributes.name.en).join(", ");
        const author = manga.relationships.find(r => r.type === "author")?.attributes?.name || "Unknown";
        const artist = manga.relationships.find(r => r.type === "artist")?.attributes?.name || "Unknown";
        const coverImage = await getCoverUrl(mangaId);

        document.getElementById("title").textContent = title;
        document.getElementById("cover").src = coverImage;
        document.getElementById("description").innerHTML = description;
        document.getElementById("author").textContent = author;
        document.getElementById("artist").textContent = artist;
        document.getElementById("status").textContent = status;
        document.getElementById("genres").textContent = tags;

        fetchChapters(mangaId);
    } catch (err) {
        console.error("Error fetching manga details:", err);
    }
}

async function fetchChapters(mangaId) {
    try {
        const url = CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/chapter?limit=50&manga=${mangaId}&translatedLanguage[]=en&order[chapter]=desc`);
        const res = await fetch(url);
        const data = await res.json();

        const chapters = data?.data || [];
        const chapterList = document.getElementById("chapter-list");
        chapterList.innerHTML = "";

        if (chapters.length === 0) {
            chapterList.innerHTML = "<li>No chapters available</li>";
            return;
        }

        chapters.forEach(ch => {
            const chapterTitle = ch.attributes.title || `Chapter ${ch.attributes.chapter || "?"}`;
            const chapterNum = ch.attributes.chapter || "?";
            const chapterId = ch.id;

            const listItem = document.createElement("li");
            listItem.innerHTML = `<a href="https://mangadex.org/chapter/${chapterId}" target="_blank">${chapterTitle} (Ch. ${chapterNum})</a>`;
            chapterList.appendChild(listItem);
        });
    } catch (err) {
        console.error("Error fetching chapters:", err);
        document.getElementById("chapter-list").innerHTML = "<li>Error loading chapters</li>";
    }
}

document.addEventListener("DOMContentLoaded", fetchMangaDetails);
