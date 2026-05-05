import { Injectable } from '@angular/core';

declare global {
  interface Window {
    electronAPI?: {
      readData: (key: string) => Promise<any>;
      writeData: (key: string, data: any) => Promise<boolean>;
      saveDocument: (type: string, entityId: string, fileName: string, base64Content: string) => Promise<string | null>;
      getDocument: (filePath: string) => Promise<string | null>;
      openFile: (filePath: string) => Promise<boolean>;
      triggerBackup: () => Promise<boolean>;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class IpcService {
  get isElectron(): boolean {
    return !!(window && window.electronAPI);
  }

  async readData(key: string): Promise<any> {
    if (this.isElectron) {
      return await window.electronAPI!.readData(key);
    }
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  async writeData(key: string, data: any): Promise<boolean> {
    if (this.isElectron) {
      return await window.electronAPI!.writeData(key, data);
    }
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  }

  async saveDocument(type: 'buyers' | 'sellers', entityId: string, fileName: string, base64Content: string): Promise<string | null> {
    if (this.isElectron) {
      return await window.electronAPI!.saveDocument(type, entityId, fileName, base64Content);
    }
    // Fallback for browser testing
    return base64Content;
  }

  async getDocument(filePath: string): Promise<string | null> {
    if (this.isElectron) {
      const base64Data = await window.electronAPI!.getDocument(filePath);
      return base64Data ? `data:application/octet-stream;base64,${base64Data}` : null;
    }
    // Fallback if stored in local storage
    return filePath;
  }

  async triggerBackup(): Promise<boolean> {
    if (this.isElectron) {
      return await window.electronAPI!.triggerBackup();
    }
    return false;
  }

  async openFile(filePath: string): Promise<boolean> {
    if (this.isElectron) {
      return await window.electronAPI!.openFile(filePath);
    }
    return false;
  }
}
