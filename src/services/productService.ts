import apiClient from '../api/client';
import { ApiResponse } from '../types/customer';
import { CreateProductDto, EditProductDto, Product } from '../types/product';

export const ProductService = {
    getAll: async () => {
        const response = await apiClient.get<ApiResponse<Product[]>>('/Products/getAll');
        return response.data;
    },

    getByWarehouse: async (warehouseId: number) => {
        const response = await apiClient.get<ApiResponse<Product[]>>(`/Products/GetProductsByWarehouse?WarehouseId=${warehouseId}`);
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<ApiResponse<Product>>(`/Products/${id}`);
        return response.data;
    },

    create: async (data: CreateProductDto) => {
        const formData = new FormData();
        formData.append('Name', data.name);
        // Optional
        if (data.sku) formData.append('SKU', data.sku);
        if (data.description) formData.append('Description', data.description);
        if (data.price) formData.append('Price', data.price.toString());
        if (data.threshold) formData.append('Threshold', data.threshold.toString());
        if (data.productionDate) formData.append('ProductionDate', data.productionDate);
        if (data.expirationDate) formData.append('ExpirationDate', data.expirationDate);
        if (data.warehouseId) formData.append('WarehouseId', data.warehouseId.toString());
        if (data.quantity) formData.append('Quantity', data.quantity.toString());

        if (data.image) {
            formData.append('ImageUrl', data.image);
        }

        const response = await apiClient.post<ApiResponse<any>>('/Products/Create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    update: async (data: EditProductDto) => {
        const formData = new FormData();

        // Required fields
        formData.append('Id', data.id.toString());
        formData.append('Name', data.name);

        // Optional fields
        if (data.sku) formData.append('SKU', data.sku);
        if (data.description) formData.append('Description', data.description);
        if (data.price !== undefined && data.price !== null) formData.append('Price', data.price.toString());
        if (data.threshold !== undefined && data.threshold !== null) formData.append('Threshold', data.threshold.toString());
        if (data.productionDate) formData.append('ProductionDate', data.productionDate);
        if (data.expirationDate) formData.append('ExpirationDate', data.expirationDate);

        if (data.image) {
            formData.append('ImageUrl', data.image);
        }

        const response = await apiClient.put<ApiResponse<any>>('/Products/Edit', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete<ApiResponse<any>>(`/Products/delete/${id}`);
        return response.data;
    },

    search: async (term: string) => {
        const response = await apiClient.get<ApiResponse<Product[]>>(`/Products/search?search=${encodeURIComponent(term)}`);
        return response.data;
    }
};
