import {
	app,
	BrowserWindow,
	ipcMain,
	shell,
	screen,
} from 'electron';
import express from 'express';
import * as path from 'path';
import cors from 'cors'; // Import the cors module
import routes, { serviceTerminalManager } from './routes'; // Import the routes
import * as url from 'url';
import { DBService } from '../Types';
import { exec } from 'child_process';
import log from 'electron-log';
import { AddressInfo } from 'net';

let mainWindow: Electron.BrowserWindow | null;
let server: express.Express;
let initialized = false;
let port: number | null = null;

process.on('uncaughtException', (error) => {
	log.error(error);
});

const registerMainEvents = () => {
	ipcMain.on('service-terminal-data', (event, payload) => {
		serviceTerminalManager.sendTerminalData(payload);
	})
	ipcMain.on('open-code', (event, payload: DBService) => {
		exec(`code ${payload.directoryPath}`, (error, stdout) => {
			if (error) {
				log.error(`Error opening code: ${error.message}`);
				return;
			}
		});
	});
	
	ipcMain.on('open-directory', (event, payload: DBService) => {
		exec(`open ${payload.directoryPath}`, (error, stdout) => {
			if (error) {
				log.error(`Error opening directory: ${error.message}`);
				return;
			}
		});
	})
	ipcMain.on('open-external', (event, { url }: { url: string}) => {
		shell.openExternal(url);
	});
	ipcMain.handle('get-server-port', () => {
		return port;
	});
};

const teardown = () => {
	serviceTerminalManager.kill();
}


const initialize = async () => {
	if (!initialized) {
		await startServer();
		registerMainEvents();
		process.on('SIGINT', () => {
			app.exit(0);
		});
		initialized = true;
	}
}
const startServer = (): Promise<void> => {
	return new Promise((resolve) => {
		server = express();
		server.use(cors()); // Enable CORS for all domains
		server.use(express.json());
		server.use(express.urlencoded({ extended: true }));
		server.use('/', routes); // Add routes to express server
		let listener = server.listen(0, () => {
			port = (listener.address() as AddressInfo).port;
			resolve();
		});
	});
};

const createWindow = () => {
	const { width, height } = screen.getPrimaryDisplay().workAreaSize;
	mainWindow = new BrowserWindow({
		width: width,
		height: height,
		title: 'Dev Spaces',
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
		mainWindow.webContents.openDevTools();
	} else {
		mainWindow.loadURL(
			url.format({
				pathname: path.join(__dirname, '../../', 'index.html'),
				protocol: 'file:',
				slashes: true,
			})
		)
	}
};


const onReady = async () => {
	await initialize();
	createWindow();
}

app.on('ready', onReady);

app.on('window-all-closed', () => {
	app.quit();
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});

app.on('quit', () => {
	teardown();
});