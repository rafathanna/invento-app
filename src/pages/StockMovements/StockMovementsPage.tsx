import { useEffect, useState, useRef } from 'react';
import {
    ArrowRightLeft, Search, RefreshCw, Calendar, Filter, TrendingUp, TrendingDown,
    Package, FileText, ArrowUpCircle, ArrowDownCircle, RotateCcw, Warehouse,
    Clock, ChevronDown, ChevronUp, Download, Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import { StockMovementService } from '../../services/stockMovementService';
import { WarehouseService } from '../../services/warehouseService';
import { StockMovement, WarehouseMovementReport, MovementType } from '../../types/stockMovement';
import { Warehouse as WarehouseType } from '../../types/warehouse';

const StockMovementsPage = () => {
    // Refs
    const reportRef = useRef<HTMLDivElement>(null);

    // Data States
    const [warehouseReports, setWarehouseReports] = useState<WarehouseMovementReport[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Filter States
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | ''>('');
    const [fromDate, setFromDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

    // UI States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMovementType, setSelectedMovementType] = useState<MovementType | 'all'>('all');
    const [expandedWarehouses, setExpandedWarehouses] = useState<Set<number>>(new Set());
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Fetch Warehouses on mount
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
                toast.error('فشل تحميل قائمة المخازن');
            } finally {
                setIsLoadingWarehouses(false);
            }
        };
        fetchWarehouses();
    }, []);

    // Fetch Report
    const fetchReport = async () => {
        if (!fromDate || !toDate) {
            toast.error('يرجى تحديد نطاق التاريخ');
            return;
        }

        setIsLoading(true);
        try {
            // Format dates as MM-DD-YYYY for API
            const formatDate = (dateStr: string) => {
                const [year, month, day] = dateStr.split('-');
                return `${month}-${day}-${year}`;
            };

            const result = await StockMovementService.getReport({
                warehouseId: selectedWarehouseId || undefined,
                fromDate: formatDate(fromDate),
                toDate: formatDate(toDate),
            });

            if (result.data?.warehouses) {
                setWarehouseReports(result.data.warehouses);
                // Auto-expand all warehouses
                setExpandedWarehouses(new Set(result.data.warehouses.map(w => w.warehouseId)));
            } else {
                setWarehouseReports([]);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'فشل تحميل تقرير حركة المخازن');
        } finally {
            setIsLoading(false);
        }
    };

    // Print Handler
    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `تقرير حركة المخازن - ${new Date().toLocaleDateString('ar-EG')}`,
        onBeforePrint: async () => {
            // Expand all warehouses before printing
            setExpandedWarehouses(new Set(warehouseReports.map(w => w.warehouseId)));
        },
    });

    // Export to PDF using html2pdf.js
    const handleExportPDF = async () => {
        if (!reportRef.current || warehouseReports.length === 0) {
            toast.error('لا توجد بيانات للتصدير');
            return;
        }

        setIsExporting(true);

        // Expand all warehouses before export
        setExpandedWarehouses(new Set(warehouseReports.map(w => w.warehouseId)));

        // Wait for DOM update
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const element = reportRef.current;
            const fileName = `تقرير-حركة-المخازن-${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.pdf`;

            const options = {
                margin: [10, 10, 10, 10],
                filename: fileName,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    letterRendering: true,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'landscape' as const,
                    compress: true,
                },
                pagebreak: {
                    mode: ['avoid-all', 'css', 'legacy'],
                    before: '.page-break-before',
                    after: '.page-break-after',
                    avoid: ['tr', 'thead', '.avoid-break'],
                },
            };

            await html2pdf().set(options).from(element).save();

            toast.success('تم تصدير التقرير بنجاح');
        } catch (error) {
            console.error(error);
            toast.error('فشل تصدير التقرير');
        } finally {
            setIsExporting(false);
        }
    };



    // Toggle warehouse expansion
    const toggleWarehouse = (warehouseId: number) => {
        setExpandedWarehouses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(warehouseId)) {
                newSet.delete(warehouseId);
            } else {
                newSet.add(warehouseId);
            }
            return newSet;
        });
    };

    // Get movement type details
    const getMovementTypeInfo = (type: MovementType) => {
        switch (type) {
            case MovementType.PurchaseIn:
                return {
                    label: 'وارد (شراء)',
                    color: 'text-emerald-600 dark:text-emerald-400',
                    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                    border: 'border-emerald-200 dark:border-emerald-800',
                    icon: ArrowDownCircle,
                    printColor: '#059669',
                };
            case MovementType.SalesOut:
                return {
                    label: 'صادر (مبيعات)',
                    color: 'text-rose-600 dark:text-rose-400',
                    bg: 'bg-rose-50 dark:bg-rose-900/20',
                    border: 'border-rose-200 dark:border-rose-800',
                    icon: ArrowUpCircle,
                    printColor: '#e11d48',
                };
            case MovementType.Transfer:
                return {
                    label: 'تحويل',
                    color: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    border: 'border-blue-200 dark:border-blue-800',
                    icon: ArrowRightLeft,
                    printColor: '#2563eb',
                };
            case MovementType.Adjustment:
                return {
                    label: 'تعديل/تسوية',
                    color: 'text-amber-600 dark:text-amber-400',
                    bg: 'bg-amber-50 dark:bg-amber-900/20',
                    border: 'border-amber-200 dark:border-amber-800',
                    icon: RotateCcw,
                    printColor: '#d97706',
                };
            default:
                return {
                    label: 'غير معروف',
                    color: 'text-gray-600',
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    icon: Package,
                    printColor: '#6b7280',
                };
        }
    };

    // Format date/time
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
            time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        };
    };

    // Format date for display
    const formatDateDisplay = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Filter movements
    const filterMovements = (movements: StockMovement[]) => {
        let filtered = movements;

        // Filter by movement type
        if (selectedMovementType !== 'all') {
            filtered = filtered.filter(m => m.movementType === selectedMovementType);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(m =>
                m.productName.toLowerCase().includes(term) ||
                m.invoiceNumber?.toLowerCase().includes(term) ||
                m.notes?.toLowerCase().includes(term)
            );
        }

        // Sort by date
        filtered = [...filtered].sort((a, b) => {
            const dateA = new Date(a.movementDate).getTime();
            const dateB = new Date(b.movementDate).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    };

    // Calculate totals
    const calculateTotals = () => {
        return warehouseReports.reduce((acc, warehouse) => ({
            totalMovements: acc.totalMovements + warehouse.totalMovements,
            inCount: acc.inCount + warehouse.inCount,
            outCount: acc.outCount + warehouse.outCount,
            transferCount: acc.transferCount + warehouse.transferCount,
            adjustCount: acc.adjustCount + warehouse.adjustCount,
        }), { totalMovements: 0, inCount: 0, outCount: 0, transferCount: 0, adjustCount: 0 });
    };

    const totals = calculateTotals();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <ArrowRightLeft size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-content-primary">حركة المخازن</h1>
                        <p className="text-content-secondary mt-1">تتبع جميع حركات الوارد والصادر والتعديلات</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePrint()}
                        disabled={warehouseReports.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-content-secondary hover:bg-canvas transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Printer size={18} />
                        طباعة
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={warehouseReports.length === 0 || isExporting}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <RefreshCw size={18} className="animate-spin" />
                        ) : (
                            <Download size={18} />
                        )}
                        تصدير PDF
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 print:hidden">
                <div className="flex items-center gap-2 mb-4 text-content-primary font-semibold">
                    <Filter size={18} />
                    خيارات البحث والفلترة
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Warehouse Select */}
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-content-secondary mb-2">
                            <Warehouse size={14} className="inline ml-1" />
                            المخزن
                        </label>
                        <select
                            value={selectedWarehouseId}
                            onChange={(e) => setSelectedWarehouseId(e.target.value ? Number(e.target.value) : '')}
                            className="w-full bg-canvas border border-border rounded-xl px-4 py-2.5 text-content-primary focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            disabled={isLoadingWarehouses}
                        >
                            <option value="">جميع المخازن</option>
                            {warehouses.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* From Date */}
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-content-secondary mb-2">
                            <Calendar size={14} className="inline ml-1" />
                            من تاريخ
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full bg-canvas border border-border rounded-xl px-4 py-2.5 text-content-primary focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                    </div>

                    {/* To Date */}
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-content-secondary mb-2">
                            <Calendar size={14} className="inline ml-1" />
                            إلى تاريخ
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full bg-canvas border border-border rounded-xl px-4 py-2.5 text-content-primary focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                    </div>

                    {/* Movement Type */}
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-content-secondary mb-2">
                            <ArrowRightLeft size={14} className="inline ml-1" />
                            نوع الحركة
                        </label>
                        <select
                            value={selectedMovementType}
                            onChange={(e) => setSelectedMovementType(e.target.value === 'all' ? 'all' : Number(e.target.value) as MovementType)}
                            className="w-full bg-canvas border border-border rounded-xl px-4 py-2.5 text-content-primary focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        >
                            <option value="all">جميع الأنواع</option>
                            <option value={MovementType.PurchaseIn}>وارد (شراء)</option>
                            <option value={MovementType.SalesOut}>صادر (مبيعات)</option>
                            <option value={MovementType.Transfer}>تحويل</option>
                            <option value={MovementType.Adjustment}>تعديل/تسوية</option>
                        </select>
                    </div>

                    {/* Search Button */}
                    <div className="lg:col-span-1 flex items-end">
                        <button
                            onClick={fetchReport}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <RefreshCw size={18} className="animate-spin" />
                            ) : (
                                <Search size={18} />
                            )}
                            بحث
                        </button>
                    </div>
                </div>

                {/* Search in Results */}
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="relative max-w-md">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted" size={18} />
                        <input
                            type="text"
                            placeholder="بحث في النتائج (المنتج، رقم الفاتورة، الملاحظات)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-canvas border border-border rounded-xl pl-4 pr-10 py-2.5 text-content-primary placeholder-content-muted focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            {warehouseReports.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:hidden">
                    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-content-secondary mb-1">إجمالي الحركات</p>
                                <p className="text-2xl font-bold text-content-primary">{totals.totalMovements}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                <ArrowRightLeft size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-content-secondary mb-1">وارد (شراء)</p>
                                <p className="text-2xl font-bold text-emerald-600">{totals.inCount}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-content-secondary mb-1">صادر (مبيعات)</p>
                                <p className="text-2xl font-bold text-rose-600">{totals.outCount}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                <TrendingDown size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-content-secondary mb-1">تحويلات</p>
                                <p className="text-2xl font-bold text-blue-600">{totals.transferCount}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <ArrowRightLeft size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-content-secondary mb-1">تعديلات</p>
                                <p className="text-2xl font-bold text-amber-600">{totals.adjustCount}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <RotateCcw size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Printable Report Area */}
            <div ref={reportRef} className="space-y-4 print:p-4 print:bg-white" style={{ direction: 'rtl', fontFamily: 'Arial, Tahoma, sans-serif' }}>
                {/* PDF/Print Header - Professional Design - Shows when exporting or printing */}
                {warehouseReports.length > 0 && (isExporting || false) && (
                    <div className="bg-white p-6 mb-6 rounded-lg border border-gray-200" id="pdf-header" style={{ fontFamily: 'Arial, Tahoma, sans-serif' }}>
                        {/* Company Header */}
                        <div className="flex items-center justify-between border-b-4 border-blue-600 pb-4 mb-4">
                            <div className="flex items-center gap-4">
                                {/* Company Logo */}
                                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                                    IP
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">InventoPro</h1>
                                    <p className="text-sm text-gray-500">نظام إدارة المخازن المتكامل</p>
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-gray-500">تاريخ التقرير</p>
                                <p className="text-lg font-bold text-gray-800">
                                    {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Report Title */}
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">تقرير حركة المخازن</h2>
                            <div className="inline-flex items-center gap-2 bg-gray-100 px-6 py-2 rounded-full">
                                <span className="text-gray-600">الفترة من</span>
                                <span className="font-bold text-blue-600">{formatDateDisplay(fromDate)}</span>
                                <span className="text-gray-600">إلى</span>
                                <span className="font-bold text-blue-600">{formatDateDisplay(toDate)}</span>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-5 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">إجمالي الحركات</p>
                                <p className="text-2xl font-bold text-gray-800">{totals.totalMovements}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                                <p className="text-xs text-green-600 mb-1">وارد (شراء)</p>
                                <p className="text-2xl font-bold text-green-600">{totals.inCount}</p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                                <p className="text-xs text-red-600 mb-1">صادر (مبيعات)</p>
                                <p className="text-2xl font-bold text-red-600">{totals.outCount}</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                                <p className="text-xs text-blue-600 mb-1">تحويلات</p>
                                <p className="text-2xl font-bold text-blue-600">{totals.transferCount}</p>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                                <p className="text-xs text-yellow-600 mb-1">تعديلات</p>
                                <p className="text-2xl font-bold text-yellow-600">{totals.adjustCount}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {warehouseReports.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-12 text-center print:hidden">
                        <div className="w-16 h-16 mx-auto bg-canvas rounded-full flex items-center justify-center mb-4">
                            <ArrowRightLeft size={32} className="text-content-muted" />
                        </div>
                        <h3 className="text-lg font-semibold text-content-primary mb-2">
                            {isLoading ? 'جاري تحميل البيانات...' : 'لا توجد بيانات للعرض'}
                        </h3>
                        <p className="text-content-secondary max-w-md mx-auto">
                            {isLoading ? 'يرجى الانتظار...' : 'اختر المخزن والفترة الزمنية ثم اضغط على زر البحث لعرض حركة المخازن'}
                        </p>
                    </div>
                ) : (
                    warehouseReports.map(warehouse => {
                        const isExpanded = expandedWarehouses.has(warehouse.warehouseId);
                        const filteredMovements = filterMovements(warehouse.movements);

                        return (
                            <div key={warehouse.warehouseId} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden print:shadow-none print:border-gray-300 print:rounded-none print:mb-8">
                                {/* Warehouse Header */}
                                <div
                                    className="flex items-center justify-between p-4 bg-canvas/50 cursor-pointer hover:bg-canvas transition-colors print:bg-gray-100 print:cursor-default"
                                    onClick={() => toggleWarehouse(warehouse.warehouseId)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 print:bg-blue-100 print:text-blue-600">
                                            <Warehouse size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-content-primary print:text-gray-800">{warehouse.warehouseName}</h3>
                                            <p className="text-sm text-content-secondary print:text-gray-600">
                                                {warehouse.totalMovements} حركة
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {/* Quick Stats */}
                                        <div className="hidden md:flex items-center gap-4 print:flex">
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 print:bg-emerald-50">
                                                <TrendingUp size={14} />
                                                <span className="font-medium">{warehouse.inCount}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 print:bg-rose-50">
                                                <TrendingDown size={14} />
                                                <span className="font-medium">{warehouse.outCount}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 print:bg-amber-50">
                                                <RotateCcw size={14} />
                                                <span className="font-medium">{warehouse.adjustCount}</span>
                                            </div>
                                        </div>

                                        <button className="p-2 rounded-lg hover:bg-canvas transition-colors print:hidden">
                                            {isExpanded ? (
                                                <ChevronUp size={20} className="text-content-secondary" />
                                            ) : (
                                                <ChevronDown size={20} className="text-content-secondary" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Movements Table */}
                                {(isExpanded || true) && (
                                    <div className={`border-t border-border print:block ${isExpanded ? 'block' : 'hidden print:block'}`}>
                                        {/* Sort Controls */}
                                        <div className="flex items-center justify-between px-4 py-2 bg-canvas/30 border-b border-border print:hidden">
                                            <span className="text-sm text-content-secondary">
                                                عرض {filteredMovements.length} من {warehouse.movements.length} حركة
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                                                }}
                                                className="flex items-center gap-2 text-sm text-content-secondary hover:text-content-primary transition-colors"
                                            >
                                                <Clock size={14} />
                                                {sortOrder === 'desc' ? 'الأحدث أولاً' : 'الأقدم أولاً'}
                                            </button>
                                        </div>

                                        {filteredMovements.length === 0 ? (
                                            <div className="p-8 text-center text-content-secondary print:hidden">
                                                لا توجد حركات تطابق معايير البحث
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-right print:text-sm">
                                                    <thead className="bg-canvas/50 border-b border-border print:bg-gray-50">
                                                        <tr>
                                                            <th className="py-3 px-4 text-xs font-semibold text-content-secondary uppercase tracking-wider print:text-gray-600">#</th>
                                                            <th className="py-3 px-4 text-xs font-semibold text-content-secondary uppercase tracking-wider print:text-gray-600">المنتج</th>
                                                            <th className="py-3 px-4 text-xs font-semibold text-content-secondary uppercase tracking-wider print:text-gray-600">نوع الحركة</th>
                                                            <th className="py-3 px-4 text-xs font-semibold text-content-secondary uppercase tracking-wider print:text-gray-600">الكمية</th>
                                                            <th className="py-3 px-4 text-xs font-semibold text-content-secondary uppercase tracking-wider print:text-gray-600">التاريخ والوقت</th>
                                                            <th className="py-3 px-4 text-xs font-semibold text-content-secondary uppercase tracking-wider print:text-gray-600">رقم الفاتورة</th>
                                                            <th className="py-3 px-4 text-xs font-semibold text-content-secondary uppercase tracking-wider print:text-gray-600 min-w-[200px]">الملاحظات</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border print:divide-gray-200">
                                                        {filteredMovements.map((movement, index) => {
                                                            const typeInfo = getMovementTypeInfo(movement.movementType);
                                                            const Icon = typeInfo.icon;
                                                            const { date, time } = formatDateTime(movement.movementDate);

                                                            return (
                                                                <tr key={movement.movementId} className="hover:bg-canvas/50 transition-colors print:hover:bg-transparent">
                                                                    <td className="py-3 px-4">
                                                                        <span className="text-xs font-mono text-content-muted print:text-gray-500">{index + 1}</span>
                                                                    </td>
                                                                    <td className="py-3 px-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-8 h-8 rounded-lg bg-canvas flex items-center justify-center print:hidden">
                                                                                <Package size={14} className="text-content-muted" />
                                                                            </div>
                                                                            <p className="font-medium text-content-primary print:text-gray-800">{movement.productName}</p>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 px-4">
                                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${typeInfo.bg} ${typeInfo.color} border ${typeInfo.border} print:border-0`}>
                                                                            <Icon size={12} />
                                                                            {typeInfo.label}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-3 px-4">
                                                                        <span className={`text-lg font-bold ${movement.movementType === MovementType.PurchaseIn
                                                                            ? 'text-emerald-600'
                                                                            : movement.movementType === MovementType.SalesOut
                                                                                ? 'text-rose-600'
                                                                                : 'text-amber-600'
                                                                            }`}>
                                                                            {movement.movementType === MovementType.SalesOut ? '-' : '+'}{movement.quantity}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-3 px-4">
                                                                        <div className="text-sm">
                                                                            <p className="text-content-primary font-medium print:text-gray-800">{date}</p>
                                                                            <p className="text-xs text-content-muted flex items-center gap-1 print:text-gray-500">
                                                                                <Clock size={10} className="print:hidden" />
                                                                                {time}
                                                                            </p>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 px-4">
                                                                        {movement.invoiceNumber ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <FileText size={14} className="text-content-muted print:hidden" />
                                                                                <span className="text-xs font-mono text-content-primary bg-canvas px-2 py-1 rounded print:bg-transparent print:text-gray-800">
                                                                                    {movement.invoiceNumber}
                                                                                </span>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-content-muted text-xs print:text-gray-400">—</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-3 px-4">
                                                                        <p className="text-sm text-content-secondary max-w-[250px] print:max-w-none print:text-gray-600" title={movement.notes || ''}>
                                                                            {movement.notes || '—'}
                                                                        </p>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}

                {/* Print Footer */}
                <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                    <p>تم إنشاء هذا التقرير بتاريخ {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>
        </div>
    );
};

export default StockMovementsPage;
