export interface SalesInvoiceItem {
    productId: number;
    productName: string;
    warehouseId: number;
    warehouseName: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface SalesInvoiceCustomer {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string;
}

export interface SalesInvoice {
    id: number;
    invoiceNumber: string;
    status: 'Pending' | 'Cancelled' | 'Completed';
    subTotal: number;
    taxPercentage: number;
    taxAmount: number;
    totalAmount: number;
    createdAt: string;
    createdBy: string;
    customer: SalesInvoiceCustomer;
    items: SalesInvoiceItem[];
    cancelledBy?: string | null;
}
