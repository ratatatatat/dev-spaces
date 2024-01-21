import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import express from 'express';
import * as path from 'path';
import cors from 'cors'; // Import the cors module
import routes, { serviceTerminalManager } from './routes'; // Import the routes
import * as url from 'url';
import { DBService } from '../Types';
import { exec } from 'child_process';
import { Tray } from 'electron';

let mainWindow: Electron.BrowserWindow | null;
let tray: Tray | null;

const registerMainEvents = () => {
	ipcMain.on('service-terminal-data', (event, payload) => {
		serviceTerminalManager.sendTerminalData(payload);
	})
	ipcMain.on('open-code', (event, payload: DBService) => {
		exec(`code ${payload.directoryPath}`);
	});
	ipcMain.on('open-directory', (event, payload: DBService) => {
		exec(`open ${payload.directoryPath}`);
	});
};

const teardown = () => {
	serviceTerminalManager.kill();
}

const createWindow = () => {
	const server = express();
	server.use(cors()); // Enable CORS for all domains
	server.use(express.json());
	server.use(express.urlencoded({ extended: true }));
	server.use('/', routes); // Add routes to express server
	server.listen(3000, () => {
		mainWindow = new BrowserWindow({
			width: 1000,
			minWidth: 1000,
			height: 600,
			title: 'Service Commander',
			icon: path.join(__dirname, "./assets/icons/Template64.png"),
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
		if (process.env.NODE_ENV === 'development') {
			mainWindow.loadURL('http://localhost:9000');
			mainWindow.webContents.openDevTools(); // Open the DevTools
		} else {
			mainWindow.loadURL(
				url.format({
					pathname: path.join(__dirname, '../', 'index.html'),
					protocol: 'file:',
					slashes: true,
				})
			)
		}
		registerMainEvents();
	});
	process.on('SIGINT', () => {
		app.exit(0);
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

app.on('quit', () => {
	teardown();
	console.log('App has quit');
});