import axios, { AxiosResponse } from 'axios';
import { Service } from '../../Types';

const baseUrl = 'http://localhost:3000'; // Replace with your server's URL

// Create a service
export const createService = async (service: Omit<Service, 'id'>): Promise<Service> => {
  const response: AxiosResponse<Service> = await axios.post(`${baseUrl}/services`, service);
  return response.data;
};

// Get all services
export const getServices = async (): Promise<Service[]> => {
  const response: AxiosResponse<Service[]> = await axios.get(`${baseUrl}/services`);
  return response.data;
};

// Get a service by ID
export const getService = async (id: number): Promise<Service> => {
  const response: AxiosResponse<Service> = await axios.get(`${baseUrl}/services/${id}`);
  return response.data;
};

// Update a service
export const updateService = async (id: number, service: Omit<Service, 'id'>): Promise<Service> => {
  const response: AxiosResponse<Service> = await axios.put(`${baseUrl}/services/${id}`, service);
  return response.data;
};

// Delete a service
export const deleteService = async (id: number): Promise<void> => {
  await axios.delete(`${baseUrl}/services/${id}`);
};