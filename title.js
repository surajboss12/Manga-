const CORS_PROXY = "https://proxy.techzbots1.workers.dev/?u=";
const IMAGE_PROXY = "https://truyen0hay.site/proxy-0hay?url=";

function getIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
}

async function getCoverUrl(mangaId) {
    try {
        const res = await fetch(CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/cover?limit=1&manga[]=${mangaId}`));
        const data = await res.json();
        const fileName = data?.data?.[0]?.attributes?.fileName;
        return fileName
            ? `${IMAGE_PROXY}https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`
            : '';
    } catch (err) {
        console.error(`Error getting cover for ${mangaId}`, err);
        return '';
    }
}

async function fetchMangaDetails() {
    const mangaId = getIdFromUrl();
    if (!mangaId) {
        document.body.innerHTML = "<h2>Manga ID not found in URL</h2>";
        return;
    }

    try {
        const url = CORS_PROXY + encodeURIComponent(`https://api.mangadex.org/manga/${mangaId}?includes[]=author&includes[]=artist&includes[]=cover_art`);
        const res = await fetch(url);
        const data = await res.json();

        if (!data?.data) {
            document.body.innerHTML = "<h2>Invalid Manga ID or data not found</h2>";
            return;
        }

        const manga = data.data;
        const title = manga.attributes.title.en || "Untitled";
        const description = manga.attributes.description.en || "No description available.";
        const status = manga.attributes.status || "Unknown";
        const tags = manga.attributes.tags.map(tag => tag.attributes.name.en).join(", ");
        const author = manga.relationships.find(rel => rel.type === "author")?.attributes?.name || "Unknown";
        const artist = manga.relationships.find(rel => rel.type === "artist")?.attributes?.name || "Unknown";
        const coverImage = await getCoverUrl(mangaId);

        const container = document.querySelector(".manga-detail");
        container.innerHTML = `
            <div class="manga-banner">
                <img src="${coverImage}" alt="${title}" class="cover-img" />
                <div class="info">
                    <h1>${title}</h1>
                    <p><strong>Author:</strong> ${author}</p>
                    <p><strong>Artist:</strong> ${artist}</p>
                    <p><strong>Status:</strong> ${status}</p>
                    <p><strong>Genres:</strong> ${tags}</p>
                </div>
            </div>
            <div class="description">
                <h2>Description</h2>
                <p>${description}</p>
            </div>
        `;
    } catch (err) {
        console.error("Error fetching manga details:", err);
        document.body.innerHTML = "<h2>Error loading manga details</h2>";
    }
}

document.addEventListener("DOMContentLoaded", fetchMangaDetails);
