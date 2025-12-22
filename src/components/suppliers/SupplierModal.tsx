import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { CreateSupplierDto, Supplier } from '../../types/supplier';

const schema = z.object({
    name: z.string().min(2, 'الاسم مطلوب (على الأقل حرفين)'),
    phone: z.string().min(8, 'رقم الهاتف يجب أن يكون 8 أرقام على الأقل').regex(/^\d+$/, 'يجب أن يحتوي الهاتف على أرقام فقط'),
    email: z.string().email('البريد الإلكتروني غير صحيح').or(z.literal('')),
    address: z.string().min(3, 'العنوان مطلوب'),
});

type FormData = z.infer<typeof schema>;

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
    initialData?: Supplier | null;
    isLoading: boolean;
}

const SupplierModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }: SupplierModalProps) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            address: '',
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                phone: initialData.phone,
                email: initialData.email || '',
                address: initialData.address,
            });
        } else {
            reset({
                name: '',
                phone: '',
                email: '',
                address: '',
            });
        }
    }, [initialData, reset, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800">
                        {initialData ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم المورد</label>
                        <input
                            {...register('name')}
                            type="text"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            placeholder="اسم الشركة أو المورد"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                        <input
                            {...register('phone')}
                            type="text"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            placeholder="05xxxxxxxx"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                        <input
                            {...register('email')}
                            type="email"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            placeholder="supplier@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                        <textarea
                            {...register('address')}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
                            placeholder="المدينة، الحي..."
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                initialData ? 'حفظ التغييرات' : 'إضافة المورد'
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default SupplierModal;
