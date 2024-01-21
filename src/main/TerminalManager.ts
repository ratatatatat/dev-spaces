import { Terminal } from "./Terminal";

export type TerminalStore = Record<string, Terminal[]>

export default class TerminalManager {
    store: TerminalStore = {};
    addTerminal(serviceId: number, terminal: Terminal) {
        if (!this.store[serviceId]) {
            this.store[serviceId] = [];
        }
        this.store[serviceId].push(terminal);
    };
    getTerminals(serviceId: number) {
        return this.store[serviceId] || [];
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
    kill() {
        Object.values(this.store).forEach((terminals) => {
            terminals.forEach((terminal) => {
                terminal.ptyProcess.kill();
            });
        });
        this.store = {};
    };
    killService(serviceId: number) {
        const terminals = this.store[serviceId] || [];
        terminals.forEach((terminal) => {
            terminal.ptyProcess.kill();
        });
        this.store[serviceId] = [];
    }
}