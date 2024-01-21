// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      send: (channel: string, data: any) => ipcRenderer.send(channel, data),
      on: (channel: string, callback: () => any) => ipcRenderer.on(channel, callback)
    }
  }
);