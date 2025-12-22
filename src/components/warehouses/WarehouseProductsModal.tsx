import React, { useEffect, useState } from 'react';
import { X, Search, Edit2, Check, XCircle, Package } from 'lucide-react';
import { Warehouse } from '../../types/warehouse';
import { Product } from '../../types/product';
import { ProductService } from '../../services/productService';
import { ProductWarehouseService } from '../../services/productWarehouseService';
import toast from 'react-hot-toast';
import ConfirmDialog from '../common/ConfirmDialog';

interface WarehouseProductsModalProps {
    isOpen: boolean;
    onClose: () => void;
    warehouse: Warehouse | null;
}

const WarehouseProductsModal = ({ isOpen, onClose, warehouse }: WarehouseProductsModalProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Edit State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editQuantity, setEditQuantity] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmSaveProduct, setConfirmSaveProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (isOpen && warehouse) {
            fetchProducts();
        }
    }, [isOpen, warehouse]);

    const fetchProducts = async () => {
        if (!warehouse) return;
        setIsLoading(true);
        try {
            const result = await ProductService.getByWarehouse(warehouse.id);
            if (Array.isArray(result.data)) {
                setProducts(result.data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error(error);
            toast.error('فشل تحميل المنتجات');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (product: Product) => {
        setEditingId(product.id);
        // Find quantity for this warehouse
        const pw = product.warehouses?.find(w => w.warehouseId === warehouse?.id);
        setEditQuantity(pw ? pw.quantity : 0);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditQuantity(0);
    };

    const handleSaveEdit = (product: Product) => {
        setConfirmSaveProduct(product);
    };

    const executeSave = async () => {
        if (!warehouse || !confirmSaveProduct) return;
        setIsSaving(true);
        try {
            await ProductWarehouseService.update(confirmSaveProduct.id, warehouse.id, editQuantity);
            toast.success('تم تعديل الكمية بنجاح');

            // Update local state
            setProducts(prev => prev.map(p => {
                if (p.id === confirmSaveProduct.id) {
                    const newWarehouses = p.warehouses?.map(w => {
                        if (w.warehouseId === warehouse.id) {
                            return { ...w, quantity: editQuantity };
                        }
                        return w;
                    }) || [];
                    return { ...p, warehouses: newWarehouses };
                }
                return p;
            }));

            setEditingId(null);
            setConfirmSaveProduct(null);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message;
            toast.error(msg || 'فشل تعديل الكمية');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen || !warehouse) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[80vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Package className="text-blue-600" size={20} />
                            منتجات المخزن: {warehouse.name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">عرض وتعديل كميات المنتجات</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="بحث في المنتجات..."
                            className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-gray-50/30 dark:bg-slate-900/50 p-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40">
                            <div className="w-8 h-8 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                            <p className="text-gray-500 dark:text-slate-400 text-sm">جاري تحميل المنتجات...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 dark:text-slate-400">
                            لا توجد منتجات في هذا المخزن
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-slate-300">#</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-slate-300">المنتج</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-slate-300">SKU</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-slate-300">الكمية الحالية</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-slate-300 w-32">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                    {filteredProducts.map((product, index) => {
                                        const currentQty = product.warehouses?.find(w => w.warehouseId === warehouse.id)?.quantity || 0;
                                        const isEditing = editingId === product.id;

                                        return (
                                            <tr key={product.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{index + 1}</td>
                                                <td className="px-4 py-3">
                                                    <span className="font-medium text-gray-800 dark:text-slate-200">{product.name}</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400 font-mono">{product.sku}</td>
                                                <td className="px-4 py-3">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            className="w-24 px-2 py-1 border border-blue-300 dark:border-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                                                            value={editQuantity}
                                                            onChange={(e) => setEditQuantity(Number(e.target.value))}
                                                            min="0"
                                                        />
                                                    ) : (
                                                        <span className={`font-semibold ${currentQty <= product.threshold ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-slate-200'}`}>
                                                            {currentQty}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleSaveEdit(product)}
                                                                disabled={isSaving}
                                                                className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                                                                title="حفظ"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                disabled={isSaving}
                                                                className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                                                title="إلغاء"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEditClick(product)}
                                                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors flex items-center gap-1 text-xs font-medium"
                                                        >
                                                            <Edit2 size={16} />
                                                            تعديل
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>

            <ConfirmDialog
                isOpen={!!confirmSaveProduct}
                onClose={() => setConfirmSaveProduct(null)}
                onConfirm={executeSave}
                title="تأكيد تعديل الكمية"
                message={`أنت على وشك تعديل كمية المنتج "${confirmSaveProduct?.name}" في هذا المخزن بشكل مباشر. هل أنت متأكد من هذا الإجراء؟`}
                confirmText="نعم، قم بالتعديل"
                variant="primary"
                isLoading={isSaving}
            />
        </div>
    );
};

export default WarehouseProductsModal;
