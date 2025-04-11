// Helper to get MangaDex covers
async function getCover(mangaId) {
    const res = await fetch(`https://api.mangadex.org/cover?limit=1&manga[]=${mangaId}&order[volume]=desc`);
    const data = await res.json();
    const fileName = data.data[0]?.attributes?.fileName;
    return fileName ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg` : '';
}

// Function to render manga cards
function createCard(manga, imageUrl) {
    const title = manga.attributes.title.en || "No Title";
    const id = manga.id;
    return `
        <div class="manga-card">
            <a href="https://mangadex.org/title/${id}" target="_blank">
                <img src="${imageUrl}" alt="${title}" />
                <p>${title}</p>
            </a>
        </div>
    `;
}

// Fetch Most Popular Manga (by follows)
async function fetchPopular() {
    const res = await fetch('https://api.mangadex.org/manga?limit=10&order[followedCount]=desc&availableTranslatedLanguage[]=en&hasAvailableChapters=true');
    const data = await res.json();

    const html = await Promise.all(data.data.map(async manga => {
        const img = await getCover(manga.id);
        return createCard(manga, img);
    }));

    document.querySelector('.popularg').innerHTML = html.join('');
}

// Fetch Recent Releases
async function fetchRecent() {
    const res = await fetch('https://api.mangadex.org/chapter?limit=20&translatedLanguage[]=en&order[publishAt]=desc');
    const chapters = await res.json();

    const mangaIds = [...new Set(chapters.data.map(ch => ch.relationships.find(r => r.type === "manga")?.id))];
    const mangaRes = await fetch(`https://api.mangadex.org/manga?limit=20&ids[]=${mangaIds.join('&ids[]=')}`);
    const mangas = await mangaRes.json();

    const html = await Promise.all(mangas.data.map(async manga => {
        const img = await getCover(manga.id);
        return createCard(manga, img);
    }));

    document.querySelector('.recento').innerHTML = html.join('');
}

// Call functions on page load
window.addEventListener('DOMContentLoaded', () => {
    fetchPopular();
    fetchRecent();
});
