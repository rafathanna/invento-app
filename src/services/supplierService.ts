import apiClient from '../api/client';
import { ApiResponse } from '../types/customer'; // Reusing Generic ApiResponse
import { CreateSupplierDto, EditSupplierDto, Supplier } from '../types/supplier';

export const SupplierService = {
    getAll: async () => {
        const response = await apiClient.get<ApiResponse<Supplier[]>>('/Supplier/getAll');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<ApiResponse<Supplier>>(`/Supplier/${id}`);
        return response.data;
    },

    create: async (data: CreateSupplierDto) => {
        const response = await apiClient.post<ApiResponse<Supplier>>('/Supplier/Create', data);
        return response.data;
    },

    update: async (data: EditSupplierDto) => {
        const params = new URLSearchParams({
            Id: data.id.toString(),
            Name: data.name,
            Phone: data.phone,
            Email: data.email,
            Address: data.address,
        });

        const response = await apiClient.put<ApiResponse<Supplier>>(`/Supplier/Edit?${params.toString()}`);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete<ApiResponse<any>>(`/Supplier/delete/${id}`);
        return response.data;
    },

    search: async (term: string) => {
        const response = await apiClient.get<ApiResponse<Supplier[]>>(`/Supplier/search?search=${term}`);
        return response.data;
    }
};
