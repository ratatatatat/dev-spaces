import { app, BrowserWindow } from 'electron';
import express from 'express';
import * as path from 'path';
import * as url from 'url';
import * as chokidar from 'chokidar';
import routes, {serviceTerminalManager} from './routes'; // Import the routes
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
      'http://localhost:9000'
    );
    serviceTerminalManager.on('data', payload => {
      mainWindow?.webContents.send('service-terminal-data', payload);
    })
  });

}

process.on('SIGINT', () => {
  console.log('Ctrl+C was pressed, executing script...');
  // Your script here
  serviceTerminalManager.kill();
  process.exit(0); // This line is needed to actually stop the application
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  serviceTerminalManager.kill();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

