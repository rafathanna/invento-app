export interface Supplier {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
}

export interface CreateSupplierDto {
    name: string;
    phone: string;
    email: string;
    address: string;
}

export interface EditSupplierDto extends CreateSupplierDto {
    id: number;
}
