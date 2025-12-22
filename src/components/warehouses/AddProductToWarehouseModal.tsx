import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Search, PackagePlus, AlertCircle } from 'lucide-react';
import { Product } from '../../types/product';
import { Warehouse } from '../../types/warehouse';
import { ProductService } from '../../services/productService';
import toast from 'react-hot-toast';

const schema = z.object({
    productId: z.number({ required_error: 'يجب اختيار منتج' }).min(1, 'يجب اختيار منتج'),
    quantity: z.number({ required_error: 'الكمية مطلوبة' }).min(1, 'الكمية يجب أن تكون 1 على الأقل'),
});

type FormData = z.infer<typeof schema>;

interface AddProductToWarehouseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
    warehouse: Warehouse | null;
    isLoading: boolean;
}

const AddProductToWarehouseModal = ({ isOpen, onClose, onSubmit, warehouse, isLoading }: AddProductToWarehouseModalProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Form setup
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            quantity: 1,
            productId: 0
        }
    });

    const selectedProductId = watch('productId');
    const selectedProduct = products.find(p => p.id === selectedProductId);

    // Fetch products on open
    useEffect(() => {
        if (isOpen) {
            const fetchProducts = async () => {
                setLoadingProducts(true);
                try {
                    const result = await ProductService.getAll();
                    if (Array.isArray(result.data)) {
                        setProducts(result.data);
                    }
                } catch (error) {
                    console.error(error);
                    toast.error('فشل تحميل قائمة المنتجات');
                } finally {
                    setLoadingProducts(false);
                }
            };
            fetchProducts();
            reset({ quantity: 1, productId: 0 });
            setSearchTerm('');
        }
    }, [isOpen, reset]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen || !warehouse) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <PackagePlus className="text-blue-600" size={20} />
                            إضافة منتجات للمخزن
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            المخزن: <span className="font-semibold text-gray-700 dark:text-slate-300">{warehouse.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-500 dark:text-slate-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1">

                    {/* Search Product */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">1. اختر المنتج</label>
                        <div className="relative mb-2">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="ابحث باسم المنتج أو الكود..."
                                className="w-full pl-3 pr-9 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-slate-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Product List */}
                        <div className="border border-gray-200 dark:border-slate-600 rounded-lg max-h-48 overflow-y-auto bg-gray-50/50 dark:bg-slate-800/50">
                            {loadingProducts ? (
                                <div className="p-4 text-center text-gray-500 dark:text-slate-400 text-sm">جاري التحميل...</div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 dark:text-slate-400 text-sm">لا توجد منتجات مطابقة</div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {filteredProducts.map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => setValue('productId', product.id, { shouldValidate: true })}
                                            className={`p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${selectedProductId === product.id ? 'bg-blue-50 dark:bg-slate-700 ring-1 ring-blue-200 dark:ring-blue-800' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500 dark:text-slate-400">
                                                    {product.sku.slice(0, 3) || '#'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{product.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">{product.sku}</p>
                                                </div>
                                            </div>
                                            {selectedProductId === product.id && (
                                                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {errors.productId && <p className="text-red-500 text-xs mt-1">{errors.productId.message}</p>}
                    </div>

                    {/* Quantity Input */}
                    {selectedProduct && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-white dark:bg-slate-800 p-2 rounded shadow-sm">
                                        <PackagePlus className="text-blue-600 dark:text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-slate-200">{selectedProduct.name}</h4>
                                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">سيتم إضافة الكمية إلى مخزون {warehouse.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">2. تحديد الكمية</label>
                                <input
                                    {...register('quantity', { valueAsNumber: true })}
                                    type="number"
                                    min="1"
                                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-50"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading || !selectedProductId}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <PackagePlus size={18} />
                                <span>تأكيد الإضافة</span>
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddProductToWarehouseModal;
