const CORS_PROXY = "https://proxy.techzbots1.workers.dev/?u=";

// Helper to get query parameter
function getMangaIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// Get and display manga details
async function fetchMangaDetails(mangaId) {
    try {
        const res = await fetch(CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/manga/${mangaId}?includes[]=author&includes[]=artist&includes[]=tag`));
        const data = await res.json();
        const manga = data.data;

        const title = manga.attributes.title.en || "Untitled";
        const status = manga.attributes.status || "Unknown";
        const tags = manga.attributes.tags.map(t => t.attributes.name.en).join(', ');

        const author = manga.relationships.find(r => r.type === "author")?.attributes?.name || "Unknown";
        const artist = manga.relationships.find(r => r.type === "artist")?.attributes?.name || "Unknown";

        document.getElementById("manga-title").textContent = title;
        document.getElementById("manga-author").textContent = author;
        document.getElementById("manga-artist").textContent = artist;
        document.getElementById("manga-status").textContent = status;
        document.getElementById("manga-tags").textContent = tags;

        fetchChapters(mangaId);
    } catch (err) {
        console.error("Error fetching manga details:", err);
    }
}

// Get and display chapter list
async function fetchChapters(mangaId) {
    try {
        const chapterUrl = CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/chapter?limit=50&manga=${mangaId}&translatedLanguage[]=en&order[chapter]=desc`);
        const res = await fetch(chapterUrl);
        const data = await res.json();

        const chapterList = document.getElementById("chapter-list");
        if (!data.data.length) {
            chapterList.innerHTML = "<li>No chapters found.</li>";
            return;
        }

        chapterList.innerHTML = ""; // clear loading text
        data.data.forEach(ch => {
            const chNum = ch.attributes.chapter || "Oneshot";
            const title = ch.attributes.title || "";
            const chapterId = ch.id;
            const li = document.createElement("li");
            li.innerHTML = `<a href="https://mangadex.org/chapter/${chapterId}" target="_blank">Chapter ${chNum} - ${title}</a>`;
            chapterList.appendChild(li);
        });
    } catch (err) {
        console.error("Error fetching chapters:", err);
        document.getElementById("chapter-list").innerHTML = "<li>Error loading chapters.</li>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const mangaId = getMangaIdFromUrl();
    if (mangaId) {
        fetchMangaDetails(mangaId);
    } else {
        console.error("No manga ID found in URL.");
    }
});
