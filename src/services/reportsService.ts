import axios from 'axios';

const API_BASE_URL = 'http://inventopro.runasp.net/Api/V1';

// ===== Types =====

// Sales Invoice Types
export interface Customer {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string;
}

export interface InvoiceItem {
    productId: number;
    productName: string;
    warehouseId: number;
    warehouseName: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface SalesInvoice {
    id: number;
    invoiceNumber: string;
    status: string;
    subTotal: number;
    taxPercentage: number;
    taxAmount: number;
    totalAmount: number;
    createdAt: string;
    createdBy: string;
    customer: Customer;
    items: InvoiceItem[];
}

export interface SalesInvoicesResponse {
    totalCount: number;
    totalAmount: number;
    invoices: SalesInvoice[];
}

// Purchase Invoice Types
export interface Supplier {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string;
}

export interface PurchaseInvoice {
    id: number;
    invoiceNumber: string;
    status: string;
    subTotal: number;
    taxPercentage: number;
    taxAmount: number;
    totalAmount: number;
    createdAt: string;
    createdBy: string;
    supplier: Supplier;
    items: InvoiceItem[];
}

export interface PurchaseInvoicesResponse {
    totalCount: number;
    totalAmount: number;
    invoices: PurchaseInvoice[];
}

// Top Products Types
export interface TopProduct {
    productId: number;
    productName: string;
    totalQuantity: number;
}

// Low Stock Types
export interface LowStockProduct {
    productId: number;
    productName: string;
    warehouseId: number;
    warehouseName: string;
    remainingQuantity: number;
    threshold: number;
}

// Slow Moving Types
export interface SlowMovingProduct {
    productId: number;
    productName: string;
    totalQuantityInStock: number;
    totalSoldQuantity: number;
    lastMovementDate: string | null;
    daysSinceLastMovement: number;
    warehouseId: number;
    warehouseName: string;
    isSlowMoving: boolean;
}

export interface SlowMovingResponse {
    totalSlowProducts: number;
    products: SlowMovingProduct[];
}

// Expiry Types
export interface ExpiredProduct {
    productId: number;
    productName: string;
    expirationDate: string;
    quantity: number;
    warehouseName: string;
}

export interface ExpiryResponse {
    totalExpiredProducts: number;
    totalNearExpiryProducts: number;
    expiredProducts: ExpiredProduct[];
    nearExpiryProducts: ExpiredProduct[];
}

// ===== Service =====

export const ReportsService = {
    // 1. Sales Invoices by Date
    getSalesInvoicesByDate: async (startDate: string, endDate: string) => {
        // Using the user-specified endpoint which appears to have a typo but is required
        const response = await axios.get(`${API_BASE_URL}/Reports/getAGetSalesInvoicesByDatell`, {
            params: { StartDate: startDate, EndDate: endDate }
        });
        return response.data;
    },

    // 2. Purchase Invoices by Date
    getPurchaseInvoicesByDate: async (startDate: string, endDate: string) => {
        const response = await axios.get(`${API_BASE_URL}/Reports/GetPurchaseInvoicesByDate`, {
            params: { StartDate: startDate, EndDate: endDate }
        });
        return response.data;
    },

    // 3. Top Sold Products
    getTopSoldProducts: async (startDate: string, endDate: string, top: number = 10) => {
        const response = await axios.get(`${API_BASE_URL}/Reports/GetTopSoldProducts`, {
            params: { StartDate: startDate, EndDate: endDate, Top: top }
        });
        return response.data;
    },

    // 4. Top Purchased Products
    getTopPurchasedProducts: async (startDate: string, endDate: string, top: number = 10) => {
        const response = await axios.get(`${API_BASE_URL}/Reports/GetTopPurchasedProducts`, {
            params: { StartDate: startDate, EndDate: endDate, Top: top }
        });
        return response.data;
    },

    // 5. Slow Moving Products
    getSlowMovingProducts: async (params?: {
        fromDate?: string;
        toDate?: string;
        warehouseId?: number;
        top?: number;
    }) => {
        const response = await axios.get(`${API_BASE_URL}/Reports/GetSlowMovingProducts`, {
            params: {
                ...(params?.fromDate && { FromDate: params.fromDate }),
                ...(params?.toDate && { ToDate: params.toDate }),
                ...(params?.warehouseId && { WarehouseId: params.warehouseId }),
                ...(params?.top && { Top: params.top })
            }
        });
        return response.data;
    },

    // 6. Low Stock Products
    getLowStockProducts: async (warehouseId?: number, warehouseName?: string) => {
        const response = await axios.get(`${API_BASE_URL}/Reports/GetLowStockProducts`, {
            params: {
                ...(warehouseId && { WarehouseId: warehouseId }),
                ...(warehouseName && { WarehouseName: warehouseName })
            }
        });
        return response.data;
    },

    // 7. Expired and Near Expiry Products
    getExpiredAndNearExpiryProducts: async (daysBeforeExpiry?: number) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/Reports/GetExpiredAndNearExpiryProducts`, {
                params: daysBeforeExpiry ? { DaysBeforeExpiry: daysBeforeExpiry } : {},
                // The API is returning 400 Bad Request even when successful with data.
                // We allow 400 so axios doesn't throw.
                validateStatus: (status) => (status >= 200 && status < 300) || status === 400
            });
            return response.data;
        } catch (error: any) {
            // Fallback: if it's still an error but has data, return it
            if (error.response?.data) return error.response.data;
            throw error;
        }
    }
};

// Helper function to format date for API (MM-DD-YYYY)
// Helper function to format date for API (MM-DD-YYYY)
export const formatDateForAPI = (date: Date | string): string => {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}-${day}-${year}`;
};

// Helper format for UI Input (YYYY-MM-DD)
export const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
};

// Helper function to get date range for UI
export const getDefaultDateRange = (days: number = 30) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return {
        startDate: formatDateForInput(startDate),
        endDate: formatDateForInput(endDate)
    };
};
