import { app, BrowserWindow } from 'electron';
import express from 'express';
import * as path from 'path';
import * as url from 'url';
import routes from './routes'; // Import the routes
require('electron-reload')(path.join(__dirname, '../renderer'));

let mainWindow: Electron.BrowserWindow | null;


const createWindow = () => {
  const server = express();
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use('/', routes); // Add routes to express server
  server.listen(3000, () => {
    console.log('Server is running on port 3000');

    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      title: 'Service Commander',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname,'../', 'index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  });

}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});