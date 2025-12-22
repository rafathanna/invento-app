import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { CustomerService } from '../../services/customerService';
import { Customer } from '../../types/customer';
import CustomerModal from '../../components/customers/CustomerModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const CustomersPage = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete State
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Data
    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const result = await CustomerService.getAll();
            if (Array.isArray(result.data)) {
                setCustomers(result.data);
            } else {
                setCustomers([]);
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء تحميل بيانات العملاء');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Handlers
    const handleOpenModal = (customer?: Customer) => {
        setEditingCustomer(customer || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingCustomer) {
                await CustomerService.update({ ...data, id: editingCustomer.id });
                toast.success('تم تعديل بيانات العميل بنجاح');
            } else {
                await CustomerService.create(data);
                toast.success('تم إضافة العميل بنجاح');
            }
            handleCloseModal();
            fetchCustomers();
        } catch (error) {
            console.error(error);
            toast.error(editingCustomer ? 'فشل تعديل العميل' : 'فشل إضافة العميل');
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
            await CustomerService.delete(deleteId);
            toast.success('تم حذف العميل بنجاح');
            setCustomers(prev => prev.filter(c => c.id !== deleteId));
            setDeleteId(null);
        } catch (error) {
            console.error(error);
            toast.error('فشل حذف العميل');
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter Logic
    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary">إدارة العملاء</h1>
                    <p className="text-content-secondary mt-1">عرض وإدارة قاعدة بيانات العملاء</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 font-medium"
                >
                    <Plus size={20} />
                    <span>عميل جديد</span>
                </button>
            </div>

            {/* Filters & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex items-center justify-between">
                    <div>
                        <p className="text-sm text-content-secondary mb-1">إجمالي العملاء</p>
                        <h3 className="text-2xl font-bold text-content-primary">{customers.length}</h3>
                    </div>
                    <div className="bg-primary-50 dark:bg-primary-900/20 p-2 rounded-lg text-primary-600 dark:text-primary-400">
                        <AlertCircle size={24} />
                    </div>
                </div>

                <div className="md:col-span-2 bg-card p-2 rounded-xl shadow-sm border border-border flex items-center">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted" size={20} />
                        <input
                            type="text"
                            placeholder="بحث عن عميل (الاسم، الهاتف، البريد)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-content-primary placeholder-content-muted pr-10 h-10"
                        />
                    </div>
                    <button
                        onClick={fetchCustomers}
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
                ) : filteredCustomers.length === 0 ? (
                    <div className="p-12 text-center text-content-secondary flex flex-col items-center">
                        <div className="bg-canvas p-4 rounded-full mb-4">
                            <Search size={32} className="text-content-muted" />
                        </div>
                        <p className="font-medium text-lg text-content-primary">لا يوجد عملاء</p>
                        <p className="text-sm">لم يتم العثور على أي عملاء مطابقين للبحث، أو القائمة فارغة.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-canvas border-b border-border">
                                <tr>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm">اسم العميل</th>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm">بيانات الاتصال</th>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm">العنوان</th>
                                    <th className="py-4 px-6 font-semibold text-content-secondary text-sm w-32">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-canvas/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold border-2 border-surface shadow-sm">
                                                    {customer.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-content-primary">{customer.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-content-secondary">
                                                    <Phone size={14} className="text-content-muted" />
                                                    <span dir="ltr">{customer.phone}</span>
                                                </div>
                                                {customer.email && (
                                                    <div className="flex items-center gap-2 text-sm text-content-secondary">
                                                        <Mail size={14} className="text-content-muted" />
                                                        <span>{customer.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-sm text-content-secondary max-w-[200px] truncate">
                                                <MapPin size={14} className="text-content-muted" />
                                                <span title={customer.address}>{customer.address || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(customer)}
                                                    className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(customer.id)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
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
            {customers.length > 0 && (
                <div className="flex justify-between items-center mt-4 text-sm text-content-secondary">
                    <p>عرض {filteredCustomers.length} من أصل {customers.length} عميل</p>
                </div>
            )}

            <CustomerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                initialData={editingCustomer}
                isLoading={isSubmitting}
            />

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="حذف العميل"
                message="هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع البيانات المرتبطة به."
                isLoading={isDeleting}
            />
        </div>
    );
};

export default CustomersPage;
