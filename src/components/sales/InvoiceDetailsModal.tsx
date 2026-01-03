import React, { useRef, useState } from 'react';
import { X, Printer, FileText, Download, Building2, Phone, Mail, MapPin, User, Hash, Calendar, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { SalesInvoice } from '../../types/sales';
import { useReactToPrint } from 'react-to-print';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

interface InvoiceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: SalesInvoice | null;
}

const InvoiceDetailsModal = ({ isOpen, onClose, invoice }: InvoiceDetailsModalProps) => {
    const printRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // @ts-ignore - content property exists in runtime
    const handlePrint = useReactToPrint({
        // @ts-ignore
        content: () => printRef.current,
        documentTitle: invoice ? `Invoice-${invoice.invoiceNumber}` : 'Invoice',
    });

    const handleDownloadPDF = async () => {
        if (!printRef.current || !invoice) return;

        setIsDownloading(true);
        const loadToast = toast.loading('جاري تحضير ملف PDF...');

        try {
            const dataUrl = await toPng(printRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: '#ffffff'
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
            toast.success('تم تحميل الفاتورة بنجاح', { id: loadToast });
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('حدث خطأ أثناء تحميل الفاتورة', { id: loadToast });
        } finally {
            setIsDownloading(false);
        }
    };

    if (!isOpen || !invoice) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-GB'), // DD/MM/YYYY for international format
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const { date, time } = formatDate(invoice.createdAt);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-hidden">
            <div className="bg-card w-full max-w-5xl h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border animate-in zoom-in-95 duration-200">

                {/* Toolbar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white z-20 shadow-sm relative">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">معاينة الفاتورة</h2>
                            <p className="text-xs text-gray-500 font-mono tracking-wide">{invoice.invoiceNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="p-2.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-all border border-transparent hover:border-gray-200 flex items-center gap-2 disabled:opacity-50"
                            title="تحميل كملف PDF"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline text-sm font-medium">PDF</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="p-2.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-all border border-transparent hover:border-gray-200 flex items-center gap-2"
                            title="طباعة الفاتورة"
                        >
                            <Printer size={18} />
                            <span className="hidden sm:inline text-sm font-medium">طباعة</span>
                        </button>
                        <div className="w-px h-8 bg-gray-200 mx-1"></div>
                        <button
                            onClick={onClose}
                            className="p-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex items-center justify-center"
                            title="إغلاق"
                        >
                            <X size={22} className="stroke-[2.5]" />
                        </button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-slate-900/50 p-4 sm:p-8 flex justify-center">

                    {/* INVOICE DOCUMENT - A4 Aspect Ratio */}
                    <div
                        ref={printRef}
                        className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] shadow-xl relative flex flex-col"
                        style={{ direction: 'rtl' }}
                    >
                        {/* Top Accent Line */}
                        <div className="h-2 w-full bg-slate-900"></div>

                        <div className="p-12 flex-1 flex flex-col">

                            {/* Header Section */}
                            <div className="flex justify-between items-start mb-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-bold text-3xl rounded-xl">I</div>
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">InventoPro</h1>
                                        <p className="text-slate-500 text-sm mt-1">تكنولوجيا إدارة الأعمال المتقدمة</p>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <h2 className="text-5xl font-black text-slate-100 uppercase tracking-widest leading-none">INVOICE</h2>
                                    <p className="text-slate-400 font-medium mt-2 tracking-widest text-sm">ORIGINAL COPY</p>
                                </div>
                            </div>

                            {/* Info Strip */}
                            <div className="flex justify-between items-stretch border-y border-slate-200 mb-12 bg-slate-50/50">
                                <div className="flex-1 p-4 border-l border-slate-100">
                                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">رقم الفاتورة</p>
                                    <div className="flex items-center gap-2">
                                        <Hash size={16} className="text-slate-400" />
                                        <p className="font-bold text-slate-900 font-mono text-lg">{invoice.invoiceNumber}</p>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 border-l border-slate-100">
                                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">تاريخ الإصدار</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-slate-400" />
                                        <p className="font-bold text-slate-900">{date}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 dark:text-slate-400 flex items-center gap-1">
                                        <Clock size={10} />
                                        {time}
                                    </p>
                                </div>
                                <div className="flex-1 p-4 border-l border-slate-100">
                                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">المرجع (Ref)</p>
                                    <p className="font-bold text-slate-900 font-mono">#{invoice.id.toString().padStart(4, '0')}</p>
                                </div>
                                <div className="flex-1 p-4">
                                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">الحالة</p>
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${invoice.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                        invoice.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                        {invoice.status === 'Completed' ? <CheckCircle2 size={12} /> :
                                            invoice.status === 'Pending' ? <AlertCircle size={12} /> :
                                                <XCircle size={12} />}
                                        {invoice.status === 'Completed' ? 'مدفوعة' : invoice.status === 'Pending' ? 'معلقة' : 'ملغاة'}
                                    </div>
                                    {invoice.status === 'Cancelled' && (invoice.cancelledBy || (invoice as any).CancelledBy) && (
                                        <div className="flex items-center gap-1 mt-1.5 text-red-600 bg-red-50 px-2 py-1 rounded text-[10px] font-bold border border-red-100 w-fit mx-auto">
                                            <span className="opacity-70">تم الإلغاء بواسطة:</span>
                                            <span>{invoice.cancelledBy || (invoice as any).CancelledBy}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Addresses */}
                            <div className="grid grid-cols-2 gap-16 mb-12">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                        <Building2 size={16} />
                                        من (المورد)
                                    </h3>
                                    <div className="text-slate-600 space-y-1.5 text-sm">
                                        <p className="font-bold text-slate-900 text-lg">شركة InventoPro للحلول</p>
                                        <p>مبنى 45، شارع التسعين الشمالي</p>
                                        <p>القاهرة الجديدة، التجمع الخامس</p>
                                        <p>القاهرة، مصر</p>
                                        <p className="mt-3 flex items-center gap-2">
                                            <Phone size={14} /> +20 123 456 7890
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Mail size={14} /> sales@inventopro.com
                                        </p>
                                        <p className="mt-2 text-xs text-slate-400">سجل تجاري: 123456789 | بطاقة ضريبية: 987-654-321</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                        <User size={16} />
                                        إلى (العميل)
                                    </h3>
                                    <div className="text-slate-600 space-y-1.5 text-sm bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <p className="font-bold text-slate-900 text-lg">{invoice.customer.name}</p>
                                        <p className="whitespace-pre-line flex items-start gap-2">
                                            <MapPin size={14} className="mt-1 shrink-0" />
                                            {invoice.customer.address || 'لا يوجد عنوان مسجل'}
                                        </p>
                                        <p className="mt-3 flex items-center gap-2 font-mono">
                                            <Phone size={14} /> {invoice.customer.phone}
                                        </p>
                                        {invoice.customer.email && (
                                            <p className="flex items-center gap-2">
                                                <Mail size={14} /> {invoice.customer.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="mb-8">
                                <table className="w-full text-right border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-slate-900">
                                            <th className="py-4 px-2 font-bold text-slate-900 w-12 text-center text-sm uppercase">#</th>
                                            <th className="py-4 px-2 font-bold text-slate-900 text-sm uppercase">تفاصيل المنتج</th>
                                            <th className="py-4 px-2 font-bold text-slate-900 text-sm uppercase w-32 text-center">المخزن</th>
                                            <th className="py-4 px-2 font-bold text-slate-900 text-sm uppercase w-24 text-center">الكمية</th>
                                            <th className="py-4 px-2 font-bold text-slate-900 text-sm uppercase w-32 text-center">سعر الوحدة</th>
                                            <th className="py-4 px-2 font-bold text-slate-900 text-sm uppercase w-36 text-left">الإجمالي</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {invoice.items.map((item, index) => (
                                            <tr key={index} className="border-b border-slate-200">
                                                <td className="py-4 px-2 text-center text-slate-500 font-mono">{index + 1}</td>
                                                <td className="py-4 px-2">
                                                    <p className="font-bold text-slate-900 text-base">{item.productName}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">كود المنتج: SKU-{item.productId}</p>
                                                </td>
                                                <td className="py-4 px-2 text-center text-slate-600">{item.warehouseName}</td>
                                                <td className="py-4 px-2 text-center">
                                                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">{item.quantity}</span>
                                                </td>
                                                <td className="py-4 px-2 text-center text-slate-600 font-mono">{item.unitPrice.toLocaleString()}</td>
                                                <td className="py-4 px-2 text-left font-bold text-slate-900 font-mono bg-slate-50/50">{item.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer Section */}
                            <div className="grid grid-cols-12 gap-8 mt-4">

                                {/* Notes / Left Side */}
                                <div className="col-span-12 md:col-span-7 space-y-8">

                                    {/* Created By Info */}
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 inline-block min-w-[50%]">
                                        <p className="text-xs font-bold uppercase text-slate-400 mb-2">معلومات إضافية</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">تم الإنشاء بواسطة</p>
                                                <p className="font-bold text-slate-800">{invoice.createdBy || 'System Admin'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Terms */}
                                    <div className="text-xs text-slate-500 leading-relaxed max-w-md">
                                        <p className="font-bold text-slate-900 mb-1 uppercase">الشروط والأحكام:</p>
                                        <ul className="list-disc pr-4 space-y-1">
                                            <li>البضاعة المباعة لا ترد ولا تستبدل بعد 14 يوم من تاريخ الفاتورة.</li>
                                            <li>يجب إحضار أصل الفاتورة عند الاستبدال أو الاسترجاع.</li>
                                            <li>تطبق الشروط والأحكام الخاصة بجهاز حماية المستهلك.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Financials / Right Side */}
                                <div className="col-span-12 md:col-span-5">
                                    <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-slate-300 text-sm">
                                                <span>المجموع الفرعي (Subtotal)</span>
                                                <span className="font-mono">{invoice.subTotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-slate-300 text-sm">
                                                <span>الضريبة (Tax {invoice.taxPercentage}%)</span>
                                                <span className="font-mono text-emerald-400">+ {invoice.taxAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="h-px bg-slate-700 my-2"></div>
                                            <div className="flex justify-between items-end">
                                                <span className="font-bold text-lg">الإجمالي النهائي</span>
                                                <div className="text-right">
                                                    <span className="block text-3xl font-bold tracking-tight">{invoice.totalAmount.toLocaleString()}</span>
                                                    <span className="text-xs text-slate-400 uppercase font-medium">جنية مصري EGP</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="bg-slate-50 border-t border-slate-200 p-8 flex justify-between items-center text-xs text-slate-400">
                            <p>Thank you for your business!</p>
                            <p className="font-mono">Generated by InventoPro System</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailsModal;
