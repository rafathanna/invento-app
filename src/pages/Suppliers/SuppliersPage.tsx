import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, RefreshCw, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { SupplierService } from '../../services/supplierService';
import { Supplier } from '../../types/supplier';
import SupplierModal from '../../components/suppliers/SupplierModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const SuppliersPage = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete State
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Data
    const fetchSuppliers = async () => {
        setIsLoading(true);
        try {
            const result = await SupplierService.getAll();
            if (Array.isArray(result.data)) {
                setSuppliers(result.data);
            } else {
                setSuppliers([]);
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء تحميل بيانات الموردين');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    // Handlers
    const handleOpenModal = (supplier?: Supplier) => {
        setEditingSupplier(supplier || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
    };

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingSupplier) {
                await SupplierService.update({ ...data, id: editingSupplier.id });
                toast.success('تم تعديل بيانات المورد بنجاح');
            } else {
                await SupplierService.create(data);
                toast.success('تم إضافة المورد بنجاح');
            }
            handleCloseModal();
            fetchSuppliers();
        } catch (error) {
            console.error(error);
            toast.error(editingSupplier ? 'فشل تعديل المورد' : 'فشل إضافة المورد');
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
            await SupplierService.delete(deleteId);
            toast.success('تم حذف المورد بنجاح');
            setSuppliers(prev => prev.filter(c => c.id !== deleteId));
            setDeleteId(null);
        } catch (error) {
            console.error(error);
            toast.error('فشل حذف المورد');
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter Logic
    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone?.includes(searchTerm) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary">إدارة الموردين</h1>
                    <p className="text-content-secondary mt-1">قائمة الموردين والشركات الموردة</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <Plus size={20} />
                    <span>مورد جديد</span>
                </button>
            </div>

            {/* Filters & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex items-center justify-between">
                    <div>
                        <p className="text-sm text-content-secondary mb-1">إجمالي الموردين</p>
                        <h3 className="text-2xl font-bold text-content-primary">{suppliers.length}</h3>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg text-orange-600 dark:text-orange-400">
                        <Truck size={24} />
                    </div>
                </div>

                <div className="md:col-span-2 bg-card p-2 rounded-xl shadow-sm border border-border flex items-center">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted" size={20} />
                        <input
                            type="text"
                            placeholder="بحث عن مورد (الاسم، الهاتف، البريد)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-content-primary placeholder-content-muted pr-10 h-10"
                        />
                    </div>
                    <button
                        onClick={fetchSuppliers}
                        className="p-2 text-content-secondary hover:bg-canvas rounded-lg transition-colors ml-2"
                        title="تحديث البيانات"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
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
                ) : filteredSuppliers.length === 0 ? (
                    <div className="p-12 text-center text-content-secondary flex flex-col items-center">
                        <div className="bg-canvas p-4 rounded-full mb-4">
                            <Search size={32} className="text-content-muted" />
                        </div>
                        <p className="font-medium text-lg text-content-primary">لا يوجد موردين</p>
                        <p className="text-sm">لم يتم العثور على أي موردين مطابقين للبحث، أو القائمة فارغة.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-canvas border-b border-border">
                                <tr>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm">اسم المورد</th>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm">بيانات الاتصال</th>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm">العنوان</th>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm w-32">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredSuppliers.map((supplier) => (
                                    <tr key={supplier.id} className="hover:bg-canvas/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-700 dark:text-orange-400 font-bold border-2 border-surface shadow-sm">
                                                    {supplier.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-content-primary">{supplier.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-content-secondary">
                                                    <Phone size={14} className="text-content-muted" />
                                                    <span dir="ltr">{supplier.phone}</span>
                                                </div>
                                                {supplier.email && (
                                                    <div className="flex items-center gap-2 text-sm text-content-secondary">
                                                        <Mail size={14} className="text-content-muted" />
                                                        <span>{supplier.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-sm text-content-secondary max-w-[200px] truncate">
                                                <MapPin size={14} className="text-content-muted" />
                                                <span title={supplier.address}>{supplier.address || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(supplier)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(supplier.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
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

            <SupplierModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                initialData={editingSupplier}
                isLoading={isSubmitting}
            />

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="حذف المورد"
                message="هل أنت متأكد من حذف هذا المورد؟ سيتم حذف جميع الفواتير والبيانات المرتبطة به."
                isLoading={isDeleting}
            />
        </div>
    );
};

export default SuppliersPage;
