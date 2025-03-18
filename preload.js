// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (channel, ...data) => ipcRenderer.send(channel, ...data),
  onReceiveMessage: (channel, func) => ipcRenderer.on(channel, (_event, ...args) => func(...args)),
  removeListener: (channel, func) => ipcRenderer.removeListener(channel, func)
});