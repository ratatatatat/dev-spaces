import { createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import { Service, ServiceWithTerminals } from '../../../Types';
import { createService, createTerminal, deleteService, getServices, updateService } from '../../lib/api';

interface ServiceState {
    services: ServiceWithTerminals[];
    isLoading: boolean;
    error?: string;
};

const initialState: ServiceState = {
    services: [],
    isLoading: false,
};

// Selectors
export const selectServices = (state: { services: ServiceState }) => state.services.services;
export const selectIsLoading = (state: { services: ServiceState }) => state.services.isLoading;
export const selectError = (state: { services: ServiceState }) => state.services.error;
export const selectService = (id: number) => (state: { services: ServiceState }) => state.services.services.find((service) => service.id === id);

const serviceSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {
        addService: (state, action: PayloadAction<ServiceWithTerminals>) => {
            (action.payload as ServiceWithTerminals).terminals = [];
            state.services.push(action.payload);
        },
        deleteService: (state, action: PayloadAction<number>) => {
            state.services = state.services.filter((service) => service.id !== action.payload);
        },
        updateService: (state, action: PayloadAction<ServiceWithTerminals>) => {
            const index = state.services.findIndex((service) => service.id === action.payload.id);
            state.services[index] = action.payload;
        },
        initiateServices: (state, action: PayloadAction<ServiceWithTerminals[]>) => {
            state.services = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const addServiceAction = (service: Omit<Service, 'id'>) => async (dispatch: any) => {
    try {
        dispatch(serviceSlice.actions.setLoading(true));
        const newService = await createService(service);
        dispatch(serviceSlice.actions.addService(newService));
    } catch (error: any) {
        dispatch(serviceSlice.actions.setError(error.toString()));
    } finally {
        dispatch(serviceSlice.actions.setLoading(false));
    }
};

export const deleteServiceAction = (id: number) => async (dispatch: any) => {
    try {
        dispatch(serviceSlice.actions.setLoading(true));
        await deleteService(id);
        dispatch(serviceSlice.actions.deleteService(id));
    } catch (error: any) {
        dispatch(serviceSlice.actions.setError(error.toString()));
    } finally {
        dispatch(serviceSlice.actions.setLoading(false));
    }
};

export const updateServiceAction = (id: number, service: Omit<ServiceWithTerminals, 'id'>) => async (dispatch: any) => {
    try {
        dispatch(serviceSlice.actions.setLoading(true));
        const updatedService = await updateService(id, service);
        (updatedService as ServiceWithTerminals).terminals = service.terminals;
        dispatch(serviceSlice.actions.updateService(updatedService as ServiceWithTerminals));
    } catch (error: any) {
        dispatch(serviceSlice.actions.setError(error.toString()));
    } finally {
        dispatch(serviceSlice.actions.setLoading(false));
    }
};

export const initiateServicesAction = () => async (dispatch: any) => {
    try {
        dispatch(serviceSlice.actions.setLoading(true));
        const services = (await getServices()).map((service) => {
            return { ...service};
        });
        dispatch(serviceSlice.actions.initiateServices(services));
    } catch (error: any) {
        dispatch(serviceSlice.actions.setError(error.toString()));
    } finally {
        dispatch(serviceSlice.actions.setLoading(false));
    }
};

export const createTerminalAction = (serviceId: number) => async (dispatch: any, getState: any) => {
    try {
        const state = getState();
        const {
            terminalId
        } = await createTerminal(serviceId);
        const service = selectService(serviceId)(state) as ServiceWithTerminals;
        dispatch(serviceSlice.actions.updateService({ ...service, terminals: [...service.terminals, terminalId] }));
    } catch (error: any) {
        dispatch(serviceSlice.actions.setError(error.toString()));
    }
}

export const deleteTerminalAction = (serviceId: number, terminalId: string) => async (dispatch: any, getState: any) => {
    try {
        const state = getState();
        const service = selectService(serviceId)(state) as ServiceWithTerminals;
        dispatch(serviceSlice.actions.updateService({ ...service, terminals: service.terminals.filter((id) => id !== terminalId) }));
    } catch (error: any) {
        dispatch(serviceSlice.actions.setError(error.toString()));
    }
}

export default serviceSlice.reducer;