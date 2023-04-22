const { runtime } = chrome;

let aid, uid;
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
  // console.log(`moreReplies length ${moreReplies.length}`);
  if (moreReplies.length) {
    for (const btn of moreReplies) {
      await new Promise((rs) => {
        setTimeout(rs, 1e3);
        btn.scrollIntoView({ behavior: "smooth" });
        btn.click();
      });
      // console.log(`Index of btn ${moreReplies.indexOf(btn)}`);
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
    // console.log(`Index of btn ${replies.indexOf(btn)}`);
  }
  getMoreReplies();
};

const getReplies = () => {
  if (replies.length === 0) {
    replies.push(...document.querySelectorAll("#more-replies > yt-button-shape > button"));
    popReplies();
    // console.log(`replies length ${replies.length}`);
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
        // console.log("ui request fullfilled");
      }
      break;
    case "vp":
      {
        let depth = 6;
        let element = document.querySelector("#comments");
        while (depth > 0) {
          depth--;
          for (const el of element.parentElement.children) {
            if (el !== element) el.remove();
          }
          element = element.parentElement;
        }
        // console.log("vp request fullfilled");
      }
      break;
  }
});

console.log("Content Script Injected");
