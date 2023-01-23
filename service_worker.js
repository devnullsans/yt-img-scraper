const { runtime, storage, tabs, webRequest } = chrome;

function completeRequestHandler(details) {
  // console.log(details);
  tabs.sendMessage(details.tabId, true);
}

function messageHandler(request, sender, sendResponse) {
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
  } else if (request.type === "done" && sender.tab) {
    tabs.remove(sender.tab.id);
  }
  return true;
}

runtime.onInstalled.addListener(() => storage.local.set({ enabled: true }));

runtime.onMessage.addListener(messageHandler);

webRequest.onCompleted.addListener(completeRequestHandler, {
  urls: ["https://www.youtube.com/youtubei/v1/next*"],
  types: ["xmlhttprequest"]
});
