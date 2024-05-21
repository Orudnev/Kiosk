import { app, session, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import installExtension, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import {HandleOneWayCall, HandleTwoWayCall} from './api';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    //fullscreen:true,
    //autoHideMenuBar:true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  });

  //ipcMain.on('set-title', handleSetTitle);

  if (app.isPackaged) {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  } else {
    win.loadURL('http://localhost:3000/index.html');

    win.webContents.once("dom-ready", async () => {
      await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
        .then((name:any) => console.log(`Added Extension:  ${name}`))
        .catch((err:any) => console.log("An error occurred: ", err))
        .finally(() => {
          win.webContents.openDevTools();
        });
      win.webContents.openDevTools();

    });

    // Hot Reloading on 'node_modules/.bin/electronPath'
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname,
        '..',
        '..',
        'node_modules',
        '.bin',
        'electron' + (process.platform === "win32" ? ".cmd" : "")),
      forceHardReset: true,
      hardResetMethod: 'exit'
    });
  }
}

app.whenReady().then(() => {
  ipcMain.handle('oneWayCall',HandleOneWayCall);
  ipcMain.handle('twoWayCall',HandleTwoWayCall);
  createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

