
// The music services that api.song.link supports
const musicServiceLinks = {
    "amazonMusic": "*://music.amazon.com/",
    "amazonStore": "*://amazon.com/",
    "audiomack": "*://audiomack.com/",
    "anghami": "*://play.anghami.com/",
    "boomplay": "*://www.boomplay.com/",
    "deezer": "*://www.deezer.com/",
    "appleMusic": "*://geo.music.apple.com/",
    "itunes": "*://geo.music.apple.com/",
    "napster": "*://play.napster.com/",
    "pandora": "*://www.pandora.com/",
    "soundcloud": "*://soundcloud.com/",
    "tidal": "*://listen.tidal.com/",
    "yandex": "*://music.yandex.ru/",
    "youtube": "*://www.youtube.com/",
    "youtubeMusic": "*://music.youtube.com/",
    "spotify": "*://open.spotify.com/"
}

const settings = await getSettings();

async function getTrackInfo(url) {
    settings = await getSettings();

    // This SO answer was helpful in finding this API: https://stackoverflow.com/a/69330595
    const response = await fetch(`https://api.song.link/v1-alpha.1/links?url=${url}`);

    if (!response.ok) throw new Error("getTrackInfo failed");

    const data = await response.json();
    return data.linksByPlatform[settings.musicService].url;
}

async function getSettings() {
    return await browser.storage.local.get({
        musicService: "spotify"
    });
}

browser.webRequest.onBeforeRequest.addListener(
    async (details) => {
        try {
            const redirectUrl = getTrackInfo(details.url)
            return { redirectUrl: redirectUrl };
        } catch (e) {
            console.error("Failed to get track info", e);
        }
    },
    { urls: [ musicServiceLinks[settings.musicService] ] },
    ["blocking"]
);
