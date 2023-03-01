const { runtime, storage, webRequest } = chrome;

runtime.onInstalled.addListener(async function (details) {
  await storage.local.clear();

  webRequest.onCompleted.addListener(
    async function completeRequestHandler(details) {
      const { url, responseHeaders } = details;

      const urlcomp = new URL(url);

      if (responseHeaders.some((header) => header.name === "etag")) {
        const pathkey = urlcomp.pathname.replace(/=s\d+.*/, "");

        await storage.local.set({ [pathkey]: true });

        console.log(urlcomp.origin + pathkey);
      }
    },
    {
      urls: ["https://yt3.ggpht.com/*"],
      types: ["image"]
    },
    ["responseHeaders"]
  );
});
