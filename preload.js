const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readData: (key) => ipcRenderer.invoke('read-data', key),
  writeData: (key, data) => ipcRenderer.invoke('write-data', key, data),
  saveDocument: (type, entityId, fileName, base64Content) => ipcRenderer.invoke('save-document', type, entityId, fileName, base64Content),
  getDocument: (filePath) => ipcRenderer.invoke('get-document', filePath),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  triggerBackup: () => ipcRenderer.invoke('trigger-backup')
});
