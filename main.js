const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(app.getPath('documents'), 'LB-Motors-Data');
const dataFolders = {
  data: path.join(dataDir, 'data'),
  documents: path.join(dataDir, 'documents'),
  records: path.join(dataDir, 'records'),
};

const filePaths = {
  vehicles: path.join(dataFolders.data, 'vehicles.json'),
  buyers: path.join(dataFolders.data, 'buyers.json'),
  sellers: path.join(dataFolders.data, 'sellers.json'),
  invoices: path.join(dataFolders.data, 'invoices.json'),
  expenses: path.join(dataFolders.data, 'expenses.json'),
  ledger: path.join(dataFolders.data, 'ledger.json'),
};

function ensureDirectories() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFolders.data)) fs.mkdirSync(dataFolders.data, { recursive: true });
  if (!fs.existsSync(dataFolders.records)) fs.mkdirSync(dataFolders.records, { recursive: true });
  
  // Ensure document subfolders
  const buyersDocs = path.join(dataFolders.documents, 'buyers');
  const sellersDocs = path.join(dataFolders.documents, 'sellers');
  if (!fs.existsSync(buyersDocs)) fs.mkdirSync(buyersDocs, { recursive: true });
  if (!fs.existsSync(sellersDocs)) fs.mkdirSync(sellersDocs, { recursive: true });
}

function ensureFiles() {
  for (const filePath of Object.values(filePaths)) {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]', 'utf8');
  }
}

ensureDirectories();
ensureFiles();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const appURL = app.isPackaged
    ? `file://${path.join(__dirname, 'dist', 'lb-motors', 'browser', 'index.html')}`
    : 'http://localhost:4200';

  mainWindow.loadURL(appURL);
  
  mainWindow.on('close', () => {
    createDailyBackup();
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('read-data', async (event, key) => {
  const filePath = filePaths[key];
  if (!filePath) return null;
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return [];
  }
});

ipcMain.handle('write-data', async (event, key, data) => {
  const filePath = filePaths[key];
  if (!filePath) return false;
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    return false;
  }
});

ipcMain.handle('save-document', async (event, type, entityId, fileName, base64Content) => {
  try {
    // type should be 'buyers' or 'sellers'
    const entityFolder = path.join(dataFolders.documents, type, entityId);
    if (!fs.existsSync(entityFolder)) fs.mkdirSync(entityFolder, { recursive: true });

    const filePath = path.join(entityFolder, fileName);
    const base64Data = base64Content.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    fs.writeFileSync(filePath, base64Data, 'base64');
    return filePath;
  } catch (error) {
    console.error('Error saving document:', error);
    return null;
  }
});

ipcMain.handle('get-document', async (event, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'base64');
        return data;
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
});

function createDailyBackup() {
  try {
    const now = new Date();
    const year = now.getFullYear().toString();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${monthNames[now.getMonth()]}`;
    const date = now.toISOString().split('T')[0];

    const yearFolder = path.join(dataFolders.records, year);
    const monthFolder = path.join(yearFolder, month);
    
    if (!fs.existsSync(yearFolder)) fs.mkdirSync(yearFolder, { recursive: true });
    if (!fs.existsSync(monthFolder)) fs.mkdirSync(monthFolder, { recursive: true });

    const backupPath = path.join(monthFolder, `${date}.json`);
    
    const backupData = {};
    for (const [key, filePath] of Object.entries(filePaths)) {
      if (fs.existsSync(filePath)) {
        try {
          backupData[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
          backupData[key] = [];
        }
      }
    }
    
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
    console.log('Strict daily backup created:', backupPath);
  } catch (error) {
    console.error('Error creating daily backup:', error);
  }
}

ipcMain.handle('trigger-backup', () => {
    createDailyBackup();
    return true;
});

ipcMain.handle('open-file', async (event, filePath) => {
  const { shell } = require('electron');
  if (fs.existsSync(filePath)) {
    await shell.openPath(filePath);
    return true;
  }
  return false;
});
