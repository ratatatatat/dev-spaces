import { IPty } from "node-pty";
import { v4 as uuidv4 } from 'uuid';

export class Terminal {
    id: string;
    ptyProcess: IPty;
    constructor(ptyProcess: IPty) {
        this.id = uuidv4();
        this.ptyProcess = ptyProcess;
    }
}