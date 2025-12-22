import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { Warehouse, CreateWarehouseDto } from '../../types/warehouse';

const schema = z.object({
    name: z.string().min(2, 'اسم المخزن مطلوب (على الأقل حرفين)'),
    location: z.string().min(3, 'الموقع مطلوب (على الأقل 3 أحرف)'),
});

type FormData = z.infer<typeof schema>;

interface WarehouseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
    initialData?: Warehouse | null;
    isLoading: boolean;
}

const WarehouseModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }: WarehouseModalProps) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            location: '',
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                location: initialData.location,
            });
        } else {
            reset({
                name: '',
                location: '',
            });
        }
    }, [initialData, reset, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        {initialData ? 'تعديل بيانات المخزن' : 'إضافة مخزن جديد'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-500 dark:text-slate-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">اسم المخزن</label>
                        <input
                            {...register('name')}
                            type="text"
                            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder-gray-400 dark:placeholder-slate-500"
                            placeholder="مثال: المخزن الرئيسي"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">الموقع</label>
                        <input
                            {...register('location')}
                            type="text"
                            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder-gray-400 dark:placeholder-slate-500"
                            placeholder="مثال: الرياض - حي الملز"
                        />
                        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-50"
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
                                initialData ? 'حفظ التغييرات' : 'إضافة المخزن'
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default WarehouseModal;
