const { runtime, storage, tabs, webRequest } = chrome;

runtime.onInstalled.addListener(async function () {
  await storage.local.clear();

  webRequest.onBeforeRequest.addListener(
    async function (details) {
      const { tabId, documentId, frameId } = details;

      try {
        await tabs.sendMessage(tabId, { type: "vp" }, { documentId, frameId });
      } catch (error) {
        console.log("tabs.sendMessage(vp)", error);
      } finally {
        console.log("vp request onBeforeRequest");
      }
    },
    {
      urls: ["https://*.googlevideo.com/videoplayback*"],
      types: ["xmlhttprequest"]
    }
  );

  webRequest.onCompleted.addListener(
    async function (details) {
      const { url, tabId, responseHeaders, documentId, frameId } = details;

      const urlcomp = new URL(url);

      if (responseHeaders.some((header) => header.name === "etag")) {
        const pathkey = urlcomp.pathname.replace(/=s\d+.*/, "");

        await storage.local.set({ [pathkey]: true });
      }

      try {
        await tabs.sendMessage(tabId, { type: "ui" }, { documentId, frameId });
      } catch (error) {
        console.log("tabs.sendMessage(ui)", error);
      } finally {
        console.log("ui request onCompleted");
      }
    },
    {
      urls: ["https://yt3.ggpht.com/*"],
      types: ["image"]
    },
    ["responseHeaders"]
  );
});
