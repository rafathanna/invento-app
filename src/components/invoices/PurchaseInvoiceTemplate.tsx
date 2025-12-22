import React from 'react';

interface PurchaseInvoicePDFProps {
    invoice: {
        id: number;
        supplierName: string;
        date: string;
        items: Array<{
            productName: string;
            warehouseName?: string;
            quantity: number;
            unitPrice: number;
            total: number;
        }>;
        subTotal: number;
        taxPercentage: number;
        taxAmount: number;
        totalAmount: number;
        createdBy: string;
    };
}

// Simple functional component to render the purchase invoice structure
// This is meant to be printed using browser's print functionality
export const PurchaseInvoiceTemplate = React.forwardRef<HTMLDivElement, PurchaseInvoicePDFProps>(({ invoice }, ref) => {
    return (
        <div ref={ref} className="p-8 bg-white text-gray-900 font-sans max-w-4xl mx-auto shadow-none" style={{ maxWidth: '210mm', minHeight: '297mm' }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-orange-600 pb-6 mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-orange-700">فاتورة شراء</h1>
                    <p className="text-gray-500 mt-2"># {invoice.id}</p>
                </div>
                <div className="text-left">
                    <h2 className="text-xl font-bold text-gray-800">Invento Pro</h2>
                    <p className="text-sm text-gray-500">نظام إدارة المخزون والمشتريات</p>
                    <p className="text-sm text-gray-500 mt-1">{invoice.date}</p>
                </div>
            </div>

            {/* Supplier Info */}
            <div className="mb-8 p-4 bg-orange-50 rounded-lg border border-orange-100">
                <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2">بيانات المورد</h3>
                <p className="text-lg font-medium text-gray-800">{invoice.supplierName}</p>
            </div>

            {/* Table */}
            <table className="w-full text-right mb-8">
                <thead>
                    <tr className="bg-orange-600 text-white">
                        <th className="py-3 px-4 font-semibold text-sm rounded-tr-lg">المنتج</th>
                        <th className="py-3 px-4 font-semibold text-sm">المخزن</th>
                        <th className="py-3 px-4 font-semibold text-sm">الكمية</th>
                        <th className="py-3 px-4 font-semibold text-sm">سعر الوحدة</th>
                        <th className="py-3 px-4 font-semibold text-sm rounded-tl-lg">الإجمالي</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {invoice.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-gray-800">{item.productName}</td>
                            <td className="py-3 px-4 text-gray-600">{item.warehouseName || '-'}</td>
                            <td className="py-3 px-4 text-gray-600">{item.quantity}</td>
                            <td className="py-3 px-4 text-gray-600">{item.unitPrice.toLocaleString()} ج.م</td>
                            <td className="py-3 px-4 font-medium text-gray-800">{item.total.toLocaleString()} ج.م</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-64 bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <div className="flex justify-between mb-2 text-gray-600">
                        <span>المجموع الفرعي:</span>
                        <span>{invoice.subTotal.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex justify-between mb-2 text-gray-600">
                        <span>الضريبة ({invoice.taxPercentage}%):</span>
                        <span>{invoice.taxAmount.toLocaleString()} ج.م</span>
                    </div>
                    <div className="border-t border-orange-200 my-2 pt-2 flex justify-between font-bold text-xl text-orange-700">
                        <span>الإجمالي:</span>
                        <span>{invoice.totalAmount.toLocaleString()} ج.م</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                <p>تم تحرير هذه الفاتورة بواسطة: {invoice.createdBy}</p>
                <p className="mt-1">فاتورة شراء - Invento Pro</p>
            </div>
        </div>
    );
});
