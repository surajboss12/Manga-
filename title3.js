const CORS_PROXY = "https://proxy.techzbots1.workers.dev/?u=";

function getMangaIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

const mangaId = getMangaIdFromUrl();

async function getCoverUrl(mangaId) {
    try {
        const res = await fetch(CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/cover?limit=1&manga[]=${mangaId}`));
        const data = await res.json();
        const fileName = data?.data?.[0]?.attributes?.fileName;
        return fileName
            ? `https://truyen0hay.site/proxy-0hay?url=${encodeURIComponent(`https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`)}`
            : "";
    } catch (err) {
        console.error("Error fetching cover image:", err);
        return "";
    }
}

async function fetchMangaDetails() {
    try {
        const res = await fetch(
            CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/manga/${mangaId}?includes[]=author&includes[]=artist&includes[]=cover_art`)
        );
        const data = await res.json();
        const manga = data.data;

        document.getElementById("manga-title").textContent = manga.attributes.title.en || "Untitled";

        const author = manga.relationships.find((rel) => rel.type === "author");
        const artist = manga.relationships.find((rel) => rel.type === "artist");

        document.getElementById("manga-author").textContent = author?.attributes?.name || "Unknown";
        document.getElementById("manga-artist").textContent = artist?.attributes?.name || "Unknown";
        document.getElementById("manga-status").textContent = manga.attributes.status || "Unknown";

        document.getElementById("manga-description").textContent =
            manga.attributes.description.en || "No description available.";

        const tagsContainer = document.getElementById("manga-tags");
        tagsContainer.innerHTML = manga.attributes.tags
            .map((tag) => `<span class="tag">${tag.attributes.name.en}</span>`)
            .join("");

        const coverUrl = await getCoverUrl(mangaId);
        const header = document.querySelector(".manga-header");
        const img = document.createElement("img");
        img.src = coverUrl;
        img.alt = manga.attributes.title.en || "Cover";
        img.classList.add("manga-cover");
        header.insertBefore(img, header.firstChild);
    } catch (err) {
        console.error("Error fetching manga details:", err);
    }
}

async function fetchChapters() {
    try {
        const res = await fetch(
            CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/chapter?limit=20&translatedLanguage[]=en&order[chapter]=desc&manga=${mangaId}`)
        );
        const data = await res.json();

        const chapterList = document.getElementById("chapter-list");
        chapterList.innerHTML = "";

        data.data.forEach((chapter) => {
            const title = chapter.attributes.title || `Chapter ${chapter.attributes.chapter || "?"}`;
            const li = document.createElement("li");
            li.textContent = title;
            chapterList.appendChild(li);
        });
    } catch (err) {
        console.error("Error fetching chapters:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchMangaDetails();
    fetchChapters();
});
