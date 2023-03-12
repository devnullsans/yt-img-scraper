const { runtime } = chrome;

let aid, uid, vid;
const replies = [];

const loadAllImgs = async () => {
  const allImgs = [...document.querySelectorAll("#author-thumbnail > a")];
  for (const btn of allImgs) {
    await new Promise((rs) => {
      setTimeout(rs, 1e2);
      btn.scrollIntoView({ block: "center" });
    });
  }
};

const getMoreReplies = async () => {
  const moreReplies = [...document.querySelectorAll("#button > ytd-button-renderer > yt-button-shape > button")];
  if (moreReplies.length) {
    for (const btn of moreReplies) {
      await new Promise((rs) => {
        setTimeout(rs, 1e3);
        btn.scrollIntoView({ behavior: "smooth" });
        btn.click();
      });
    }
    getMoreReplies();
  } else {
    window.scrollTo({ top: 0 });
    setTimeout(() => loadAllImgs(), 1e4);
  }
};

const popReplies = async () => {
  for (const btn of replies) {
    await new Promise((rs) => {
      setTimeout(rs, 1e3);
      btn.scrollIntoView({ behavior: "smooth" });
      btn.click();
    });
  }
  getMoreReplies();
};

const getReplies = () => {
  if (replies.length === 0) {
    replies.push(...document.querySelectorAll("#more-replies > yt-button-shape > button"));
    popReplies();
  }
};

runtime.onMessage.addListener(function (message) {
  switch (message.type) {
    case "ui":
      if (replies.length === 0) {
        clearTimeout(uid);
        clearTimeout(aid);
        uid = setTimeout(() => window.scrollBy({ top: window.innerHeight }), 1e2);
        aid = setTimeout(() => getReplies(), 1e4);
      }
      break;
    case "vp":
      clearTimeout(vid);
      vid = setTimeout(() => {
        document.querySelector("body > ytd-app > ytd-miniplayer")?.remove();
        document.querySelector("body > ytd-app > ytd-popup-container")?.remove();
        document.querySelector("#secondary")?.remove();
        document.querySelector("#player")?.remove();
        document.querySelector("#alerts")?.remove();
        document.querySelector("#messages")?.remove();
        document.querySelector("#clarify-box")?.remove();
        document.querySelector("#limited-state")?.remove();
        document.querySelector("#below > ytd-watch-metadata")?.remove();
        document.querySelector("#below > div:nth-child(1)")?.remove();
        document.querySelector("#ticket-shelf")?.remove();
        document.querySelector("#merch-shelf")?.remove();
      }, 1e1);
      break;
  }
});
