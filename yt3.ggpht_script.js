const { storage } = chrome;

window.addEventListener("load", () => {
  storage.local.get("enabled", ({ enabled }) => {
    if (enabled) {
      fetch(location.href)
        .then((res) => res.blob())
        .then((file) => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(file);
          a.download = document.title.slice(0, document.title.indexOf("=s256 "));
          a.click();
          return Promise.resolve();
        })
        .then(() => window.close())
        .catch(console.error);
    }
  });
});
