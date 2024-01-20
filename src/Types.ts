export interface Service {
    directoryPath: string;
    name: string;
    id?: number;
};

export type DBService = Service & { id: number };

export type ServiceWithTerminals = Service & { terminals: string[] };

export interface ServiceTerminalData {
    serviceId: number;
    terminalId: string;
    data: string;
};

