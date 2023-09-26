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

  let keeplooping = true;

  function checkScrollSpinner() {
    const { scrollTop, clientHeight, scrollHeight } = document.scrollingElement;
    // console.log("scrollPosition", scrollHeight - clientHeight - scrollTop);
    if (!(scrollHeight - clientHeight - scrollTop)) {
      const spinners = document.querySelectorAll("#comments #spinner:not([hidden])");
      // console.log("spinners.length", spinners.length);
      if (spinners.length === 0) keeplooping = false;
    }
  }

  document.addEventListener("scrollend", checkScrollSpinner);

  while (keeplooping) {
    await new Promise((r) => setTimeout(r, 3e2));
    document.scrollingElement.scrollBy({
      top: document.scrollingElement.scrollTop + 1e2,
      behavior: "instant",
    });
    // console.log(document.scrollingElement.scrollTop);
  }

  document.removeEventListener("scrollend", checkScrollSpinner);

  const replies = Array.from(
    document.querySelectorAll("#more-replies > yt-button-shape > button")
  ).reverse();

  for (const btn of replies) {
    btn.scrollIntoView({ behavior: "instant" });
    await new Promise((res) => setTimeout(res, 3e2));
    btn.click();
    await new Promise((res) => {
      const iid = setInterval(() => {
        const spinners = document.querySelectorAll("#comments #spinner:not([hidden])");
        // console.log("spinners.length", spinners.length);
        if (spinners.length === 0) {
          clearInterval(iid);
          res();
        }
      }, 3e2);
    });
  }

  showAllMoreReplies();
}

async function showAllMoreReplies() {
  const moreReplies = document.querySelectorAll(
    "#button > ytd-button-renderer > yt-button-shape > button"
  );
  if (moreReplies.length) {
    for (const btn of moreReplies) {
      btn.scrollIntoView({ behavior: "instant" });
      await new Promise((res) => setTimeout(res, 3e2));
      btn.click();
      await new Promise((res) => {
        const iid = setInterval(() => {
          const spinners = document.querySelectorAll("#comments #spinner:not([hidden])");
          // console.log("spinners.length", spinners.length);
          if (spinners.length === 0) {
            clearInterval(iid);
            res();
          }
        }, 3e2);
      });
    }
    showAllMoreReplies();
  } else {
    document.scrollingElement.scrollTo({ top: 0, behavior: "smooth" });
    requestIdleCallback(() => loadAllImgs(), { timeout: 3e3 });
  }
}

function loadAllImgs() {
  const allImgs = Array.from(document.querySelectorAll("#author-thumbnail > a")).reverse();
  function focusAllImgs() {
    if (allImgs.length) {
      const img = allImgs.pop();
      img.scrollIntoView({ block: "center", behavior: "instant" });
    } else {
      document.removeEventListener("scrollend", focusAllImgs);
    }
  }
  document.addEventListener("scrollend", focusAllImgs);
  document.scrollingElement.scrollBy({
    top: document.scrollingElement.scrollTop + 1e1,
    behavior: "instant",
  });
  // const allImgs = Array.from(document.querySelectorAll("#author-thumbnail > a")).reverse();
  // function focusAllImgs() {
  //   if (allImgs.length) {
  //     const img = allImgs.pop();
  //     img.scrollIntoView({ block: "center", behavior: "instant" });
  //     requestAnimationFrame(focusAllImgs);
  //   }
  // }
  // requestAnimationFrame(focusAllImgs);
  // const allImgs = document.querySelectorAll("#author-thumbnail > a");
  // for (const img of allImgs) {
  //   img.scrollIntoView({ block: "center", behavior: "instant" });
  //   await new Promise((r) => setTimeout(r, 1e2));
  // }
  // const allImgs = document.querySelectorAll("#author-thumbnail > a");
  // for (const img of allImgs) {
  //   await Promise.resolve();
  //   img.scrollIntoView({ block: "center", behavior: "instant" });
  // }
}

// https://www.youtube.com/watch?v=6RwkR6b0Nb8
