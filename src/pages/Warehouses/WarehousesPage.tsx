import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, RefreshCw, Warehouse as WarehouseIcon, PackagePlus, Boxes } from 'lucide-react';
import toast from 'react-hot-toast';
import { WarehouseService } from '../../services/warehouseService';
import { ProductService } from '../../services/productService';
import { ProductWarehouseService } from '../../services/productWarehouseService';
import { Warehouse } from '../../types/warehouse';
import WarehouseModal from '../../components/warehouses/WarehouseModal';
import AddProductToWarehouseModal from '../../components/warehouses/AddProductToWarehouseModal';
import WarehouseProductsModal from '../../components/warehouses/WarehouseProductsModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const WarehousesPage = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Warehouse Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add Product Modal State
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [selectedWarehouseForProduct, setSelectedWarehouseForProduct] = useState<Warehouse | null>(null);
    const [isAddingProduct, setIsAddingProduct] = useState(false);

    // View Products Modal State
    const [isViewProductsOpen, setIsViewProductsOpen] = useState(false);
    const [viewProductsWarehouse, setViewProductsWarehouse] = useState<Warehouse | null>(null);

    // Delete State
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Data
    const fetchWarehouses = async () => {
        setIsLoading(true);
        try {
            const result = await WarehouseService.getAll();
            if (Array.isArray(result.data)) {
                setWarehouses(result.data);
            } else {
                setWarehouses([]);
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء تحميل بيانات المخازن');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    // Handlers
    const handleOpenModal = (warehouse?: Warehouse) => {
        setEditingWarehouse(warehouse || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingWarehouse(null);
    };

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingWarehouse) {
                await WarehouseService.update({ ...data, id: editingWarehouse.id });
                toast.success('تم تعديل بيانات المخزن بنجاح');
            } else {
                await WarehouseService.create(data);
                toast.success('تم إضافة المخزن بنجاح');
            }
            handleCloseModal();
            fetchWarehouses();
        } catch (error: any) {
            console.error(error);
            const serverMessage = error.response?.data?.message;
            if (serverMessage) {
                toast.error(serverMessage);
            } else {
                toast.error(editingWarehouse ? 'فشل تعديل المخزن' : 'فشل إضافة المخزن');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            // Check if warehouse has products
            const productsResult = await ProductService.getByWarehouse(deleteId);
            if (productsResult.data && Array.isArray(productsResult.data) && productsResult.data.length > 0) {
                toast.error('لا يمكن حذف هذا المخزن لأنه يحتوي على منتجات. يرجى نقل المنتجات أو حذفها أولاً.');
                setDeleteId(null); // Close dialog
                return;
            }

            await WarehouseService.delete(deleteId);
            toast.success('تم حذف المخزن بنجاح');
            setWarehouses(prev => prev.filter(w => w.id !== deleteId));
            setDeleteId(null);
        } catch (error: any) {
            console.error(error);
            const serverMessage = error.response?.data?.message;
            if (serverMessage) {
                toast.error(serverMessage);
            } else {
                toast.error('فشل حذف المخزن');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    // Add Product Handlers
    const handleOpenAddProduct = (warehouse: Warehouse) => {
        setSelectedWarehouseForProduct(warehouse);
        setIsAddProductOpen(true);
    };

    const handleCloseAddProduct = () => {
        setIsAddProductOpen(false);
        setSelectedWarehouseForProduct(null);
    };

    const handleAddProductSubmit = async (data: any) => {
        if (!selectedWarehouseForProduct) return;
        setIsAddingProduct(true);
        try {
            await ProductWarehouseService.add({
                warehouseId: selectedWarehouseForProduct.id,
                productId: data.productId,
                quantity: data.quantity
            });
            toast.success('تم إضافة المنتج للمخزن بنجاح');
            handleCloseAddProduct();
        } catch (error: any) {
            console.error(error);
            const serverMessage = error.response?.data?.message;
            toast.error(serverMessage || 'فشل إضافة المنتج للمخزن');
        } finally {
            setIsAddingProduct(false);
        }
    };

    // View Products Handlers
    const handleOpenViewProducts = (warehouse: Warehouse) => {
        setViewProductsWarehouse(warehouse);
        setIsViewProductsOpen(true);
    };

    const handleCloseViewProducts = () => {
        setIsViewProductsOpen(false);
        setViewProductsWarehouse(null);
    };

    // Filter Logic
    const filteredWarehouses = warehouses.filter(warehouse =>
        warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-content-primary tracking-tight">إدارة المخازن</h1>
                    <p className="text-content-secondary mt-2 text-base font-medium">عرض وإدارة جميع المخازن والفروع</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-bold text-base"
                >
                    <Plus size={22} />
                    <span>مخزن جديد</span>
                </button>
            </div>

            {/* Stats & Search Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between group hover:border-blue-200 dark:hover:border-blue-800/50 transition-colors">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">إجمالي المخازن</p>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{warehouses.length}</h3>
                    </div>
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <WarehouseIcon size={28} />
                    </div>
                </div>

                <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                        <input
                            type="text"
                            placeholder="ابحث عن مخزن بالاسم أو الموقع..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-700/50 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-4 pr-12 pl-4 text-slate-700 dark:text-white placeholder-slate-400 font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                        />
                    </div>
                    <button
                        onClick={fetchWarehouses}
                        className="p-4 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                        title="تحديث البيانات"
                    >
                        <RefreshCw size={24} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-content-secondary flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-base font-semibold">جاري تحميل البيانات...</p>
                    </div>
                ) : filteredWarehouses.length === 0 ? (
                    <div className="p-12 text-center text-content-secondary flex flex-col items-center">
                        <div className="bg-canvas p-4 rounded-full mb-4">
                            <Search size={32} className="text-content-muted" />
                        </div>
                        <p className="font-bold text-xl text-content-primary mb-1">لا يوجد مخازن</p>
                        <p className="text-base font-medium">لم يتم العثور على أي مخازن مطابقة للبحث، أو القائمة فارغة.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-canvas border-b border-border">
                                <tr>
                                    <th className="py-4 px-6 font-bold text-content-secondary text-base tracking-wide">اسم المخزن</th>
                                    <th className="py-4 px-6 font-bold text-content-secondary text-base tracking-wide">الموقع</th>
                                    <th className="py-4 px-6 font-bold text-content-secondary text-base tracking-wide min-w-[300px]">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredWarehouses.map((warehouse) => (
                                    <tr key={warehouse.id} className="hover:bg-canvas/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-700 dark:text-orange-400 font-bold border-2 border-surface shadow-sm">
                                                    {warehouse.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-content-primary text-base">{warehouse.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-base text-content-secondary">
                                                <MapPin size={16} className="text-content-muted" />
                                                <span className="font-medium">{warehouse.location}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenViewProducts(warehouse)}
                                                    className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors border border-purple-200 dark:border-purple-800/50 flex items-center gap-1.5 text-xs font-bold"
                                                    title="عرض وتعديل المنتجات"
                                                >
                                                    <Boxes size={14} />
                                                    جرد/تعديل
                                                </button>
                                                <button
                                                    onClick={() => handleOpenAddProduct(warehouse)}
                                                    className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors border border-green-200 dark:border-green-800/50 flex items-center gap-1.5 text-xs font-bold"
                                                    title="إضافة منتجات للمخزن"
                                                >
                                                    <PackagePlus size={14} />
                                                    إضافة مخزون
                                                </button>
                                                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                                <button
                                                    onClick={() => handleOpenModal(warehouse)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="تعديل بيانات المخزن"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(warehouse.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="حذف المخزن"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Placeholder */}
            {warehouses.length > 0 && (
                <div className="flex justify-between items-center mt-4 text-base text-content-secondary">
                    <p className="font-semibold">عرض {filteredWarehouses.length} من أصل {warehouses.length} مخزن</p>
                </div>
            )}

            <WarehouseModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                initialData={editingWarehouse}
                isLoading={isSubmitting}
            />

            <AddProductToWarehouseModal
                isOpen={isAddProductOpen}
                onClose={handleCloseAddProduct}
                onSubmit={handleAddProductSubmit}
                warehouse={selectedWarehouseForProduct}
                isLoading={isAddingProduct}
            />

            <WarehouseProductsModal
                isOpen={isViewProductsOpen}
                onClose={handleCloseViewProducts}
                warehouse={viewProductsWarehouse}
            />

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="حذف المخزن"
                message="هل أنت متأكد من حذف هذا المخزن؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع البيانات المرتبطة به."
                isLoading={isDeleting}
            />
        </div>
    );
};

export default WarehousesPage;

