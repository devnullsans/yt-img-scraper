const { storage } = chrome;

storage.local.get((result) =>
  Object.keys(result).forEach((key) => {
    const img = document.createElement("img");
    img.src = `https://yt3.ggpht.com${key}=s128`;
    document.body.appendChild(img);
  })
);
