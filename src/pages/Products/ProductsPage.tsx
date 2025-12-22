import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, RefreshCw, AlertTriangle, X, Warehouse as WarehouseIcon, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductService } from '../../services/productService';
import { WarehouseService } from '../../services/warehouseService';
import { Product } from '../../types/product';
import { Warehouse } from '../../types/warehouse';
import ProductModal from '../../components/products/ProductModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Image View State
    const [viewImage, setViewImage] = useState<string | null>(null);

    // Delete State
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Warehouses
    useEffect(() => {
        const fetchWarehouses = async () => {
            setIsLoadingWarehouses(true);
            try {
                const result = await WarehouseService.getAll();
                if (Array.isArray(result.data)) {
                    setWarehouses(result.data);
                }
            } catch (error) {
                console.error(error);
                toast.error('فشل تحميل المخازن');
            } finally {
                setIsLoadingWarehouses(false);
            }
        };
        fetchWarehouses();
    }, []);

    // Fetch Products (Depends on selectedWarehouseId)
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            let result;
            if (selectedWarehouseId) {
                result = await ProductService.getByWarehouse(selectedWarehouseId);
            } else {
                result = await ProductService.getAll();
            }

            if (Array.isArray(result.data)) {
                setProducts(result.data);
            } else {
                setProducts([]);
            }
        } catch (error: any) {
            console.error('Error fetching products:', error);
            const serverMsg = error.response?.data?.message || error.response?.data?.title || error.message;
            toast.error(`فشل تحميل المنتجات: ${serverMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [selectedWarehouseId]); // Refetch when warehouse changes

    // Handlers
    const handleOpenModal = (product?: Product) => {
        setEditingProduct(product || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (data: any, image?: File) => {
        setIsSubmitting(true);
        try {
            if (editingProduct) {
                await ProductService.update({ ...data, id: editingProduct.id, image });
                toast.success('تم تعديل بيانات المنتج بنجاح');
            } else {
                await ProductService.create({ ...data, image });
                toast.success('تم إضافة المنتج بنجاح');
            }
            handleCloseModal();
            fetchProducts();
        } catch (error: any) {
            console.error(error);
            const serverMessage = error.response?.data?.message || error.response?.data?.title;
            if (error.response?.data?.errors) {
                const validationErrors = Object.values(error.response.data.errors).flat().join('\n');
                toast.error(validationErrors || 'يوجد خطأ في البيانات المدخلة');
            } else {
                toast.error(serverMessage || (editingProduct ? 'فشل تعديل المنتج' : 'فشل إضافة المنتج'));
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
            await ProductService.delete(deleteId);
            toast.success('تم حذف المنتج بنجاح');
            setProducts(prev => prev.filter(c => c.id !== deleteId));
            setDeleteId(null);
        } catch (error: any) {
            console.error(error);
            const serverMessage = error.response?.data?.message;
            if (serverMessage && serverMessage.includes("still has stock")) {
                toast.error('لا يمكن حذف المنتج لأنه لا يزال يحتوي على كميات في المخازن.');
            } else {
                toast.error(serverMessage || 'فشل حذف المنتج');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    // Helper to calculate total quantity
    const getTotalQuantity = (product: Product) => {
        return product.warehouses?.reduce((sum, w) => sum + w.quantity, 0) || 0;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ar-EG');
    };

    // Resolve Image URL
    const getImageUrl = (url: string | null) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;

        let cleanUrl = url.replace(/\\/g, '/');
        if (!cleanUrl.startsWith('/')) {
            cleanUrl = '/' + cleanUrl;
        }

        return `http://inventopro.runasp.net${cleanUrl}`;
    };

    // Filter Logic
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary">إدارة المنتجات</h1>
                    <p className="text-content-secondary mt-1">تتبع المخزون والأسعار والكميات</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <Plus size={20} />
                    <span>منتج جديد</span>
                </button>
            </div>

            {/* Warehouse Filter Tabs */}
            <div className="bg-card p-2 rounded-xl border border-border shadow-sm overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                    <button
                        onClick={() => setSelectedWarehouseId(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${selectedWarehouseId === null
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 ring-1 ring-primary-200 dark:ring-primary-800 shadow-sm'
                            : 'text-content-secondary hover:bg-canvas'
                            }`}
                    >
                        <LayoutGrid size={18} />
                        كل المخازن
                    </button>
                    <div className="w-px h-6 bg-border mx-1"></div>
                    {isLoadingWarehouses ? (
                        <div className="flex items-center gap-2 px-2 text-content-muted text-sm">
                            <RefreshCw size={14} className="animate-spin" />
                            <span>جاري تحميل المخازن...</span>
                        </div>
                    ) : (
                        warehouses.map(warehouse => (
                            <button
                                key={warehouse.id}
                                onClick={() => setSelectedWarehouseId(warehouse.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${selectedWarehouseId === warehouse.id
                                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 ring-1 ring-primary-200 dark:ring-primary-800 shadow-sm'
                                    : 'text-content-secondary hover:bg-canvas'
                                    }`}
                            >
                                <WarehouseIcon size={18} />
                                {warehouse.name}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Filters & Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">
                            {selectedWarehouseId ? `منتجات ${warehouses.find(w => w.id === selectedWarehouseId)?.name || 'المخزن'}` : 'إجمالي المنتجات'}
                        </p>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{products.length}</h3>
                    </div>
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        <Package size={28} />
                    </div>
                </div>

                <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                        <input
                            type="text"
                            placeholder="ابحث عن منتج بالاسم أو SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-700/50 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-4 pr-12 pl-4 text-slate-700 dark:text-white placeholder-slate-400 font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                        />
                    </div>
                    <button
                        onClick={fetchProducts}
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
                        <p>جاري تحميل البيانات...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-12 text-center text-content-secondary flex flex-col items-center">
                        <div className="bg-canvas p-4 rounded-full mb-4">
                            <Search size={32} className="text-content-muted" />
                        </div>
                        <p className="font-medium text-lg text-content-primary">لا يوجد منتجات</p>
                        <p className="text-sm">لم يتم العثور على أي منتجات مطابقة للبحث في {selectedWarehouseId ? 'المخزن المحدد' : 'المخزون'}.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-canvas border-b border-border">
                                <tr>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm">المنتج</th>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm hidden md:table-cell">الوصف</th>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm">السعر</th>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm">حد التنبيه</th>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm">الكمية الكلية</th>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm">تواريخ الصلاحية</th>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm w-32">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredProducts.map((product) => {
                                    const totalQty = getTotalQuantity(product);
                                    const isLowStock = totalQty <= product.threshold;
                                    const imgUrl = getImageUrl(product.imageUrl);

                                    return (
                                        <tr key={product.id} className="hover:bg-canvas/50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-12 h-12 rounded-lg bg-canvas border border-border overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                                        onClick={() => imgUrl && setViewImage(imgUrl)}
                                                    >
                                                        {imgUrl ? (
                                                            <img
                                                                src={imgUrl}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-content-muted">
                                                                <Package size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-content-primary">{product.name}</p>
                                                        <p className="text-xs text-content-secondary font-mono">{product.sku}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 hidden md:table-cell max-w-[200px]">
                                                <p className="text-sm text-content-secondary truncate" title={product.description}>
                                                    {product.description || '-'}
                                                </p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-bold text-content-primary">{product.price}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-content-secondary bg-canvas px-2 py-1 rounded text-sm font-medium">
                                                    {product.threshold}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                                                        {totalQty}
                                                    </span>
                                                    {isLowStock && (
                                                        <span title="كمية منخفضة"><AlertTriangle size={16} className="text-red-500" /></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-content-muted mt-1">موزعة على {product.warehouses?.length || 0} مخازن</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-1 text-xs text-content-secondary">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-content-muted">إنتاج:</span>
                                                        <span dir="ltr">{formatDate(product.productionDate)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-content-muted">انتهاء:</span>
                                                        <span dir="ltr" className="text-red-500 font-medium">{formatDate(product.expirationDate)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-end gap-2 transition-opacity">
                                                    <button
                                                        onClick={() => handleOpenModal(product)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(product.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Image Viewer Modal */}
            {viewImage && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setViewImage(null)}
                >
                    <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
                        <img
                            src={viewImage}
                            alt="Full View"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />
                        <button
                            onClick={() => setViewImage(null)}
                            className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors"
                        >
                            <X size={32} />
                        </button>
                    </div>
                </div>
            )}

            <ProductModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                initialData={editingProduct}
                isLoading={isSubmitting}
                warehouses={warehouses}
            />

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="حذف المنتج"
                message="هل أنت متأكد من حذف هذا المنتج؟ سيتم حذفه من جميع المخازن."
                isLoading={isDeleting}
            />
        </div>
    );
};

export default ProductsPage;
