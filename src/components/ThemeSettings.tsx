import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';

export default function ThemeSettings() {
    const { mode, setMode, colorTheme, setColorTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const themes = [
        { name: 'default', label: 'السماء', color: 'bg-[#0ea5e9]' },
        { name: 'emerald', label: 'الزمرد', color: 'bg-emerald-500' },
        { name: 'violet', label: 'البنفسج', color: 'bg-violet-500' },
        { name: 'amber', label: 'العنبر', color: 'bg-amber-500' },
        { name: 'rose', label: 'الورد', color: 'bg-rose-500' },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700"
                title="إعدادات المظهر"
            >
                <Palette size={20} />
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* Mode Selection */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <Monitor size={16} />
                            وضع العرض
                        </h3>
                        <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-slate-900 p-1 rounded-xl">
                            <button
                                onClick={() => setMode('light')}
                                className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium transition-all ${mode === 'light'
                                    ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Sun size={16} />
                                فاتح
                            </button>
                            <button
                                onClick={() => setMode('dark')}
                                className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium transition-all ${mode === 'dark'
                                    ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Moon size={16} />
                                داكن
                            </button>
                            <button
                                onClick={() => setMode('system')}
                                className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium transition-all ${mode === 'system'
                                    ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Monitor size={16} />
                                تلقائي
                            </button>
                        </div>
                    </div>

                    {/* Color Theme Selection */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <Palette size={16} />
                            لون النظام
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                            {themes.map((t) => (
                                <button
                                    key={t.name}
                                    onClick={() => setColorTheme(t.name as any)}
                                    className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${t.color} ${colorTheme === t.name ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-slate-900 scale-110' : 'hover:scale-110 opacity-80 hover:opacity-100'}`}
                                    title={t.label}
                                >
                                    {colorTheme === t.name && (
                                        <Check size={14} className="text-white" strokeWidth={3} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
