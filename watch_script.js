const { runtime } = chrome;

let aid, uid, vid;
const replies = [];

const getMoreReplies = async () => {
  const moreReplies = [...document.querySelectorAll("#button > ytd-button-renderer > yt-button-shape > button")];
  if (moreReplies.length) {
    for (const btn of moreReplies) {
      await new Promise((rs) => {
        setTimeout(rs, 1e3);
        btn.focus();
        btn.click();
      });
    }
    getMoreReplies();
  } else {
    console.log("All done!");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const popReplies = async () => {
  for (const btn of replies) {
    await new Promise((rs) => {
      setTimeout(rs, 1e3);
      btn.focus();
      btn.click();
    });
  }
  getMoreReplies();
};

const getReplies = () => {
  console.log("60 secs passed since last ui req");
  if (replies.length === 0) {
    replies.push(...document.querySelectorAll("#more-replies > yt-button-shape > button"));
    popReplies();
  }
};

const checkMessage = (type) => {
  switch (type) {
    case "ui":
      if (replies.length === 0) {
        clearTimeout(uid);
        clearTimeout(aid);
        uid = setTimeout(() => window.scrollBy({ top: window.innerHeight }), 1e2);
        aid = setTimeout(() => getReplies(), 6e4);
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
      }, 1e3);
      break;
  }
};

runtime.onMessage.addListener(function (message) {
  const { type } = message;
  checkMessage(type);
  console.log(`${type} message received`);
});
