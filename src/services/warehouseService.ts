import apiClient from '../api/client';
import { ApiResponse, CreateWarehouseDto, EditWarehouseDto, Warehouse } from '../types/warehouse';

export const WarehouseService = {
    getAll: async () => {
        const response = await apiClient.get<ApiResponse<Warehouse[]>>('/Warehouse/getAll');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<ApiResponse<Warehouse>>(`/Warehouse/${id}`);
        return response.data;
    },

    create: async (data: CreateWarehouseDto) => {
        const response = await apiClient.post<ApiResponse<Warehouse>>('/Warehouse/Create', data);
        return response.data;
    },

    update: async (data: EditWarehouseDto) => {
        const response = await apiClient.post<ApiResponse<Warehouse>>('/Warehouse/Edit', data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete<ApiResponse<boolean>>(`/Warehouse/delete/${id}`);
        return response.data;
    },

    search: async (query: string) => {
        // The user mentioned "search http://inventopro.runasp.net/Api/V1/Warehouse/search"
        // Usually search endpoints take a query param or body. 
        // Assuming query param 'term' or similar based on typical patterns, 
        // BUT existing CustomersPage filters client-side.
        // If server-side search is required:
        // const response = await apiClient.get<ApiResponse<Warehouse[]>>(`/Warehouse/search?query=${query}`);
        // However the user just gave the URL "search". Let's assume it supports POST or GET params? 
        // Given the lack of details on params, I will leave client-side filtering as primary for now 
        // (like CustomersPage) unless I get more info.
        // But I will add the method placeholder just in case.
        const response = await apiClient.get<ApiResponse<Warehouse[]>>(`/Warehouse/search?name=${query}`);
        return response.data;
    }
};
