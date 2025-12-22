export interface Customer {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
}

export interface ApiResponse<T> {
    statusCode: number;
    meta: any;
    succeeded: boolean;
    message: string;
    errors: any;
    data: T;
}

export interface CreateCustomerDto {
    name: string;
    phone: string;
    email: string;
    address: string;
}

export interface EditCustomerDto extends CreateCustomerDto {
    id: number;
}
