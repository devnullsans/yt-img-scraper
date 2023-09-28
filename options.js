const { storage } = chrome;

let store = {},
  images = new Set();

const observer = new IntersectionObserver(
  (entries, observer) => {
    for (const entry of entries) {
      // console.log(entry);
      if (entry.isIntersecting) {
        entry.target.src = entry.target.dataset.url;
        observer.unobserve(entry.target);
      }
    }
  },
  {
    root: document.querySelector("main"),
    threshold: 0.2,
  }
);

storage.local.get(onLocalStorageGet);
storage.local.onChanged.addListener(onLogStorageChange);

function createNavButton(count = 0, vid = "allbtn") {
  const isAllBtn = vid === "allbtn";
  const btn = document.createElement("button");
  btn.onclick = refreshList;
  btn.textContent = `${isAllBtn ? "All" : vid} ${count}`;
  btn.disabled = isAllBtn;
  btn.id = `_${vid}`;
  return btn;
}

function onLocalStorageGet(result) {
  store = result;
  const videoIDs = Object.keys(result);
  const uaLists = Object.values(result);
  images = new Set(uaLists.flatMap((ua) => ua));
  const nav = document.querySelector("nav");
  nav.replaceChildren(
    createNavButton(images.size),
    ...videoIDs.map((vid) => createNavButton(result[vid].length, vid))
  );
  showImages(Array.from(images));
}

function onLogStorageChange(changes) {
  const nav = document.querySelector("nav");
  for (const vid of Object.keys(changes)) {
    const { newValue = [] } = changes[vid];
    for (const usUrl of newValue) images.add(usUrl);
    const btn = nav.querySelector(`#_${vid}`);
    if (btn) {
      btn.textContent = `${vid} ${newValue.length}`;
    } else {
      nav.appendChild(createNavButton(newValue.length, vid));
    }
  }
  const allBtn = nav.querySelector("#_allbtn");
  allBtn.textContent = `All ${images.size}`;
}

function refreshList(e) {
  const btns = document.querySelectorAll("nav > button");
  for (const btn of btns) btn.disabled = btn === e.target;
  const key = e.target.id.substring(1);
  if (Array.isArray(store[key])) showImages(store[key]);
  else showImages(Array.from(images));
}

function showImages(list = []) {
  const main = document.querySelector("main");
  main.replaceChildren(
    ...list.map((k, i) => {
      const img = document.createElement("img");
      img.dataset.url = `https://yt3.ggpht.com${k}=s128`;
      img.src = "images/icon128.png";
      img.height = img.width = 128;
      img.loading = "lazy";
      img.alt = `i-${i}`;
      observer.observe(img);
      return img;
    })
  );
}
