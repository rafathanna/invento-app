import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CustomersPage from './pages/Customers/CustomersPage';
import SuppliersPage from './pages/Suppliers/SuppliersPage';
import ProductsPage from './pages/Products/ProductsPage';
import WarehousesPage from './pages/Warehouses/WarehousesPage';
import CreateSalesInvoicePage from './pages/Sales/CreateSalesInvoicePage';
import SalesInvoicesPage from './pages/Sales/SalesInvoicesPage';
import CreatePurchaseInvoicePage from './pages/Purchases/CreatePurchaseInvoicePage';
import PurchaseInvoicesPage from './pages/Purchases/PurchaseInvoicesPage';
import StockMovementsPage from './pages/StockMovements/StockMovementsPage';
import UnderConstruction from './pages/UnderConstruction';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="suppliers" element={<SuppliersPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="warehouses" element={<WarehousesPage />} />
                    <Route path="sales/create" element={<CreateSalesInvoicePage />} />
                    <Route path="sales" element={<SalesInvoicesPage />} />
                    <Route path="purchases/create" element={<CreatePurchaseInvoicePage />} />
                    <Route path="purchases" element={<PurchaseInvoicesPage />} />
                    <Route path="movements" element={<StockMovementsPage />} />
                    <Route path="reports" element={<UnderConstruction title="التقارير" />} />
                    <Route path="alerts" element={<UnderConstruction title="التنبيهات" />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;


