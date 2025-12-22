import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Truck,
    Package,
    Warehouse,
    ShoppingCart,
    FileText,
    ArrowRightLeft,
    BarChart2,
    Bell,
    X
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
    const links = [
        { to: '/', icon: LayoutDashboard, label: 'لوحة التحكم' },
        { to: '/customers', icon: Users, label: 'العملاء' },
        { to: '/suppliers', icon: Truck, label: 'الموردين' },
        { to: '/products', icon: Package, label: 'المنتجات' },
        { to: '/warehouses', icon: Warehouse, label: 'المخازن' },
        { to: '/sales', icon: FileText, label: 'فواتير المبيعات' },
        { to: '/sales/create', icon: ShoppingCart, label: 'إنشاء فاتورة بيع' },
        { to: '/purchases', icon: FileText, label: 'فواتير المشتريات' },
        { to: '/purchases/create', icon: Truck, label: 'إنشاء فاتورة شراء' },
        { to: '/movements', icon: ArrowRightLeft, label: 'حركة المخازن' },
        { to: '/reports', icon: BarChart2, label: 'التقارير' },
        { to: '/alerts', icon: Bell, label: 'التنبيهات' },
    ];

    return (
        <aside
            className={clsx(
                'absolute right-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-card border-l border-border duration-300 ease-linear lg:static lg:translate-x-0 transition-colors',
                sidebarOpen ? 'translate-x-0' : 'translate-x-full'
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-6 py-5 lg:py-6">
                <div className="flex items-center gap-2 font-bold text-2xl text-primary-600">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-mono">I</div>
                    InventoPro
                </div>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="block lg:hidden text-content-secondary hover:text-rose-500 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Menu */}
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear">
                <nav className="mt-5 px-4 lg:px-6">
                    <ul className="mb-6 flex flex-col gap-1.5">
                        {links.map((link) => (
                            <li key={link.to}>
                                <NavLink
                                    to={link.to}
                                    className={({ isActive }) =>
                                        clsx(
                                            'group relative flex items-center gap-2.5 rounded-lg px-4 py-3 font-medium duration-300 ease-in-out transition-colors',
                                            isActive
                                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                                : 'text-content-secondary hover:bg-canvas hover:text-content-primary'
                                        )
                                    }
                                >
                                    <link.icon size={20} />
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
