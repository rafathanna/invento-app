import apiClient from '../api/client';
import { ApiResponse } from '../types/customer'; // Reusing ApiResponse if compatible
import { CreateSalesInvoiceDto, CancelSalesInvoiceDto } from '../types/salesInvoice';

export const SalesInvoiceService = {
    create: async (data: CreateSalesInvoiceDto) => {
        const response = await apiClient.post<ApiResponse<number>>('/SalesInvoice/Create', data);
        return response.data;
    },

    cancel: async (invoiceId: number, cancelledBy: string) => {
        const response = await apiClient.post<ApiResponse<string>>(`/SalesInvoice/CancelInvoice?InvoiceId=${invoiceId}&CancelledBy=${encodeURIComponent(cancelledBy)}`);
        return response.data;
    },

    // Placeholder for get method mentioned by user
    getById: async (id: number) => {
        // This is a placeholder, user said endpoint coming later. 
        // Likely: /SalesInvoice/GetById/{id}
        // For now, returning null or mock if needed within app logic, 
        // but Typescript might complain if called.
        // We will assume it might be needed for the PDF if we don't pass all data manually.
        const response = await apiClient.get<ApiResponse<any>>(`/SalesInvoice/GetById?id=${id}`);
        return response.data;
    }
};
