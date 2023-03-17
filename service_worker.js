const { runtime, storage, tabs, webRequest } = chrome;

runtime.onInstalled.addListener(async function () {
  try {
    await storage.local.clear();
  } catch (error) {
    console.error(error);
  }
});

webRequest.onBeforeRequest.addListener(
  async function (details) {
    try {
      const { tabId, initiator } = details;

      if (initiator === "https://www.youtube.com") {
        const tab = await tabs.get(tabId);

        const tabURL = new URL(tab.url);

        if (tabURL.pathname === "/watch" && tabURL.searchParams.has("v")) {
          await tabs.sendMessage(tabId, { type: "vp" });
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
  {
    urls: ["https://*.googlevideo.com/videoplayback*"],
    types: ["xmlhttprequest"]
  }
);

webRequest.onCompleted.addListener(
  async function (details) {
    try {
      const { url, tabId, responseHeaders, initiator } = details;

      if (initiator === "https://www.youtube.com") {
        const uasURL = new URL(url);

        if (responseHeaders.some((header) => header.name === "etag") && !uasURL.pathname.includes("default-user")) {
          const tab = await tabs.get(tabId);

          const tabURL = new URL(tab.url);

          if (tabURL.pathname === "/watch" && tabURL.searchParams.has("v")) {
            const videoID = tabURL.searchParams.get("v");

            const stringUA = uasURL.pathname.replace(/=s\d+.*/, "");

            const store = await storage.local.get(videoID);

            const list = store[videoID];

            if (Array.isArray(list)) {
              if (!list.includes(stringUA)) {
                await storage.local.set({ [videoID]: [...list, stringUA] });
              }
            } else {
              await storage.local.set({ [videoID]: [stringUA] });
            }

            await tabs.sendMessage(tabId, { type: "ui" });
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
  {
    urls: ["https://yt3.ggpht.com/*"],
    types: ["image"]
  },
  ["responseHeaders"]
);
