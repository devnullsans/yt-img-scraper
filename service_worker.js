const { runtime, storage, tabs, webRequest } = chrome;

function completeRequestHandler(details) {
  tabs.sendMessage(details.tabId, true);
}

function messageHandler(request, sender, sendResponse) {
  console.log(request, sender);
  if (request.type === "toggle" && sender.url.includes("popup.html")) {
    storage.local.get("enabled", ({ enabled }) => {
      if (enabled) {
        webRequest.onCompleted.removeListener(completeRequestHandler);
      } else {
        webRequest.onCompleted.addListener(completeRequestHandler, {
          urls: ["https://www.youtube.com/youtubei/v1/next*"],
          types: ["xmlhttprequest"]
        });
      }
      storage.local.set({ enabled: !enabled }, () => sendResponse(!enabled));
    });
  }
  return true;
}

runtime.onInstalled.addListener(() => storage.local.set({ enabled: false }));

runtime.onMessage.addListener(messageHandler);
