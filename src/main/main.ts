import { app, BrowserWindow, ipcMain } from 'electron';
import express from 'express';
import * as path from 'path';
import cors from 'cors'; // Import the cors module
import routes, {serviceTerminalManager} from './routes'; // Import the routes
import * as url from 'url';
import { DBService } from '../Types';
import { exec } from 'child_process';

let mainWindow: Electron.BrowserWindow | null;


const createWindow = () => {
  const server = express();
  server.use(cors()); // Enable CORS for all domains
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
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'), // path to your preload script
      },
    });
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
    serviceTerminalManager.on('data', payload => {
      mainWindow?.webContents.send('service-terminal-data', payload);
    })
    mainWindow.webContents.openDevTools(); // Open the DevTools
    // mainWindow.loadURL(
    //   'http://localhost:9000'
    // );
    // mainWindow.loadURL(
    //   url.format({
    //     pathname: path.join(__dirname,'../', 'index.html'),
    //     protocol: 'file:',
    //     slashes: true,
    //   })
    // )
    mainWindow.loadURL('http://localhost:9000');
    ipcMain.on('service-terminal-data', (event, payload) => {
      serviceTerminalManager.sendTerminalData(payload);
    })
    ipcMain.on('open-code', (event, payload: DBService) => {
      exec(`code ${payload.directoryPath}`);
    });
    ipcMain.on('open-directory', (event, payload: DBService) => {
      exec(`open ${payload.directoryPath}`);
    });
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

