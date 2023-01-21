const { storage } = chrome;

window.addEventListener("load", () => {
  storage.local.get("enabled", ({ enabled }) => {
    if (enabled) {
      fetch(location.href)
        .then((res) => res.blob())
        .then((file) => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(file);
          a.download = document.title.slice(0, document.title.indexOf(" "));
          a.click();
          return new Promise((resolve) => setTimeout(() => resolve(), 1e2));
        })
        .then(() => window.close())
        .catch(console.error);
    }
  });
});
