const { runtime } = chrome;

console.log("Content Script Injected");

requestIdleCallback(() => removeUnwantedElements(), { timeout: 3e3 });

function removeUnwantedElements() {
  let depth = 6;
  let element = document.querySelector("#comments");
  if (!element) return requestIdleCallback(() => removeUnwantedElements(), { timeout: 3e3 });
  while (depth > 0) {
    depth--;
    for (const el of element.parentElement.children) {
      if (el !== element) el.remove();
    }
    element = element.parentElement;
    // if (!element.parentElement) break;
  }
  requestIdleCallback(() => scrollAllTheWay(), { timeout: 3e3 });
}

async function scrollAllTheWay() {
  const element = document.querySelector("#comments");

  if (!element) requestIdleCallback(() => scrollAllTheWay(), { timeout: 3e3 });

  let skip = 10;
  let eHight = element.scrollHeight;

  while (skip) {
    document.scrollingElement.scrollBy({
      top: document.scrollingElement.scrollTop + 100,
      behavior: "smooth",
    });
    await new Promise((r) => setTimeout(r, 3e2));
    if (eHight === element.scrollHeight) --skip;
    else {
      skip = 10;
      eHight = element.scrollHeight;
    }
  }

  const replies = Array.from(
    document.querySelectorAll("#more-replies > yt-button-shape > button")
  ).reverse();

  for (const btn of replies) {
    btn.scrollIntoView({ behavior: "smooth" });
    await new Promise((r) => setTimeout(r, 3e2));
    btn.click();
    await new Promise((r) => setTimeout(r, 9e2));
  }

  showAllMoreReplies();
  // console.log("All Top Level Replys should have been expanded");
}

async function showAllMoreReplies() {
  const moreReplies = document.querySelectorAll(
    "#button > ytd-button-renderer > yt-button-shape > button"
  );
  if (moreReplies.length) {
    for (const btn of moreReplies) {
      btn.scrollIntoView({ behavior: "smooth" });
      await new Promise((r) => setTimeout(r, 3e2));
      btn.click();
      await new Promise((r) => setTimeout(r, 9e2));
    }
    showAllMoreReplies();
  } else {
    document.scrollingElement.scrollTo({ top: 0, behavior: "smooth" });
    requestIdleCallback(() => loadAllImgs(), { timeout: 3e3 });
  }
}

async function loadAllImgs() {
  const allImgs = document.querySelectorAll("#author-thumbnail > a");
  for (const img of allImgs) {
    img.scrollIntoView({ block: "center" });
    await new Promise((r) => setTimeout(r, 1e2));
  }
}
