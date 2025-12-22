import client from '../api/client';
import { SalesInvoice } from '../types/sales';

export const SalesService = {
    getAll: () => client.get<SalesInvoice[]>('/SalesInvoice/getAll'),
    getById: (id: number) => client.get<SalesInvoice>(`/SalesInvoice/${id}`),
};
