export interface PurchaseInvoiceItem {
    productId: number;
    productName: string;
    warehouseId: number;
    warehouseName: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface PurchaseInvoiceSupplier {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string;
}

export interface PurchaseInvoice {
    id: number;
    invoiceNumber: string;
    status: 'Pending' | 'Cancelled' | 'Completed';
    subTotal: number;
    taxPercentage: number;
    taxAmount: number;
    totalAmount: number;
    createdAt: string;
    createdBy: string;
    supplier: PurchaseInvoiceSupplier;
    items: PurchaseInvoiceItem[];
    cancelledBy?: string | null;
}

export interface CreatePurchaseInvoiceDto {
    supplierId: number;
    taxPercentage: number;
    createdBy: string;
    items: {
        productId: number;
        warehouseId: number;
        quantity: number;
        unitPrice: number;
    }[];
}

export interface CancelPurchaseInvoiceDto {
    invoiceId: number;
    cancelledBy: string;
}
