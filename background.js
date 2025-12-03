// The music services that api.song.link supports
const musicServiceLinks = {
  amazonMusic: "*://music.amazon.com/*",
  amazonStore: "*://amazon.com/*",
  audiomack: "*://audiomack.com/*",
  anghami: "*://play.anghami.com/*",
  boomplay: "*://*boomplay.com/*",
  deezer: "*://*deezer.com/*",
  appleMusic: "*://geo.music.apple.com/*",
  itunes: "*://geo.music.apple.com/*",
  napster: "*://play.napster.com/*",
  pandora: "*://*pandora.com/*",
  soundcloud: "*://soundcloud.com/*",
  tidal: "*://listen.tidal.com/*",
  yandex: "*://music.yandex.ru/*",
  youtube: "*://*youtube.com/watch*",
  youtubeMusic: "*://music.youtube.com/watch*",
  spotify: "*://open.spotify.com/*"
};

let currentListener = null;

async function getTrackInfo(url, service) {
  // This StackOverflow answer was helpful in finding this API: https://stackoverflow.com/a/69330595
  const response = await fetch(`https://api.song.link/v1-alpha.1/links?url=${url}`);
  if (!response.ok) throw new Error("getTrackInfo failed");

  const data = await response.json();
  return data.linksByPlatform[service].url;
}

function shouldRedirect(url, service) {
  // Simple heuristics per platform
  switch (service) {
    case "youtubeMusic":
    case "youtube":
      return url.includes("youtube.com/watch?");

    case "spotify":
    case "napster":
    case "yandex":
    case "tidal":
      return url.includes("/album/") || url.includes("/track/");

    case "appleMusic":
    case "itunes":
    case "amazonMusic":
      return url.includes("/album/");
  }


  // Default: try only if it's not obviously an API or static file
  return !url.includes("/api/") && !url.match(/\.(js|css|json|jpg|png|svg|woff2?)($|\?)/);
}

async function init() {
  const settings = await browser.storage.local.get({
    musicService: "spotify"
  });

  // Remove the old listener
  if (currentListener) {
    browser.webRequest.onBeforeRequest.removeListener(currentListener);
  }

  currentListener = async function (details) {
    if (!shouldRedirect(details.url)) {
      // Ignore API calls, JS, stats pings, etc.
      return;
    }

    try {
      const redirectUrl = await getTrackInfo(details.url, settings.musicService);
      return { redirectUrl };
    } catch (err) {
      console.error("Redirect failed:", err);
    }
  };


  const filters = Object.entries(musicServiceLinks)
    .filter(([key]) => key !== settings.musicService)
    .map(([, url]) => url);

  if (!filters) {
    console.error("Unknown service:", settings.musicService);
    return;
  }

  browser.webRequest.onBeforeRequest.addListener(
    currentListener,
    { urls: filters },
    ["blocking"]
  );

  console.log("Listener registered for:", filters);
}

init();

// Reload when settings change
browser.storage.onChanged.addListener((changes, area) => {
  console.log(area)
  if (area === "local" && changes.musicService) {
    init();
  }
});
