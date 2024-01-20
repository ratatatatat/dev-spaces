import express, { Request } from 'express';
import { DBService, Service, ServiceTerminalData, ServiceWithTerminals } from '../Types';
import sqlite3 from 'sqlite3';
import { IPty } from 'node-pty';
import { v4 as uuidv4 } from 'uuid';
import * as pty from 'node-pty';
import os from 'os';
import { EventEmitter } from 'stream';

const router = express.Router();

const db = new sqlite3.Database('./services.db');


class Terminal {
    id: string;
    ptyProcess: IPty;
    constructor(service: Service, ptyProcess: IPty) {
        this.id = uuidv4();
        this.ptyProcess = ptyProcess;
    }
}

type TerminalStore = Record<string, Terminal[]>

class TerminalManager {
    store: TerminalStore = {};
    addTerminal(serviceId: number, terminal: Terminal) {
        if (!this.store[serviceId]) {
            this.store[serviceId] = [];
        }
        this.store[serviceId].push(terminal);
    };
    getTerminals(serviceId: number) {
        return this.store[serviceId];
    };
    getTerminal(serviceId: number, terminalId: string) {
        return this.store[serviceId].find((terminal) => terminal.id === terminalId);
    };
    removeTerminal(serviceId: number, terminalId: string) {
        const terminal = this.getTerminal(serviceId, terminalId);
        if (!terminal) {
            return;
        }
        terminal.ptyProcess.kill();
        this.store[serviceId] = this.store[serviceId].filter((terminal) => terminal.id !== terminalId);
    };
}

class ServiceTerminalManager extends EventEmitter {
    terminalManager: TerminalManager = new TerminalManager();
    createTerminal(service: DBService): Terminal {
        // Create a new terminal
        const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
        const terminalPty = pty.spawn(
            shell,
            [],
            {
                name: 'xterm-color',
                cols: 80,
                rows: 30,
                cwd: service.directoryPath,
                env: process.env as Record<string, string>,
            }
        );
        const terminal = new Terminal(service, terminalPty);
        terminal.ptyProcess.onData((data) => {
            const payload = {
                serviceId: service.id,
                terminalId: terminal.id,
                data,
            } as ServiceTerminalData;
            this.emit('data', payload);
        })
        this.terminalManager.addTerminal(service.id, terminal);
        return terminal;
    };
    removeTerminal(serviceId: number, terminalId: string) {
        this.terminalManager.removeTerminal(serviceId, terminalId);
    };
    kill() {
        Object.values(this.terminalManager.store).forEach((terminals) => {
            terminals.forEach((terminal) => {
                terminal.ptyProcess.kill();
            });
        });
    }
}

export const serviceTerminalManager = new ServiceTerminalManager();


db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY,
    name TEXT,
    directoryPath TEXT
)`);



// Database operations
const getAllServices = (): Promise<DBService[]> => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM services', (err, rows: DBService[]) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const createService = (service: Service): Promise<DBService> => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO services (name, directoryPath) VALUES (?, ?)', [service.name, service.directoryPath], function (err) {
            if (err) reject(err);
            else resolve({
                id: this.lastID,
                ...service,
            });
        });
    });
};

const getServiceById = (id: number): Promise<DBService> => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM services WHERE id = ?', id, (err, row: DBService) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const updateService = (id: number, service: Service): Promise<DBService> => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE services SET name = ?, directoryPath = ? WHERE id = ?', [service.name, service.directoryPath, id], function (err) {
            if (err) reject(err);
            else resolve({ ...service, id });
        });
    });
};

const deleteService = (id: number) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM services WHERE id = ?', id, function (err) {
            if (err) reject(err);
            else resolve(undefined);
        });
    });
};

const enrichServiceWithTerminals = async (service: DBService): Promise<ServiceWithTerminals> => {
    const terminals = serviceTerminalManager.terminalManager.getTerminals(service.id);
    return { ...service, terminals: terminals.map((terminal) => terminal.id) };
}


// Routes
router.get('/services', async (req, res) => {
    try {
        const rows = await getAllServices();
        const enrichedRows = await Promise.all(rows.map((row: DBService) => enrichServiceWithTerminals(row)));
        res.json(enrichedRows);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/services', async (req, res) => {
    try {
        const dbService = await createService(req.body as Service);
        res.status(201).json(dbService);
    } catch (err) {
        res.status(500).send(err);
    }
});

interface ServiceRequest extends Request {
    serviceId: number;
}

router.use('/services/:serviceId', (req: Request, res, next) => {
    (req as ServiceRequest).serviceId = parseInt(req.params.serviceId);
    next();
})

router.get('/services/:serviceId', async (req: Request, res) => {
    const serviceRequest = req as ServiceRequest;
    try {
        const row = await getServiceById(serviceRequest.serviceId as number);
        if (row) {
            res.json(row);
        } else {
            res.status(404).send('Service not found');
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.put('/services/:serviceId', async (req: Request, res) => {
    const serviceRequest = req as ServiceRequest;
    try {
        const service = await updateService(serviceRequest.serviceId, req.body as Service);
        if (service) {
            res.json(service);
        } else {
            res.status(404).send('Service not found');
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete('/services/:serviceId', async (req: Request, res) => {
    const serviceRequest = req as ServiceRequest;
    try {
        const changes = await deleteService(serviceRequest.serviceId);
        if (changes) {
            res.status(204).send();
        } else {
            res.status(404).send('Service not found');
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/services/:serviceId/terminals', async (req: Request, res) => {
    const serviceRequest = req as ServiceRequest;
    const service = await getServiceById(serviceRequest.serviceId);
    if (!service) {
        res.status(404).send('Service not found');
        return;
    }
    const terminal = serviceTerminalManager.createTerminal({ id: service.id, ...req.body });
    res.json({ terminalId: terminal.id, serviceId: service.id });
});

router.delete('/services/:serviceId/terminals/:terminalId', async (req: Request, res) => {
    const serviceRequest = req as ServiceRequest;
    const serviceId = serviceRequest.serviceId;
    const terminalId = req.params.terminalId;
    serviceTerminalManager.removeTerminal(serviceId, terminalId);
    res.status(204).send();
});

export default router;