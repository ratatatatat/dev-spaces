import express, { NextFunction, Request, Response } from 'express';
import { serviceTerminalManager } from './routes';
import { createService, deleteService, getAllServices, getServiceById, updateService } from './db';
import { DBService, ServiceWithTerminals, Service } from '../Types';

interface ServiceRequest extends Request {
    serviceId: number;
}

const enrichServiceWithTerminals = async (service: DBService): Promise<ServiceWithTerminals> => {
    const terminals = serviceTerminalManager.terminalManager.getTerminals(service.id);
    return { ...service, terminals: terminals.map((terminal) => terminal.id) };
}


export const getServicesHandler = async (req: Request, res: Response, next: NextFunction) => {
    const rows = await getAllServices();
    const enrichedRows = await Promise.all(rows.map((row: DBService) => enrichServiceWithTerminals(row)));
    res.json(enrichedRows);
}

export const createNewService = async (req: Request, res: Response, next: NextFunction) => {
    const dbService = await createService(req.body as Service);
    res.status(201).json(
        enrichServiceWithTerminals(dbService)
    );
}

export const parseRouteMiddleware = (req: Request, res: Response, next: NextFunction) => {
    (req as ServiceRequest).serviceId = parseInt(req.params.serviceId);
    next();
}

export const getServiceHandler = async (req: Request, res: Response, next: NextFunction) => {
    const serviceRequest = req as ServiceRequest;
    const row = await getServiceById(serviceRequest.serviceId as number);
    if (row) {
        res.json(
            enrichServiceWithTerminals(row)
        );
    } else {
        res.status(404).send('Service not found');
    }
};

export const updateServiceHandler = async (req: Request, res: Response, next: NextFunction) => {
    const serviceRequest = req as ServiceRequest;
    const service = await updateService(serviceRequest.serviceId, req.body as Service);
    if (service) {
        res.json(
            enrichServiceWithTerminals(service)
        );
    } else {
        res.status(404).send('Service not found');
    }
}

export const deleteServiceHandler = async (req: Request, res: Response, next: NextFunction) => {
    const serviceRequest = req as ServiceRequest;
    const changes = await deleteService(serviceRequest.serviceId);
    // Kill all terminals for this service
    serviceTerminalManager.killService(serviceRequest.serviceId);
    if (changes) {
        res.status(204).send();
    } else {
        res.status(404).send('Service not found');
    }
}

export const createNewServiceTerminalHandler = async (req: Request, res: Response, next: NextFunction) => {
    const serviceRequest = req as ServiceRequest;
    const service = await getServiceById(serviceRequest.serviceId);
    if (!service) {
        res.status(404).send('Service not found');
        return;
    }
    const terminal = serviceTerminalManager.createTerminal({ id: service.id, ...req.body });
    res.json({ terminalId: terminal.id, serviceId: service.id });
}

export const deleteServiceTerminalHandler = async (req: Request, res: Response, next: NextFunction) => {
    const serviceRequest = req as ServiceRequest;
    const terminalId = req.params.terminalId;
    serviceTerminalManager.removeTerminal(serviceRequest.serviceId, terminalId);
    res.status(204).send();
}