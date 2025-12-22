// Stock Movement Types
export interface StockMovement {
    movementId: number;
    productId: number;
    productName: string;
    movementType: MovementType;
    quantity: number;
    movementDate: string;
    invoiceId: number | null;
    invoiceNumber: string | null;
    notes: string | null;
}

export enum MovementType {
    PurchaseIn = 1,
    SalesOut = 2,
    Transfer = 3,
    Adjustment = 4,
}

export interface WarehouseMovementReport {
    warehouseId: number;
    warehouseName: string;
    totalMovements: number;
    inCount: number;
    outCount: number;
    transferCount: number;
    adjustCount: number;
    movements: StockMovement[];
}

export interface StockMovementReportResponse {
    warehouses: WarehouseMovementReport[];
}

export interface StockMovementFilters {
    warehouseId?: number;
    fromDate: string;
    toDate: string;
}
