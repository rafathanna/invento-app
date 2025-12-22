
import { useState, useEffect } from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeSettings from '../components/ThemeSettings';

interface HeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (arg: boolean) => void;
}

// Searchable Pages Configuration
const APP_PAGES = [
    { name: 'لوحة التحكم', path: '/', category: 'عام', keywords: ['رئيسية', 'dashboard', 'home'] },
    { name: 'العملاء', path: '/customers', category: 'المبيعات', keywords: ['عميل', 'customers', 'client'] },
    { name: 'الموردين', path: '/suppliers', category: 'المشتريات', keywords: ['مورد', 'suppliers', 'vendor'] },
    { name: 'المنتجات', path: '/products', category: 'المخزون', keywords: ['منتج', 'proucts', 'stock', 'item'] },
    { name: 'المخازن', path: '/warehouses', category: 'المخزون', keywords: ['مخزن', 'warehouse', 'store'] },
    { name: 'فواتير المبيعات', path: '/sales', category: 'المبيعات', keywords: ['فاتورة', 'بيع', 'sales', 'invoice'] },
    { name: 'إنشاء فاتورة مبيعات', path: '/sales/create', category: 'المبيعات', keywords: ['جديد', 'new sale'] },
    { name: 'فواتير المشتريات', path: '/purchases', category: 'المشتريات', keywords: ['شراء', 'purchases', 'bill'] },
    { name: 'إنشاء فاتورة مشتريات', path: '/purchases/create', category: 'المشتريات', keywords: ['جديد', 'new purchase'] },
    { name: 'حركات المخزون', path: '/movements', category: 'المخزون', keywords: ['حركة', 'movements', 'history'] },
];

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<typeof APP_PAGES>([]);
    const [showResults, setShowResults] = useState(false);

    // Filter Logic
    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            const results = APP_PAGES.filter(page =>
                page.name.includes(query) ||
                page.category.includes(query) ||
                page.keywords.some(k => k.includes(query))
            );
            setSearchResults(results);
            setShowResults(true);
        } else {
            setShowResults(false);
        }
    }, [searchQuery]);

    const handleNavigate = (path: string) => {
        navigate(path);
        setSearchQuery('');
        setShowResults(false);
    };
    return (
        <header className="sticky top-0 z-40 flex w-full bg-card drop-shadow-sm border-b border-border transition-colors duration-300">
            <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">

                {/* Hamburger Toggle (Visible on Mobile) */}
                <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                    <button
                        aria-controls="sidebar"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSidebarOpen(!sidebarOpen);
                        }}
                        className="block rounded-sm border border-border bg-card p-1.5 shadow-sm hover:border-border-hover lg:hidden text-content-secondary"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="hidden sm:block relative z-50">
                    <form action="#" onSubmit={(e) => e.preventDefault()}>
                        <div className="relative">
                            <div className="relative">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-content-muted" size={20} />
                                <input
                                    type="text"
                                    placeholder="بحث سريع... (مثال: فاتورة، عملاء)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-canvas rounded-full border border-border pr-12 pl-4 py-2 focus:outline-none focus:border-primary-500 focus:bg-card transition-colors xl:w-96 text-content-primary placeholder-content-muted font-medium"
                                />
                            </div>
                        </div>
                    </form>

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="absolute top-full right-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden max-h-96 overflow-y-auto">
                            {searchResults.length > 0 ? (
                                <ul className="py-2">
                                    {searchResults.map((result, index) => (
                                        <li key={index}>
                                            <button
                                                onClick={() => handleNavigate(result.path)}
                                                className="w-full text-right px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                                            >
                                                <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                                                    {result.name}
                                                </span>
                                                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                                                    {result.category}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-center text-slate-400 text-sm">
                                    لا توجد نتائج مطابقة
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3 2x:gap-7">
                    <ul className="flex items-center gap-2 2x:gap-4">

                        {/* Theme Switcher */}
                        <li>
                            <ThemeSettings />
                        </li>

                        {/* Notification */}
                        <li className="relative">
                            <button className="relative flex h-8 w-8 items-center justify-center rounded-full border-[0.5px] border-border bg-canvas hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-content-secondary">
                                <span className="absolute -top-0.5 -right-0.5 z-1 h-2.5 w-2.5 rounded-full bg-rose-500 align-middle border-2 border-white dark:border-slate-800 inline-block"></span>
                                <Bell size={18} />
                            </button>
                        </li>
                    </ul>

                    {/* User Area */}
                    <div className="relative flex items-center gap-4 pl-2 cursor-pointer">
                        <span className="hidden text-right lg:block">
                            <span className="block text-sm font-bold text-content-primary">مدير النظام</span>
                            <span className="block text-xs font-medium text-content-secondary">Admin</span>
                        </span>
                        <span className="h-10 w-10 rounded-full bg-canvas flex items-center justify-center overflow-hidden border border-border">
                            <User size={24} className="text-content-secondary" />
                        </span>
                    </div>
                </div>

            </div>
        </header>
    );
};

export default Header;
