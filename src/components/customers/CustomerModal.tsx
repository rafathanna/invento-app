import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { Customer, CreateCustomerDto } from '../../types/customer';

const schema = z.object({
    name: z.string().min(2, 'الاسم مطلوب (على الأقل حرفين)'),
    phone: z.string().min(8, 'رقم الهاتف مطلوب'),
    email: z.string().email('البريد الإلكتروني غير صحيح').or(z.literal('')), // View as optional if empty
    address: z.string().min(3, 'العنوان مطلوب'),
});

type FormData = z.infer<typeof schema>;

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
    initialData?: Customer | null;
    isLoading: boolean;
}

const CustomerModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }: CustomerModalProps) => {
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
            <div className="bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-border">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-canvas/50">
                    <h2 className="text-lg font-bold text-content-primary">
                        {initialData ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-border/50 rounded-full transition-colors text-content-secondary hover:text-content-primary"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-1">اسم العميل</label>
                        <input
                            {...register('name')}
                            type="text"
                            className="w-full rounded-lg border border-border bg-canvas text-content-primary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm placeholder:text-content-muted"
                            placeholder="مثال: أحمد محمد"
                        />
                        {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-1">رقم الهاتف</label>
                        <input
                            {...register('phone')}
                            type="text"
                            className="w-full rounded-lg border border-border bg-canvas text-content-primary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm placeholder:text-content-muted"
                            placeholder="05xxxxxxxx"
                        />
                        {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-1">البريد الإلكتروني</label>
                        <input
                            {...register('email')}
                            type="email"
                            className="w-full rounded-lg border border-border bg-canvas text-content-primary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm placeholder:text-content-muted"
                            placeholder="user@example.com"
                        />
                        {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-1">العنوان</label>
                        <textarea
                            {...register('address')}
                            rows={3}
                            className="w-full rounded-lg border border-border bg-canvas text-content-primary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-content-muted"
                            placeholder="المدينة، الحي..."
                        />
                        {errors.address && <p className="text-rose-500 text-xs mt-1">{errors.address.message}</p>}
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-canvas hover:bg-border text-content-primary rounded-lg transition-colors font-medium disabled:opacity-50 border border-border"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                initialData ? 'حفظ التغييرات' : 'إضافة العميل'
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CustomerModal;
