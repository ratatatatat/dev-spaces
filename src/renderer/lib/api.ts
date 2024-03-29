import axios, { AxiosResponse } from 'axios';
import { Service, ServiceWithTerminals } from '../../Types';

let baseUrl: string | undefined;

const getBaseUrl = async () => {
  if (!baseUrl) {
    const apiPort = await window.electron.getServerPort();
    baseUrl = `http://localhost:${apiPort}`;
  }
  return baseUrl;
}

// Create a service
export const createService = async (service: Omit<Service, 'id'>): Promise<ServiceWithTerminals> => {
  const baseUrl = await getBaseUrl();
  const response: AxiosResponse<ServiceWithTerminals> = await axios.post(`${baseUrl}/services`, service);
  return response.data;
};

// Get all services
export const getServices = async (): Promise<ServiceWithTerminals[]> => {
  const baseUrl = await getBaseUrl();
  const response: AxiosResponse<ServiceWithTerminals[]> = await axios.get(`${baseUrl}/services`);
  return response.data;
};

// Get a service by ID
export const getService = async (id: number): Promise<ServiceWithTerminals> => {
  const baseUrl = await getBaseUrl();
  const response: AxiosResponse<ServiceWithTerminals> = await axios.get(`${baseUrl}/services/${id}`);
  return response.data;
};

// Update a service
export const updateService = async (id: number, service: Omit<Service, 'id'>): Promise<ServiceWithTerminals> => {
  const baseUrl = await getBaseUrl();
  const response: AxiosResponse<ServiceWithTerminals> = await axios.put(`${baseUrl}/services/${id}`, service);
  return response.data;
};

// Delete a service
export const deleteService = async (id: number): Promise<void> => {
  const baseUrl = await getBaseUrl();
  await axios.delete(`${baseUrl}/services/${id}`);
};

// Create a terminal for a service
export const createTerminal = async (serviceId: number): Promise<
  { serviceId: number; terminalId: string }
> => {
  const baseUrl = await getBaseUrl();
  const response: AxiosResponse<{ serviceId: number; terminalId: string }> = await axios.post(`${baseUrl}/services/${serviceId}/terminals`);
  return response.data;
};

export const deleteTerminal = async (serviceId: number, terminalId: string): Promise<void> => {
  const baseUrl = await getBaseUrl();
  await axios.delete(`${baseUrl}/services/${serviceId}/terminals/${terminalId}`);
}