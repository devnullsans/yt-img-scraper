const { runtime, storage } = chrome;

const rRx = /=s\d+.*/;
const fRx = /^https:\/\/yt3\.ggpht\.com\/[^\/]+=s.*/;

let replies,
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
  if (
    document.scrollingElement.scrollHeight >
    document.scrollingElement.scrollTop + window.innerHeight
  ) {
    window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
    addToSet();
    printScrollPercentege();
    setTimeout(smoothScrollAll, 6e2);
  } else {
    download();
  }
}

function viewRequestComplete() {
  setTimeout(() => {
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
  }, 5e2);
}

function scrollRequestComplete() {
  setTimeout(() => {
    window.scrollTo(0, document.scrollingElement.scrollHeight);
    const lastNode = document
      .getElementById("content")
      .querySelector("#page-manager")
      .querySelector("#columns")
      .querySelector("#below")
      .querySelector("#comments")
      .querySelector("#contents").lastElementChild;
    if (lastNode.tagName !== "YTD-CONTINUATION-ITEM-RENDERER") {
      runtime.onMessage.removeListener(scrollRequestComplete);
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
      runtime.onMessage.addListener(viewRequestComplete);
      viewRequestComplete();
    }
  }, 5e2);
}

window.addEventListener("load", () => {
  storage.local.get("enabled", ({ enabled }) => {
    if (enabled) {
      setTimeout(() => {
        document.querySelector("#player").remove();
        document.querySelector("#related").remove();
        document.querySelector("#below > ytd-watch-metadata")?.remove();
        document.querySelector("#below > ytd-merch-shelf-renderer")?.remove();
        runtime.onMessage.addListener(scrollRequestComplete);
        window.scrollTo(0, document.scrollingElement.scrollHeight);
      }, 1e3);
    }
  });
});
