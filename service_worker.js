const { runtime, storage, tabs, webRequest } = chrome;

runtime.onInstalled.addListener(async function () {
  try {
    await storage.local.clear();
  } catch (error) {
    console.log("storage.local.clear", error);
  }
});

webRequest.onBeforeRequest.addListener(
  async function (details) {
    const { tabId } = details;

    try {
      await tabs.sendMessage(tabId, { type: "vp" });
    } catch (error) {
      console.log("tabs.sendMessage(vp)", error);
    }
  },
  {
    urls: ["https://*.googlevideo.com/videoplayback*"],
    types: ["xmlhttprequest"]
  }
);

webRequest.onCompleted.addListener(
  async function (details) {
    const { url, tabId, responseHeaders } = details;

    const urlcomp = new URL(url);

    if (responseHeaders.some((header) => header.name === "etag") && !urlcomp.pathname.includes("default-user")) {
      const pathkey = urlcomp.pathname.replace(/=s\d+.*/, "");

      await storage.local.set({ [pathkey]: true });
    }

    try {
      await tabs.sendMessage(tabId, { type: "ui" });
    } catch (error) {
      console.log("tabs.sendMessage(ui)", error);
    }
  },
  {
    urls: ["https://yt3.ggpht.com/*"],
    types: ["image"]
  },
  ["responseHeaders"]
);
