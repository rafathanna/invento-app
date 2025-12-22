import { useEffect, useState } from 'react';
import { Search, Filter, Eye, FileText, Calendar, RefreshCw, XCircle, AlertTriangle, Truck, Plus } from 'lucide-react';
import { PurchaseInvoiceService } from '../../services/purchaseInvoiceService';
import { PurchaseInvoice } from '../../types/purchase';
import toast from 'react-hot-toast';
import PurchaseInvoiceDetailsModal from '../../components/purchases/PurchaseInvoiceDetailsModal';
import { Link } from 'react-router-dom';

const PurchaseInvoicesPage = () => {
    const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed' | 'Cancelled'>('All');

    // Cancel Modal State
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [invoiceToCancel, setInvoiceToCancel] = useState<PurchaseInvoice | null>(null);
    const [cancelledByName, setCancelledByName] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    const fetchInvoices = async () => {
        setIsLoading(true);
        try {
            const response = await PurchaseInvoiceService.getAll();
            if (response.data && Array.isArray(response.data)) {
                // Sort by date descending (newest first)
                const sorted = response.data.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setInvoices(sorted);
            } else {
                setInvoices([]);
            }
        } catch (error) {
            console.error(error);
            toast.error('فشل تحميل فواتير الشراء');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleViewInvoice = (invoice: PurchaseInvoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleCancelClick = (invoice: PurchaseInvoice) => {
        setInvoiceToCancel(invoice);
        setCancelledByName('');
        setIsCancelModalOpen(true);
    };

    const confirmCancelInvoice = async () => {
        if (!invoiceToCancel) return;
        if (!cancelledByName.trim()) {
            toast.error('الرجاء إدخال اسم الموظف المسؤول عن الإلغاء');
            return;
        }

        setIsCancelling(true);
        try {
            await PurchaseInvoiceService.cancel(invoiceToCancel.id, cancelledByName);
            toast.success('تم إلغاء الفاتورة بنجاح');

            // Optimistically update the UI
            setInvoices(prev => prev.map(inv =>
                inv.id === invoiceToCancel.id
                    ? { ...inv, status: 'Cancelled' as const, cancelledBy: cancelledByName }
                    : inv
            ));

            setIsCancelModalOpen(false);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'فشل إلغاء الفاتورة';
            toast.error(msg);
        } finally {
            setIsCancelling(false);
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch =
            invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const styles = {
            Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-emerald-600/20',
            Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 ring-1 ring-amber-600/20',
            Cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 ring-1 ring-rose-600/20',
        };
        const labels = {
            Completed: 'مكتملة',
            Pending: 'قيد الانتظار',
            Cancelled: 'ملغاة',
        };
        const key = status as keyof typeof styles;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[key] || 'bg-gray-100 text-gray-800'}`}>
                {labels[key] || status}
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                        <Truck size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-content-primary">فواتير المشتريات</h1>
                        <p className="text-content-secondary mt-1">سجل كامل لجميع عمليات الشراء والفواتير الواردة</p>
                    </div>
                </div>
                <Link
                    to="/purchases/create"
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-orange-500/20"
                >
                    <Plus size={20} />
                    فاتورة شراء جديدة
                </Link>
            </div>

            {/* Filters & Stats */}
            <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted" size={20} />
                    <input
                        type="text"
                        placeholder="بحث برقم الفاتورة أو اسم المورد..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-canvas border border-border rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-content-primary placeholder-content-muted transition-all"
                    />
                </div>

                <div className="flex gap-4">
                    <div className="relative min-w-[160px]">
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted" size={18} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full bg-canvas border border-border rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-content-primary appearance-none cursor-pointer"
                        >
                            <option value="All">جميع الحالات</option>
                            <option value="Completed">مكتملة</option>
                            <option value="Pending">قيد الانتظار</option>
                            <option value="Cancelled">ملغاة</option>
                        </select>
                    </div>

                    <button
                        onClick={fetchInvoices}
                        className="p-2.5 text-content-secondary hover:bg-canvas rounded-lg border border-border transition-colors hover:text-orange-600"
                        title="تحديث البيانات"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                {isLoading && invoices.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-content-secondary">جاري تحميل فواتير الشراء...</p>
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="bg-canvas p-4 rounded-full mb-4">
                            <FileText size={32} className="text-content-muted" />
                        </div>
                        <h3 className="text-lg font-medium text-content-primary mb-1">لا توجد فواتير</h3>
                        <p className="text-content-secondary">لم يتم العثور على فواتير تطابق بحثك</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-right">
                            <thead className="bg-canvas/50 border-b border-border">
                                <tr>
                                    <th className="py-4 px-6 text-sm font-semibold text-content-secondary">رقم الفاتورة</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-content-secondary">المورد</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-content-secondary">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-orange-600">
                                            <Calendar size={16} />
                                            التاريخ
                                        </div>
                                    </th>
                                    <th className="py-4 px-6 text-sm font-semibold text-content-secondary">عدد الأصناف</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-content-secondary">الإجمالي</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-content-secondary">الحالة</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-content-secondary text-left">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="group hover:bg-canvas/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <span className="font-mono text-content-primary font-medium">#{invoice.invoiceNumber}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                                    <Truck size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-content-primary">{invoice.supplier.name}</div>
                                                    <div className="text-xs text-content-secondary font-mono mt-0.5">{invoice.supplier.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-content-secondary text-sm">
                                            {new Date(invoice.createdAt).toLocaleDateString('ar-EG')}
                                            <span className="block text-xs opacity-70 mt-0.5">
                                                {new Date(invoice.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                                {invoice.items?.length || 0} صنف
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-bold text-content-primary">{invoice.totalAmount.toLocaleString()} ج.م</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col items-center gap-1.5">
                                                {getStatusBadge(invoice.status)}
                                                {invoice.status === 'Cancelled' && (invoice.cancelledBy || (invoice as any).CancelledBy) && (
                                                    <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                                        بواسطة: {invoice.cancelledBy || (invoice as any).CancelledBy}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleViewInvoice(invoice)}
                                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                                                >
                                                    <Eye size={16} />
                                                    عرض
                                                </button>

                                                {invoice.status !== 'Cancelled' && (
                                                    <button
                                                        onClick={() => handleCancelClick(invoice)}
                                                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                                        title="إلغاء الفاتورة"
                                                    >
                                                        <XCircle size={16} />
                                                        إلغاء
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer with counts */}
                <div className="bg-canvas/30 px-6 py-4 border-t border-border flex justify-between items-center text-sm text-content-secondary">
                    <span>عدد الفواتير: {filteredInvoices.length}</span>
                    <span>الإجمالي الكلي: <span className="font-bold text-content-primary">{filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString()} ج.م</span></span>
                </div>
            </div>

            <PurchaseInvoiceDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                invoice={selectedInvoice}
            />

            {/* Cancel Confirmation Modal */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 text-rose-600 mb-4">
                            <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-full">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-content-primary">تأكيد إلغاء الفاتورة</h3>
                        </div>

                        <p className="text-content-secondary mb-6">
                            هل أنت متأكد من رغبتك في إلغاء فاتورة الشراء رقم <span className="font-mono font-bold text-content-primary mx-1">{invoiceToCancel?.invoiceNumber}</span>؟
                            لا يمكن التراجع عن هذا الإجراء.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-content-primary mb-2">اسم الموظف المسؤول عن الإلغاء</label>
                            <input
                                type="text"
                                className="w-full bg-canvas border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-content-primary"
                                placeholder="أدخل اسمك..."
                                value={cancelledByName}
                                onChange={(e) => setCancelledByName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmCancelInvoice}
                                disabled={isCancelling}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-bold transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {isCancelling ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div> : <XCircle size={18} />}
                                تأكيد الإلغاء
                            </button>
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                disabled={isCancelling}
                                className="flex-1 bg-canvas border border-border hover:bg-gray-50 dark:hover:bg-slate-700 text-content-primary py-2.5 rounded-xl font-bold transition-colors"
                            >
                                تراجع
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseInvoicesPage;
