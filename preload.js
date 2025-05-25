// preload.js
const { contextBridge, ipcRenderer } = require("electron");
const isDev = process.argv.some((arg) => arg === "--isDev=true");

contextBridge.exposeInMainWorld("electronAPI", {
  sendMessage: (channel, ...data) => ipcRenderer.send(channel, ...data),
  onReceiveMessage: (channel, func) =>
    ipcRenderer.on(channel, (_event, ...args) => func(...args)),
  removeListener: (channel, func) => ipcRenderer.removeListener(channel, func),
});


if (isDev) {
  window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    require("electron").ipcRenderer.send("show-context-menu", {
      x: event.x,
      y: event.y,
    });
  });
}
