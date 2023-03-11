const { storage } = chrome;

storage.local.get((result) => {
  document.body.innerHTML = Object.keys(result)
    .map((k, i) => `<img src="https://yt3.ggpht.com${k}=s128" alt="i-${i}" loading="lazy" />`)
    .join("");
});
