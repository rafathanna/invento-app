export interface InvoiceItemDto {
    productId: number;
    warehouseId: number;
    quantity: number;
    unitPrice: number;
}

export interface CreateSalesInvoiceDto {
    customerId: number;
    createdBy: string;
    taxPercentage: number;
    items: InvoiceItemDto[];
}

export interface CancelSalesInvoiceDto {
    invoiceId: number;
    cancelledBy: string;
}

export interface SalesInvoice {
    id: number;
    customerId: number;
    customerName?: string;
    createdBy: string;
    taxPercentage: number;
    subTotal: number;
    totalAmount: number;
    status: number; // 0: Active, 1: Cancelled (based on logic)
    date: string;
    items: SalesInvoiceItem[];
}

export interface SalesInvoiceItem {
    id: number;
    productId: number;
    productName?: string;
    warehouseId: number;
    warehouseName?: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export const InvoiceStatus = {
    Active: 1,
    Cancelled: 0 // Adjust based on actual enum if needed, usually Cancelled is a specific ID
};
