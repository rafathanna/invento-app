import React from 'react';
import { SalesInvoice, SalesInvoiceItem } from '../../types/salesInvoice';
import { Customer } from '../../types/customer';
import { Product } from '../../types/product';

interface InvoicePDFProps {
    invoice: {
        id: number;
        customerName: string;
        date: string;
        items: Array<{
            productName: string;
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

// Simple functional component to render the invoice structure
// This is meant to be printed using browser's print functionality
export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoicePDFProps>(({ invoice }, ref) => {
    return (
        <div ref={ref} className="p-8 bg-white text-gray-900 font-sans max-w-4xl mx-auto shadow-none" style={{ maxWidth: '210mm', minHeight: '297mm' }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-800">فاتورة مبيعات</h1>
                    <p className="text-gray-500 mt-2"># {invoice.id}</p>
                </div>
                <div className="text-left">
                    <h2 className="text-xl font-bold text-gray-800">Invento Pro</h2>
                    <p className="text-sm text-gray-500">نظام إدارة المخزون والمبيعات</p>
                    <p className="text-sm text-gray-500 mt-1">{invoice.date}</p>
                </div>
            </div>

            {/* Customer Info */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">بيانات العميل</h3>
                <p className="text-lg font-medium text-gray-800">{invoice.customerName}</p>
            </div>

            {/* Table */}
            <table className="w-full text-right mb-8">
                <thead>
                    <tr className="bg-gray-800 text-white">
                        <th className="py-3 px-4 font-semibold text-sm rounded-tr-lg">المنتج</th>
                        <th className="py-3 px-4 font-semibold text-sm">الكمية</th>
                        <th className="py-3 px-4 font-semibold text-sm">سعر الوحدة</th>
                        <th className="py-3 px-4 font-semibold text-sm rounded-tl-lg">الإجمالي</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {invoice.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-gray-800">{item.productName}</td>
                            <td className="py-3 px-4 text-gray-600">{item.quantity}</td>
                            <td className="py-3 px-4 text-gray-600">{item.unitPrice.toLocaleString()} ج.م</td>
                            <td className="py-3 px-4 font-medium text-gray-800">{item.total.toLocaleString()} ج.م</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-64 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between mb-2 text-gray-600">
                        <span>المجموع الفرعي:</span>
                        <span>{invoice.subTotal.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex justify-between mb-2 text-gray-600">
                        <span>الضريبة ({invoice.taxPercentage}%):</span>
                        <span>{invoice.taxAmount.toLocaleString()} ج.م</span>
                    </div>
                    <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold text-xl text-gray-800">
                        <span>الإجمالي:</span>
                        <span>{invoice.totalAmount.toLocaleString()} ج.م</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                <p>تم تحرير هذه الفاتورة بواسطة: {invoice.createdBy}</p>
                <p className="mt-1">شكرًا لتعاملكم معنا</p>
            </div>
        </div>
    );
});
