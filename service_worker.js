const { storage, tabs, webRequest } = chrome;

// runtime.onInstalled.addListener(async function () {
//   try {
//     await storage.local.clear();
//   } catch (error) {
//     console.error(error);
//   }
// });

webRequest.onCompleted.addListener(
  async function (details) {
    try {
      const { url, tabId, responseHeaders, initiator } = details;
      // console.log({ url, tabId, responseHeaders, initiator });

      if (initiator !== "https://www.youtube.com") return;

      const uasURL = new URL(url);

      if (
        uasURL.pathname.includes("default-user") ||
        responseHeaders.every((header) => header.name !== "etag")
      )
        return;

      const tab = await tabs.get(tabId);

      const tabURL = new URL(tab.url);

      if (tabURL.pathname !== "/watch" || !tabURL.searchParams.has("v")) return;

      const videoID = tabURL.searchParams.get("v");

      const stringUA = uasURL.pathname.replace(/=[a-z]\d+.*/, "");

      const store = await storage.local.get(videoID);
      // console.log("store", store);

      const list = store[videoID];
      // console.log("list", list);

      if (!Array.isArray(list)) await storage.local.set({ [videoID]: [stringUA] });
      else if (!list.includes(stringUA))
        await storage.local.set({ [videoID]: [...list, stringUA] });
    } catch (error) {
      console.error(error);
    }
  },
  {
    urls: ["https://yt3.ggpht.com/*"],
    types: ["image"],
  },
  ["responseHeaders"]
);
