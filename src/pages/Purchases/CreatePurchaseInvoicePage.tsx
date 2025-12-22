// @ts-ignore
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Plus, Trash2, Save, Printer, FileText, User, ShoppingCart, Calculator, Warehouse as WarehouseIcon, Search, Download, Truck } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import { SupplierService } from '../../services/supplierService';
import { ProductService } from '../../services/productService';
import { WarehouseService } from '../../services/warehouseService';
import { PurchaseInvoiceService } from '../../services/purchaseInvoiceService';
import { Supplier } from '../../types/supplier';
import { Product } from '../../types/product';
import { Warehouse } from '../../types/warehouse';
import { PurchaseInvoiceTemplate } from '../../components/invoices/PurchaseInvoiceTemplate';

interface InvoiceItemRow {
    productId: number;
    productName: string;
    warehouseId: number;
    warehouseName: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

const CreatePurchaseInvoicePage = () => {
    // Data State
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [, setIsLoadingData] = useState(true);

    // Form State
    const [supplierId, setSupplierId] = useState<number>(0);
    const [taxPercentage, setTaxPercentage] = useState<number>(14);
    const [createdBy, setCreatedBy] = useState<string>('');
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItemRow[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add Item State
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(0);
    const [selectedProductId, setSelectedProductId] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(1);
    const [price, setPrice] = useState<number>(0);

    // Printing
    const [lastInvoiceData, setLastInvoiceData] = useState<any>(null);
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `PurchaseInvoice-${lastInvoiceData?.id || 'New'}`,
    });

