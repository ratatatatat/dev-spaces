import express from 'express';
import { DBService, ServiceTerminalData } from '../Types';
import { createNewService, createNewServiceTerminalHandler, deleteServiceHandler, deleteServiceTerminalHandler, getServiceHandler, getServicesHandler, parseRouteMiddleware, updateServiceHandler } from './controller';
import { ServiceTerminalManager } from './ServiceTerminalManager';

const router = express.Router();
export const serviceTerminalManager = new ServiceTerminalManager();
// Database operations


// Routes
router.get('/services', getServicesHandler);

router.post('/services', createNewService);

router.use('/services/:serviceId', parseRouteMiddleware);

router.get('/services/:serviceId', getServiceHandler);

router.put('/services/:serviceId', updateServiceHandler);

router.delete('/services/:serviceId', deleteServiceHandler);

router.post('/services/:serviceId/terminals', createNewServiceTerminalHandler);

router.delete('/services/:serviceId/terminals/:terminalId', deleteServiceTerminalHandler);

export default router;