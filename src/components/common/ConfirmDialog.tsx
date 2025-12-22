import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isLoading?: boolean;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary' | 'warning' | 'success';
}

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isLoading,
    confirmText = 'نعم، احذف',
    cancelText = 'إلغاء',
    variant = 'danger'
}: ConfirmDialogProps) => {
    if (!isOpen) return null;

    const getColors = () => {
        switch (variant) {
            case 'primary': return 'bg-primary-600 hover:bg-primary-700 text-white';
            case 'success': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
            case 'warning': return 'bg-amber-600 hover:bg-amber-700 text-white';
            case 'danger':
            default: return 'bg-rose-600 hover:bg-rose-700 text-white';
        }
    };

    const getIconColor = () => {
        switch (variant) {
            case 'primary': return 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400';
            case 'success': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
            case 'warning': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
            case 'danger':
            default: return 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400';
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-border">

                <div className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${getIconColor()}`}>
                        <AlertTriangle size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-content-primary mb-2">{title}</h3>
                    <p className="text-content-secondary text-sm mb-6">{message}</p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 bg-canvas hover:bg-border text-content-primary rounded-lg transition-colors font-medium disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2 ${getColors()}`}
                        >
                            {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
