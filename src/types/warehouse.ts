export interface Warehouse {
    id: number;
    name: string;
    location: string;
}

export interface CreateWarehouseDto {
    name: string;
    location: string;
}

export interface EditWarehouseDto extends CreateWarehouseDto {
    id: number;
}

export interface ApiResponse<T> {
    statusCode: number;
    meta: any;
    succeeded: boolean;
    message: string;
    errors: any;
    data: T;
}
