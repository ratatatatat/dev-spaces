
import { DBService, ServiceTerminalData } from "../Types";
import TerminalManager from "./TerminalManager";
import EventEmitter from "events";
import * as pty from 'node-pty';
import os from 'os';
import { Terminal } from "./Terminal";

export class ServiceTerminalManager extends EventEmitter {
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
        const terminal = new Terminal(terminalPty);
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
    killService(serviceId: number) {
        this.terminalManager.killService(serviceId);
    }
    kill() {
        this.terminalManager.kill();
    }
    sendTerminalData(payload: ServiceTerminalData) {
        const terminal = this.terminalManager.getTerminal(payload.serviceId, payload.terminalId);
        if (terminal) {
            terminal.ptyProcess.write(payload.data);
        }
    }
}