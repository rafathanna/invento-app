export interface ProductWarehouse {
    warehouseId: number;
    warehouseName: string;
    quantity: number;
}

export interface Product {
    id: number;
    name: string;
    sku: string;
    description: string;
    price: number;
    threshold: number;
    productionDate: string;
    expirationDate: string;
    imageUrl: string | null;
    warehouses: ProductWarehouse[];
}

export interface CreateProductDto {
    name: string;
    sku: string;
    description: string;
    price: number;
    threshold: number;
    productionDate: string;
    expirationDate: string;
    warehouseId: number;
    quantity: number;
    image?: File;
}

export interface EditProductDto {
    id: number;
    name: string;
    sku: string;
    description: string;
    price: number;
    threshold: number;
    productionDate: string;
    expirationDate: string;
    image?: File;
}
