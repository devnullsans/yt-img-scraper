const { runtime, storage } = chrome;

const rRx = /=s\d+.*/;
const fRx = /^https:\/\/yt3\.ggpht\.com\/[^\/]+=s.*/;

let replies = Array(0),
  urls = new Set();

function download() {
  addToSet();
  for (const url of urls) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.click();
  }
  requestAnimationFrame(() => runtime.sendMessage({ type: "done" }));
}

function addToSet() {
  const imgs = document
    .getElementById("content")
    .querySelector("#page-manager")
    .querySelector("#columns")
    .querySelector("#below")
    .querySelector("#comments")
    .querySelector("#contents")
    .querySelectorAll("#img");
  if (imgs && imgs.length) {
    for (const img of imgs) {
      if (fRx.test(img.src)) {
        urls.add(img.src.replace(rRx, "=s256"));
      }
    }
  }
  console.log(`There are ${urls.size} urls now`);
}

function printScrollPercentege() {
  console.log(
    `Scroll Percent: ${Math.round(
      ((document.scrollingElement.scrollTop + window.innerHeight) /
        document.scrollingElement.scrollHeight) *
        1e2
    )}`
  );
}

function smoothScrollAll() {
  requestAnimationFrame(() => {
    if (
      document.scrollingElement.scrollHeight >
      document.scrollingElement.scrollTop + window.innerHeight
    ) {
      window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
      addToSet();
      printScrollPercentege();
      setTimeout(smoothScrollAll, 8e2);
    } else {
      download();
    }
  });
}

function viewRequestComplete() {
  requestAnimationFrame(() => {
    if (replies.length) {
      const btn = replies.pop();
      btn.focus();
      btn.click();
      printScrollPercentege();
    } else {
      replies = Array.from(
        document
          .getElementById("content")
          .querySelector("#page-manager")
          .querySelector("#columns")
          .querySelector("#below")
          .querySelector("#comments")
          .querySelector("#contents")
          .querySelectorAll("#replies:not([hidden])")
      )
        .map((re) =>
          re
            .querySelector("#expander-contents")
            .querySelector("#contents")
            .querySelector("#button")
            ?.querySelector("button")
        )
        .filter(Boolean);
      if (replies.length) viewRequestComplete();
      else {
        runtime.onMessage.removeListener(viewRequestComplete);
        window.scrollTo(0, 0);
        smoothScrollAll();
      }
    }
  });
}

function scrollRequestComplete() {
  // console.log("scrollRequestComplete");
  setTimeout(() => {
    // console.log("scrollRequestComplete setTimeout");
    window.scrollTo(0, document.scrollingElement.scrollHeight + window.innerHeight);
    requestAnimationFrame(() => {
      // console.log("scrollRequestComplete setTimeout Promise.resolve");
      const lastNode = document
        .getElementById("content")
        .querySelector("#page-manager")
        .querySelector("#columns")
        .querySelector("#below")
        .querySelector("#comments")
        .querySelector("#contents").lastElementChild;
      // console.log(lastNode.tagName);
      if (lastNode.tagName !== "YTD-CONTINUATION-ITEM-RENDERER") {
        replies = Array.from(
          document
            .getElementById("content")
            .querySelector("#page-manager")
            .querySelector("#columns")
            .querySelector("#below")
            .querySelector("#comments")
            .querySelector("#contents")
            .querySelectorAll("#replies:not([hidden])")
        ).map((re) => re.querySelector("button"));
        runtime.onMessage.removeListener(scrollRequestComplete);
        runtime.onMessage.addListener(viewRequestComplete);
        // console.log("onMessage listener changed");
        viewRequestComplete();
      }
    });
  }, 5e2);
}

function onLoadHandle() {
  storage.local.get("enabled", ({ enabled }) => {
    if (enabled) {
      runtime.onMessage.addListener(scrollRequestComplete);
      requestAnimationFrame(() => {
        document.querySelector("#player").remove();
        document.querySelector("#related").remove();
        document.querySelector("#below > ytd-watch-metadata")?.remove();
        document.querySelector("#below > ytd-merch-shelf-renderer")?.remove();
      });
    }
  });
}

window.addEventListener("load", onLoadHandle);
