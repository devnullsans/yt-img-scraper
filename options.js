const { storage } = chrome;

let store = {},
  images = new Set();

storage.local.get((result) => {
  store = result;

  const videoIDs = Object.keys(result);

  const buttons = videoIDs.map((vid) => {
    const btn = document.createElement("button");
    btn.onclick = refreshList;
    btn.textContent = vid;
    btn.disabled = false;
    return btn;
  });

  const all = document.createElement("button");
  all.onclick = refreshList;
  all.textContent = "All";
  all.disabled = true;
  buttons.unshift(all);

  const nav = document.querySelector("nav");
  nav.replaceChildren(...buttons);

  const uaLists = Object.values(result);
  images = new Set(uaLists.flatMap((ua) => ua));
  showImages(Array.from(images));
});

function refreshList(e) {
  const btns = document.querySelectorAll("nav > button");
  btns.forEach((btn) => {
    btn.disabled = btn === e.target;
  });
  const key = e.target.textContent;
  if (Array.isArray(store[key])) showImages(store[key]);
  else showImages(Array.from(images));
}

function showImages(list = []) {
  const main = document.querySelector("main");
  main.replaceChildren(
    ...list.map((k, i) => {
      const img = document.createElement("img");
      img.src = `https://yt3.ggpht.com${k}=s128`;
      img.loading = "lazy";
      img.alt = `i-${i}`;
      return img;
    })
  );
}
