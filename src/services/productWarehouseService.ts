import apiClient from '../api/client';
import { ApiResponse } from '../types/customer';

export interface AddProductToWarehouseDto {
    productId: number;
    warehouseId: number;
    quantity: number;
}

export const ProductWarehouseService = {
    add: async (data: AddProductToWarehouseDto) => {
        const response = await apiClient.post<ApiResponse<any>>('/ProductWarehouse/Create', data);
        return response.data;
    },

    update: async (productId: number, warehouseId: number, quantity: number) => {
        const response = await apiClient.put<ApiResponse<any>>(`/ProductWarehouse/Edit?ProductId=${productId}&WarehouseId=${warehouseId}&Quantity=${quantity}`);
        return response.data;
    }
};
