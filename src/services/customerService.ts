import apiClient from '../api/client';
import { ApiResponse, CreateCustomerDto, Customer, EditCustomerDto } from '../types/customer';

export const CustomerService = {
    getAll: async () => {
        const response = await apiClient.get<ApiResponse<Customer[]>>('/Customer/getAll');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<ApiResponse<Customer>>(`/Customer/${id}`);
        return response.data;
    },

    create: async (data: CreateCustomerDto) => {
        const response = await apiClient.post<ApiResponse<Customer>>('/Customer/Create', data);
        return response.data;
    },

    update: async (data: EditCustomerDto) => {
        // The user specified that Edit uses query parameters
        const params = new URLSearchParams({
            Id: data.id.toString(),
            Name: data.name,
            Phone: data.phone,
            Email: data.email,
            Address: data.address,
        });

        const response = await apiClient.put<ApiResponse<Customer>>(`/Customer/Edit?${params.toString()}`);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete<ApiResponse<any>>(`/Customer/delete/${id}`);
        return response.data;
    },

    // Assuming search might take a query string "name" or similar, 
    // currently implementing as a generic search endpoint based on user input
    // The user didn't specify the search param name clearly, defaulting to 'term' or similar if needed,
    // but looking at the definition, it might specific filters. 
    // PROVISIONAL: Will implement a client-side filter for now if the API implementation is ambiguous, 
    // or simple call to the endpoint. The user showed /search returning a single object, which implies exact match or similar.
    // I will skip defining a specific 'search' method that differs from getAll unless specific parameters are needed.
    // For now, I'll rely on getAll and client-side filtering for immediate speed, 
    // OR add a search method if the user specifically asked for backend search integration.
    // Implementation Update: Sticking to getAll for list and filtering there for better UX (instant) unless list is huge.
};
