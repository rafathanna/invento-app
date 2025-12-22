import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload, Calendar } from 'lucide-react';
import { Product } from '../../types/product';
import { Warehouse } from '../../types/warehouse';

// Schema Validation
// Schema Validation
const schema = z.object({
    name: z.string().min(1, 'اسم المنتج مطلوب'),
    sku: z.string().optional(),
    description: z.string().optional(),
    price: z.preprocess(
        (val) => (val === '' || val === undefined ? undefined : Number(val)),
        z.number().optional()
    ),
    threshold: z.preprocess(
        (val) => (val === '' || val === undefined ? undefined : Number(val)),
        z.number().optional()
    ),
    productionDate: z.string().optional(),
    expirationDate: z.string().optional(),
    // Additional fields for Create mode only
    warehouseId: z.preprocess(
        (val) => (val === '' || val === undefined ? undefined : Number(val)),
        z.number().min(1, 'يجب اختيار المخزن')
    ),
    quantity: z.preprocess(
        (val) => (val === '' || val === undefined ? undefined : Number(val)),
        z.number().optional()
    ),
}).superRefine((data, ctx) => {
    // only validate if both are present
    if (data.productionDate && data.expirationDate) {
        const prod = new Date(data.productionDate);
        const exp = new Date(data.expirationDate);
        if (!isNaN(prod.getTime()) && !isNaN(exp.getTime()) && exp <= prod) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "تاريخ الانتهاء يجب أن يكون بعد تاريخ الإنتاج",
                path: ["expirationDate"],
            });
        }
    }
});

type FormData = z.infer<typeof schema>;

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData, image?: File) => Promise<void>;
    initialData?: Product | null;
    isLoading: boolean;
    warehouses: Warehouse[];
}

const ProductModal = ({ isOpen, onClose, onSubmit, initialData, isLoading, warehouses }: ProductModalProps) => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            price: 0,
            threshold: 10,
            quantity: 0,
            warehouseId: 0
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                sku: initialData.sku,
                description: initialData.description || '',
                price: initialData.price,
                threshold: initialData.threshold,
                productionDate: initialData.productionDate ? initialData.productionDate.split('T')[0] : '',
                expirationDate: initialData.expirationDate ? initialData.expirationDate.split('T')[0] : '',
                warehouseId: 1, // Set to 1 to bypass validation (not used in update)
                quantity: 0,    // Not editable in update usually
            });
            setPreviewUrl(initialData.imageUrl);
            setSelectedImage(null);
        } else {
            reset({
                name: '',
                sku: '',
                description: '',
                price: 0,
                threshold: 10,
                warehouseId: 0, // Default to 0 or appropriate initial value
                quantity: 0,
                productionDate: '',
                expirationDate: ''
            });
            setPreviewUrl(null);
            setSelectedImage(null);
        }
    }, [initialData, reset, isOpen]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onFormSubmit = (data: FormData) => {
        onSubmit(data, selectedImage || undefined);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        {initialData ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onFormSubmit)} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Left Column: Image & Basic Info */}
                        <div className="space-y-4">
                            {/* Image Upload */}
                            <div className="flex flex-col items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-blue-500 transition-all overflow-hidden relative">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 dark:text-slate-400">
                                            <Upload size={24} className="mb-2" />
                                            <p className="text-sm">اضغط لرفع صورة</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">اسم المنتج</label>
                                <input {...register('name')} type="text" className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none" />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">كود المنتج (SKU)</label>
                                <input {...register('sku')} type="text" className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none" />
                                {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
                            </div>
                        </div>

                        {/* Right Column: Pricing & Details */}
                        <div className="space-y-4">

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">السعر</label>
                                    <input {...register('price')} type="number" step="0.01" className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none" />
                                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">حد التنبيه</label>
                                    <input {...register('threshold')} type="number" className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none" />
                                    {errors.threshold && <p className="text-red-500 text-xs mt-1">{errors.threshold.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">تاريخ الإنتاج</label>
                                    <input {...register('productionDate')} type="date" className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none dark:[color-scheme:dark]" />
                                    {errors.productionDate && <p className="text-red-500 text-xs mt-1">{errors.productionDate.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">تاريخ الانتهاء</label>
                                    <input {...register('expirationDate')} type="date" className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none dark:[color-scheme:dark]" />
                                    {errors.expirationDate && <p className="text-red-500 text-xs mt-1">{errors.expirationDate.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">الوصف</label>
                                <textarea {...register('description')} rows={2} className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none resize-none" />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                            </div>

                            {/* Initial Stock Fields (Only Visible on Create) */}
                            {!initialData && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-2">رصيد أول المدة</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">المخزن</label>
                                            <select
                                                {...register('warehouseId')}
                                                className="w-full rounded border border-blue-200 dark:border-blue-700 px-2 py-1 text-sm focus:outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                            >
                                                <option value="">اختر المخزن...</option>
                                                {warehouses.map(w => (
                                                    <option key={w.id} value={w.id}>{w.name}</option>
                                                ))}
                                            </select>
                                            {errors.warehouseId && <p className="text-red-500 text-xs mt-1">{errors.warehouseId.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">الكمية الافتتاحية</label>
                                            <input
                                                {...register('quantity')}
                                                type="number"
                                                className="w-full rounded border border-blue-200 dark:border-blue-700 px-2 py-1 text-sm focus:outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                                placeholder="0"
                                            />
                                            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    <div className="pt-6 flex gap-3 border-t border-gray-100 dark:border-slate-700 mt-6">
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
                            {isLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {initialData ? 'حفظ التغييرات' : 'إضافة المنتج'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default ProductModal;
