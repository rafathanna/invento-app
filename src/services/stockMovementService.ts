import apiClient from '../api/client';
import { ApiResponse } from '../types/customer';
import { StockMovementReportResponse, StockMovementFilters } from '../types/stockMovement';

export const StockMovementService = {
    getReport: async (filters: StockMovementFilters) => {
        const params = new URLSearchParams();

        if (filters.warehouseId) {
            params.append('WarehouseId', filters.warehouseId.toString());
        }
        params.append('FromDate', filters.fromDate);
        params.append('ToDate', filters.toDate);

        const response = await apiClient.get<ApiResponse<StockMovementReportResponse>>(
            `/Reports/GetStockMovementReport?${params.toString()}`
        );
        return response.data;
    },
};
