import apiClient from '../api/client';
import { ApiResponse } from '../types/customer';
import { CreatePurchaseInvoiceDto, PurchaseInvoice } from '../types/purchase';

export const PurchaseInvoiceService = {
    create: async (data: CreatePurchaseInvoiceDto) => {
        const payload = {
            Invoice: data
        };
        const response = await apiClient.post<ApiResponse<number>>('/PurchaseInvoice/Create', payload);
        return response.data;
    },

    getAll: async () => {
        const response = await apiClient.get<ApiResponse<PurchaseInvoice[]>>('/PurchaseInvoice/getAll');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<ApiResponse<PurchaseInvoice>>(`/PurchaseInvoice/${id}`);
        return response.data;
    },

    cancel: async (invoiceId: number, cancelledBy: string) => {
        const response = await apiClient.post<ApiResponse<string>>(`/PurchaseInvoice/CancelInvoice?InvoiceId=${invoiceId}&CancelledBy=${encodeURIComponent(cancelledBy)}`);
        return response.data;
    },
};

