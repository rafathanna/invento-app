import { useEffect, useState, useMemo } from 'react';
import {
    LayoutDashboard,
    Warehouse,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    DollarSign,
    ShoppingCart,
    Activity,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    Info,
    AlertOctagon,
    Clock,
    Calendar,
    CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { ReportsService, formatDateForAPI, getDefaultDateRange } from '../../services/reportsService';
import { WarehouseService } from '../../services/warehouseService';
import InvoiceDetailsModal from '../../components/sales/InvoiceDetailsModal';
import toast from 'react-hot-toast';

// --- Components ---

const StatCard = ({ title, value, subValue, icon: Icon, color, trend }: any) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    };

    // @ts-ignore
    const activeColor = colorClasses[color] || colorClasses.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${activeColor} transition-transform group-hover:scale-110 duration-300`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-bold ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
            <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {typeof value === 'number' ? value.toLocaleString('en-US') : value}
                </h2>
                {subValue && <span className="text-xs text-slate-400 font-medium">{subValue}</span>}
            </div>

            {/* Background decoration */}
            <div className={`absolute -bottom-4 -right-4 opacity-5 pointer-events-none text-${color}-500 transform rotate-12 group-hover:scale-150 transition-transform duration-500`}>
                <Icon size={100} />
            </div>
        </motion.div>
    );
};

// --- Page Component ---

const DashboardPage = () => {
    // Filters State
    const [dateRange, setDateRange] = useState(getDefaultDateRange(30));
    const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>(undefined);
    const [expiryDays, setExpiryDays] = useState(30);
    const [warehouses, setWarehouses] = useState<any[]>([]);

    // Data State
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // API Data
    const [salesData, setSalesData] = useState<any>(null);
    const [purchaseData, setPurchaseData] = useState<any>(null);
    const [topSold, setTopSold] = useState<any[]>([]);
    const [topPurchased, setTopPurchased] = useState<any[]>([]);
    const [slowMoving, setSlowMoving] = useState<any>(null);
    const [lowStock, setLowStock] = useState<any[]>([]);
    const [expiryData, setExpiryData] = useState<any>(null);

    // UI State
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Fetch Warehouses
    useEffect(() => {
        WarehouseService.getAll().then(res => {
            if (res.data) setWarehouses(res.data);
        });
    }, []);

    // Fetch All Data
    const fetchDashboardData = async () => {
        try {
            setRefreshing(true);
            const { startDate, endDate } = dateRange;

            // Convert to API format (MM-DD-YYYY)
            const apiStartDate = formatDateForAPI(startDate);
            const apiEndDate = formatDateForAPI(endDate);

            const results = await Promise.allSettled([
                ReportsService.getSalesInvoicesByDate(apiStartDate, apiEndDate),
                ReportsService.getPurchaseInvoicesByDate(apiStartDate, apiEndDate),
                ReportsService.getTopSoldProducts(apiStartDate, apiEndDate, 5),
                ReportsService.getTopPurchasedProducts(apiStartDate, apiEndDate, 5),
                ReportsService.getSlowMovingProducts({ fromDate: apiStartDate, toDate: apiEndDate, warehouseId: selectedWarehouse, top: 10 }),
                ReportsService.getLowStockProducts(selectedWarehouse),
                ReportsService.getExpiredAndNearExpiryProducts(expiryDays)
            ]);

            // Helper to handle results
            const getData = (result: PromiseSettledResult<any>) => result.status === 'fulfilled' ? result.value : null;

            setSalesData(getData(results[0])?.data || null);
            setPurchaseData(getData(results[1])?.data || null);
            setTopSold(getData(results[2])?.data || []);
            setTopPurchased(getData(results[3])?.data || []);
            setSlowMoving(getData(results[4])?.data || null);
            setLowStock(getData(results[5])?.data || []);
            setExpiryData(getData(results[6])?.data || null);

            console.log('Dashboard Data Loaded:', {
                sales: getData(results[0])?.data,
                purchases: getData(results[1])?.data
            });

            // Log errors for debugging
            results.forEach((res, idx) => {
                if (res.status === 'rejected') console.error(`Report ${idx} failed:`, res.reason);
            });

        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ غير متوقع');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [dateRange, selectedWarehouse, expiryDays]);

    // Derived Data for Charts
    const salesChartData = useMemo(() => {
        if (!salesData?.invoices) return [];
        // Group by Date
        const grouped = salesData.invoices.reduce((acc: any, inv: any) => {
            const date = inv.createdAt.split('T')[0];
            acc[date] = (acc[date] || 0) + inv.totalAmount;
            return acc;
        }, {});
        return Object.entries(grouped).map(([date, amount]) => ({ date, amount })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [salesData]);



    // Handlers
    const handleViewInvoice = (invoice: any) => {
        // If it's a purchase invoice (has supplier), map it to customer for the modal used (reusing the component)
        const mappedInvoice = invoice.supplier ? {
            ...invoice,
            customer: {
                ...invoice.supplier,
                address: invoice.supplier.address || 'العنوان غير مسجل'
            }
        } : invoice;

        setSelectedInvoice(mappedInvoice);
        setIsDetailsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium animate-pulse">جاري تحميل لوحة التحكم...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 lg:p-8 space-y-8 font-Cairo">

            {/* --- Header & Filters --- */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <LayoutDashboard className="text-blue-600" size={32} />
                        لوحة التحكم
                        <span className="text-sm font-normal text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600">Enterprise Edition</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">نظرة شاملة على أداء المؤسسة، المبيعات، والمخزون.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Warehouse Filter */}
                    <div className="relative group">
                        <Warehouse className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={18} />
                        <select
                            value={selectedWarehouse}
                            onChange={(e) => setSelectedWarehouse(e.target.value ? Number(e.target.value) : undefined)}
                            className="pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer min-w-[180px]"
                        >
                            <option value="">كل المخازن</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>

                    {/* Date Filters */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 p-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
                        <div className="relative">
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                className="bg-white dark:bg-slate-800 border-none rounded-lg py-1.5 px-3 text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <span className="text-slate-400 font-bold">إلى</span>
                        <div className="relative">
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                className="bg-white dark:bg-slate-800 border-none rounded-lg py-1.5 px-3 text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={() => fetchDashboardData()}
                        className={`p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all ${refreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* --- Key Statistics Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="المبيعات (الفترة الحالية)"
                    value={Number(salesData?.totalAmount || 0)}
                    subValue={`(${salesData?.totalCount || 0} فاتورة)`}
                    icon={DollarSign}
                    color="green"
                // trend={12} // Mock trend
                />
                <StatCard
                    title="المشتريات (الفترة الحالية)"
                    value={Number(purchaseData?.totalAmount || 0)}
                    subValue={`(${purchaseData?.totalCount || 0} فاتورة)`}
                    icon={ShoppingCart}
                    color="blue"
                />
                <StatCard
                    title="تنبيهات المخزون"
                    value={(lowStock.length + (expiryData?.totalExpiredProducts || 0))}
                    subValue="منتجات تحتاج انتباه"
                    icon={AlertOctagon}
                    color="red"
                />
            </div>

            {/* --- Main Content Grid --- */}
            <div className="grid grid-cols-12 gap-8">

                {/* Left Column: Charts & Sales */}
                <div className="col-span-12 lg:col-span-8 space-y-8">

                    {/* Sales Area Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">تحليل المبيعات</h3>
                                <p className="text-sm text-slate-500">أداء المبيعات خلال الفترة المحددة</p>
                            </div>
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <Activity size={20} />
                            </div>
                        </div>
                        <div className="h-[350px] w-full dir-ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                                        formatter={(value: any) => [`${value.toLocaleString()} ج.م`, 'المبيعات']}
                                        labelStyle={{ color: '#64748B', marginBottom: '0.5rem' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sales Invoice Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <FileText className="text-blue-500" size={24} />
                                أحدث فواتير المبيعات
                            </h3>
                            <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{salesData?.totalCount || 0} فاتورة</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-700">
                                        <th className="pb-4 px-4 font-bold text-slate-400 text-sm">رقم الفاتورة</th>
                                        <th className="pb-4 px-4 font-bold text-slate-400 text-sm">العميل</th>
                                        <th className="pb-4 px-4 font-bold text-slate-400 text-sm">التاريخ</th>
                                        <th className="pb-4 px-4 font-bold text-slate-400 text-sm">الإجمالي</th>
                                        <th className="pb-4 px-4 font-bold text-slate-400 text-sm">الحالة</th>
                                        <th className="pb-4 px-4 font-bold text-slate-400 text-sm text-center">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {salesData?.invoices?.slice(0, 10).map((invoice: any, idx: number) => (
                                        <tr key={idx} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                            <td className="py-4 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">#{invoice.invoiceNumber.split('-')[0]}</td>
                                            <td className="py-4 px-4 font-bold text-slate-800 dark:text-white">{invoice.customer.name}</td>
                                            <td className="py-4 px-4 text-slate-500">{new Date(invoice.createdAt).toLocaleDateString('ar-EG')}</td>
                                            <td className="py-4 px-4 font-bold text-emerald-600">{invoice.totalAmount.toLocaleString()}</td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${invoice.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    invoice.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {invoice.status === 'Completed' ? 'مكتملة' : invoice.status === 'Pending' ? 'معلقة' : 'ملغاة'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => handleViewInvoice(invoice)}
                                                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                >
                                                    <Info size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!salesData?.invoices || salesData.invoices.length === 0) && (
                                <div className="text-center py-12 text-slate-400">لا توجد فواتير مبيعات في هذه الفترة</div>
                            )}
                        </div>
                    </div>

                    {/* Slow Moving Products - Critical */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-32 bg-blue-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                    <TrendingDown className="text-amber-400" size={24} />
                                    منتجات بطيئة الحركة (Slow Moving)
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">يجب اتخاذ إجراء لتجنب الخسارة</p>
                            </div>
                            <div className="bg-white/10 px-4 py-2 rounded-xl font-bold text-amber-400 border border-white/5 backdrop-blur-sm">
                                {slowMoving?.totalSlowProducts || 0} منتج
                            </div>
                        </div>

                        <div className="overflow-x-auto relative z-10">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-300">
                                        <th className="pb-3 px-3 text-sm">المنتج</th>
                                        <th className="pb-3 px-3 text-sm">المخزن</th>
                                        <th className="pb-3 px-3 text-sm text-center">المخزون الحالي</th>
                                        <th className="pb-3 px-3 text-sm text-center">أيام الركود</th>
                                        <th className="pb-3 px-3 text-sm text-center">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slowMoving?.products?.slice(0, 5).map((p: any) => (
                                        <tr key={p.productId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-3 font-bold">{p.productName}</td>
                                            <td className="py-3 px-3 text-slate-400 text-sm">{p.warehouseName}</td>
                                            <td className="py-3 px-3 text-center text-slate-300">{p.totalQuantityInStock}</td>
                                            <td className="py-3 px-3 text-center font-mono text-amber-400 font-bold">{p.daysSinceLastMovement} يوم</td>
                                            <td className="py-3 px-3 text-center">
                                                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!slowMoving?.products || slowMoving.products.length === 0) && (
                                <div className="text-center py-8 text-slate-500 font-medium">حالة المخزون ممتازة! لا توجد منتجات راكدة.</div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column: Inventory & Purchases */}
                <div className="col-span-12 lg:col-span-4 space-y-8">

                    {/* Top Products Bar Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-green-500" />
                            الأكثر مبيعاً
                        </h3>
                        {topSold.length > 0 ? (
                            <div className="space-y-4">
                                {topSold.map((p, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{p.productName}</span>
                                            <span className="text-slate-500">{p.totalQuantity} وحدة</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${(p.totalQuantity / Math.max(...topSold.map((i: any) => i.totalQuantity))) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-400 text-sm">لا توجد بيانات متاحة</div>
                        )}
                    </div>

                    {/* Top Purchased Bar Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <ShoppingCart size={20} className="text-blue-500" />
                            الأكثر شراءً
                        </h3>
                        {topPurchased.length > 0 ? (
                            <div className="space-y-4">
                                {topPurchased.map((p, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{p.productName}</span>
                                            <span className="text-slate-500">{p.totalQuantity} وحدة</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${(p.totalQuantity / Math.max(...topPurchased.map((i: any) => i.totalQuantity))) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-400 text-sm">لا توجد بيانات متاحة</div>
                        )}
                    </div>

                    {/* Alerts Section (Low Stock & Expiry) */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white px-2">تنبيهات النظام</h3>

                        {/* Expiry Monitor Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Clock size={20} className="text-red-500" />
                                    مراقبة الصلاحية
                                </h3>
                                <select
                                    value={expiryDays}
                                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                                    className="bg-slate-50 dark:bg-slate-700 border-none rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 py-1 px-2 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                >
                                    <option value="15">15 يوم</option>
                                    <option value="30">30 يوم</option>
                                    <option value="45">45 يوم</option>
                                    <option value="60">60 يوم</option>
                                    <option value="90">90 يوم</option>
                                </select>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-2xl border border-red-100 dark:border-red-900/30 text-center">
                                    <span className="block text-2xl font-black text-red-600 dark:text-red-500">{expiryData?.totalExpiredProducts || 0}</span>
                                    <span className="text-xs font-bold text-red-600/70 dark:text-red-400">منتهية الصلاحية</span>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-center">
                                    <span className="block text-2xl font-black text-amber-600 dark:text-amber-500">{expiryData?.totalNearExpiryProducts || 0}</span>
                                    <span className="text-xs font-bold text-amber-600/70 dark:text-amber-400">توشك على الانتهاء</span>
                                </div>
                            </div>

                            {/* Lists */}
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                {/* Expired List */}
                                {expiryData?.expiredProducts?.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-red-500 flex items-center gap-1 uppercase tracking-wider">
                                            <AlertTriangle size={12} />
                                            منتهية الصلاحية
                                        </h4>
                                        {expiryData.expiredProducts.map((p: any, idx: number) => (
                                            <div key={`exp-${idx}`} className="bg-red-50 dark:bg-red-900/5 border border-red-100 dark:border-red-900/20 p-3 rounded-xl flex justify-between items-center group hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{p.productName}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                                        <Warehouse size={10} /> {p.warehouseName}
                                                    </p>
                                                </div>
                                                <div className="text-end">
                                                    <p className="text-xs font-bold text-red-600 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-red-200 dark:border-red-900/50 shadow-sm">
                                                        {new Date(p.expirationDate).toLocaleDateString('ar-EG')}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{p.quantity} وحدة</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Near Expiry List */}
                                {expiryData?.nearExpiryProducts?.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1 uppercase tracking-wider">
                                            <Calendar size={12} />
                                            قاربت على الانتهاء
                                        </h4>
                                        {expiryData.nearExpiryProducts.map((p: any, idx: number) => (
                                            <div key={`near-${idx}`} className="bg-amber-50 dark:bg-amber-900/5 border border-amber-100 dark:border-amber-900/20 p-3 rounded-xl flex justify-between items-center group hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors">
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{p.productName}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                                        <Warehouse size={10} /> {p.warehouseName}
                                                    </p>
                                                </div>
                                                <div className="text-end">
                                                    <p className="text-xs font-bold text-amber-600 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-900/50 shadow-sm">
                                                        {new Date(p.expirationDate).toLocaleDateString('ar-EG')}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{p.quantity} وحدة</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {(!expiryData?.expiredProducts?.length && !expiryData?.nearExpiryProducts?.length) && (
                                    <div className="text-center py-8">
                                        <div className="bg-green-50 dark:bg-green-900/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle2 size={24} className="text-green-500" />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">جميع المنتجات صالحة</p>
                                        <p className="text-slate-400 text-xs mt-1">لا توجد منتجات منتهية أو قاربت على الانتهاء</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Low Stock Alerts */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 text-sm">
                                <AlertOctagon size={16} className="text-orange-500" />
                                مخزون منخفض ({lowStock.length})
                            </h4>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {lowStock.length > 0 ? lowStock.map((p, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center font-bold text-lg shrink-0">
                                            {p.remainingQuantity}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{p.productName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-orange-500 rounded-full"
                                                        style={{ width: `${Math.min((p.remainingQuantity / p.threshold) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-slate-400">الحد: {p.threshold}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-slate-400 text-xs py-4">المخزون في حالة جيدة</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Purchase Summary Table (Compact) */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <ShoppingCart size={20} className="text-blue-500" />
                            أحدث المشتريات
                        </h3>
                        <div className="space-y-3">
                            {purchaseData?.invoices?.slice(0, 5).map((inv: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors" onClick={() => handleViewInvoice(inv)}>
                                    <div>
                                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{inv.supplier.name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{new Date(inv.createdAt).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-blue-600 text-sm">{inv.totalAmount.toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-400 border border-slate-200 rounded px-1 inline-block mt-0.5">#{inv.invoiceNumber.split('-')[0]}</p>
                                    </div>
                                </div>
                            ))}
                            {(!purchaseData?.invoices || purchaseData.invoices.length === 0) && (
                                <p className="text-center text-slate-400 text-xs py-4">لا توجد مشتريات حديثة</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Invoice Details Modal */}
            {selectedInvoice && (
                <InvoiceDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    invoice={selectedInvoice}
                />
            )}
        </div>
    );
};

export default DashboardPage;
