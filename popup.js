const { runtime, storage } = chrome;

const toggle = document.getElementById("toggle");

storage.local.get("enabled", ({ enabled }) => {
  toggle.innerText = enabled ? "Disable" : "Enable";
  toggle.onclick = () => runtime.sendMessage({ type: "toggle" }, () => window.close());
  toggle.disabled = false;
});