    const handleDownloadPDF = async () => {
        if (!lastInvoiceData) {
            toast.error('لا يوجد فاتورة للتحميل');
            return;
        }

        const element = componentRef.current;
        if (!element) {
            toast.error('خطأ في تحميل القالب');
            return;
        }

        const toastId = toast.loading('جاري تجهيز ملف PDF...');

        // Create a Visible Overlay Container
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100VW';
        container.style.height = '100VH';
        container.style.zIndex = '99999';
        container.style.backgroundColor = '#ffffff';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'flex-start';
        container.style.overflow = 'hidden';

        // Clone the element
        const clone = element.cloneNode(true) as HTMLElement;

        // Ensure styling mimics A4 paper
        clone.style.width = '210mm';
        clone.style.minHeight = '297mm';
        clone.style.margin = '0';
        clone.style.backgroundColor = 'white';
        clone.style.padding = '0';
        clone.style.transform = 'scale(1)';

        container.appendChild(clone);
        document.body.appendChild(container);

        try {
            // Slight delay to ensure fonts/layout settle
            await new Promise(resolve => setTimeout(resolve, 800));

            const dataUrl = await toPng(clone, {
                quality: 1.0,
                pixelRatio: 2,
                cacheBust: true,
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`PurchaseInvoice-${lastInvoiceData.id}.pdf`);

            toast.success('تم تحميل الفاتورة بنجاح', { id: toastId });

        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('حدث خطأ أثناء إنشاء ملف PDF', { id: toastId });
        } finally {
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        }
    };

    // Load Initial Data
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingData(true);
            try {
                const [suppRes, prodRes, whRes] = await Promise.all([
                    SupplierService.getAll(),
                    ProductService.getAll(),
                    WarehouseService.getAll()
                ]);
                if (Array.isArray(suppRes.data)) setSuppliers(suppRes.data);
                if (Array.isArray(prodRes.data)) setProducts(prodRes.data);
                if (Array.isArray(whRes.data)) setWarehouses(whRes.data);
            } catch (error) {
                console.error(error);
                toast.error('فشل تحميل البيانات الأساسية');
            } finally {
                setIsLoadingData(false);
            }
        };
        loadData();
    }, []);

    // Handle Product Selection
    const handleProductChange = (prodId: number) => {
        setSelectedProductId(prodId);
        const prod = products.find(p => p.id === prodId);
        if (prod) {
            // للمشتريات نستخدم سعر البيع كأساس (يمكن تعديله)
            setPrice(prod.price);
        } else {
            setPrice(0);
        }
        setQuantity(1);
    };

    const addItem = () => {
        if (selectedWarehouseId === 0 || selectedProductId === 0) {
            toast.error('الرجاء اختيار المخزن والمنتج');
            return;
        }
        if (quantity <= 0) {
            toast.error('الكمية يجب أن تكون أكبر من صفر');
            return;
        }
        if (price <= 0) {
            toast.error('السعر يجب أن يكون أكبر من صفر');
            return;
        }

        const product = products.find(p => p.id === selectedProductId);
        const warehouse = warehouses.find(w => w.id === selectedWarehouseId);

        if (!product || !warehouse) return;

        const newItem: InvoiceItemRow = {
            productId: product.id,
            productName: product.name,
            warehouseId: warehouse.id,
            warehouseName: warehouse.name,
            quantity: quantity,
            unitPrice: price,
            total: quantity * price
        };

        setInvoiceItems([...invoiceItems, newItem]);

        // Reset Selection
        setSelectedProductId(0);
        setPrice(0);
        setQuantity(1);
    };

    const removeItem = (index: number) => {
        const newItems = [...invoiceItems];
        newItems.splice(index, 1);
        setInvoiceItems(newItems);
    };

    // Calculations
    const subTotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subTotal * taxPercentage) / 100;
    const totalAmount = subTotal + taxAmount;

    const handleSubmit = async () => {
        if (supplierId === 0) {
            toast.error('الرجاء اختيار المورد');
            return;
        }
        if (!createdBy.trim()) {
            toast.error('الرجاء إدخال اسم الموظف المسؤول');
            return;
        }
        if (invoiceItems.length === 0) {
            toast.error('لا يمكن إنشاء فاتورة فارغة');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                supplierId,
                createdBy: createdBy,
                taxPercentage,
                items: invoiceItems.map(item => ({
                    productId: item.productId,
                    warehouseId: item.warehouseId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                }))
            };

            const result = await PurchaseInvoiceService.create(payload);
            const invoiceId = typeof result.data === 'number' ? result.data : 0;

            toast.success('تم إنشاء فاتورة الشراء بنجاح');

            // Set Print Data
            setLastInvoiceData({
                id: invoiceId,
                supplierName: suppliers.find(s => s.id === supplierId)?.name || '',
                date: new Date().toLocaleDateString('ar-EG'),
                items: invoiceItems,
                subTotal,
                taxPercentage,
                taxAmount,
                totalAmount,
                createdBy: createdBy
            });

            toast.success('يمكنك الآن طباعة الفاتورة أو تحميلها');

            // Reset Form
            setInvoiceItems([]);
            setSupplierId(0);
            setCreatedBy('');
            setSelectedWarehouseId(0);

        } catch (error: any) {
            console.error('Create Invoice Error:', error);
            const msg = error.response?.data?.message || error.message || 'فشل إنشاء الفاتورة';
            const details = error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : '';
            toast.error(`${msg} ${details}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 flex flex-col gap-3">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        <span className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                            <Truck size={24} />
                        </span>
                        فاتورة شراء جديدة
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">إدارة المشتريات وإضافة المخزون</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white px-4 py-2 rounded-xl shadow-lg border border-white/20">
                    <span className="font-mono text-lg font-bold">{new Date().toLocaleDateString('ar-EG')}</span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* Right Column: Invoice Details & Items (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-hidden">

                    {/* Supplier info card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors shrink-0">
                        <h2 className="text-base font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-slate-700 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <Truck size={16} />
                            </span>
                            بيانات المورد والفاتورة
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">المورد</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white text-sm rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-transparent block p-2 pr-9"
                                        value={supplierId}
                                        onChange={(e) => setSupplierId(Number(e.target.value))}
                                    >
                                        <option value={0}>اختر المورد...</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500">
                                        <Truck size={14} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">اسم الموظف</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white text-sm rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-transparent block p-2 pl-9"
                                        value={createdBy}
                                        onChange={(e) => setCreatedBy(e.target.value)}
                                        placeholder="اسم المسؤول"
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500">
                                        <User size={14} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">نسبة الضريبة (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white text-sm rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-transparent block p-2 pl-9"
                                        value={taxPercentage}
                                        onChange={(e) => setTaxPercentage(Number(e.target.value))}
                                        min="0"
                                        step="1"
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500">
                                        <Calculator size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex-1 flex flex-col min-h-0 transition-colors">
                        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50 shrink-0">
                            <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-slate-700 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                    <ShoppingCart size={16} />
                                </span>
                                بنود الفاتورة
                            </h2>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-600 shadow-sm">
                                {invoiceItems.length} عنصر
                            </span>
                        </div>

                        {/* Scrollable Table */}
                        <div className="flex-1 overflow-y-auto overflow-x-auto">
                            <table className="w-full text-right relative">
                                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider font-bold sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 bg-gray-50 dark:bg-slate-800">المنتج</th>
                                        <th className="px-4 py-3 bg-gray-50 dark:bg-slate-800">المخزن</th>
                                        <th className="px-4 py-3 bg-gray-50 dark:bg-slate-800">السعر</th>
                                        <th className="px-4 py-3 bg-gray-50 dark:bg-slate-800">الكمية</th>
                                        <th className="px-4 py-3 bg-gray-50 dark:bg-slate-800">الإجمالي</th>
                                        <th className="px-4 py-3 w-10 bg-gray-50 dark:bg-slate-800"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-700 text-sm">
                                    {invoiceItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={6}>
                                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                                    <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-full mb-2">
                                                        <FileText size={24} />
                                                    </div>
                                                    <p>لم يتم إضافة منتجات بعد</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        invoiceItems.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-orange-50/30 dark:hover:bg-slate-700/30 transition-colors group">
                                                <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-100">{item.productName}</td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{item.warehouseName}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.unitPrice.toLocaleString()}</td>
                                                <td className="px-4 py-3">
                                                    <span className="bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded font-semibold">
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-orange-600 dark:text-orange-400">{item.total.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => removeItem(idx)}
                                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Footer */}
                        {invoiceItems.length > 0 && (
                            <div className="bg-gray-50 dark:bg-slate-700/30 p-3 border-t border-gray-100 dark:border-slate-700 shrink-0">
                                <div className="flex flex-col gap-1 max-w-xs mr-auto">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-300 text-sm">
                                        <span>المجموع الفرعي</span>
                                        <span className="font-semibold">{subTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-300 text-sm">
                                        <span>الضريبة ({taxPercentage}%)</span>
                                        <span className="font-semibold text-red-500">{taxAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-slate-600 pt-1 flex justify-between text-base font-bold text-gray-900 dark:text-white">
                                        <span>الإجمالي النهائي</span>
                                        <span>{totalAmount.toLocaleString()} ج.م</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Left Column: Add Item Tool (4 cols) */}
                <div className="lg:col-span-4 h-full overflow-y-auto pr-1">
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-xl border border-orange-100 dark:border-slate-700 transition-colors">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                    <Plus size={18} />
                                </span>
                                إضافة منتج
                            </h3>

                            <div className="space-y-3">
                                {/* Warehouse Select */}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">1. اختر المخزن (للإضافة إليه)</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white text-sm rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-transparent block p-2.5 pr-9 appearance-none transition-all"
                                            value={selectedWarehouseId}
                                            onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                                        >
                                            <option value={0}>-- اختر المخزن --</option>
                                            {warehouses.map(w => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500">
                                            <WarehouseIcon size={16} />
                                        </div>
                                    </div>
                                </div>

                                {/* Product Select */}
                                <div className={`space-y-1 transition-opacity duration-300 ${selectedWarehouseId ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">2. اختر المنتج</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white text-sm rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-transparent block p-2.5 pr-9 appearance-none transition-all"
                                            value={selectedProductId}
                                            onChange={(e) => handleProductChange(Number(e.target.value))}
                                        >
                                            <option value={0}>-- اختر المنتج --</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500">
                                            <Search size={16} />
                                        </div>
                                    </div>
                                </div>

                                {/* Price & Quantity Grid */}
                                <div className={`grid grid-cols-2 gap-3 transition-opacity duration-300 ${selectedProductId ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">سعر الشراء</label>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white text-sm rounded-lg focus:ring-1 focus:ring-orange-500 block p-2.5"
                                            value={price}
                                            onChange={(e) => setPrice(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">الكمية</label>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white text-sm rounded-lg focus:ring-1 focus:ring-orange-500 block p-2.5"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            min="1"
                                        />
                                    </div>
                                </div>

                                {/* Add Button */}
                                <button
                                    onClick={addItem}
                                    disabled={selectedProductId === 0}
                                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-base hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} />
                                    إضافة للفاتورة
                                </button>
                            </div>
                        </div>

                        {/* Main Actions */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 space-y-3 transition-colors">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || invoiceItems.length === 0}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-700 text-white py-3 rounded-xl font-bold text-base hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div> : <Save size={20} />}
                                حفظ فاتورة الشراء
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        if (lastInvoiceData) handlePrint();
                                        else toast.error('لا يوجد فاتورة للطباعة');
                                    }}
                                    className="bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Printer size={18} />
                                    طباعة
                                </button>
                                <button
                                    onClick={() => {
                                        if (lastInvoiceData) handleDownloadPDF();
                                        else toast.error('لا يوجد فاتورة للتحميل');
                                    }}
                                    className="bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Download size={18} />
                                    تحميل PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Component - Hidden from view but available for print */}
            <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
                {lastInvoiceData && (
                    <PurchaseInvoiceTemplate ref={componentRef} invoice={lastInvoiceData} />
                )}
            </div>
        </div>
    );
};

export default CreatePurchaseInvoicePage;
