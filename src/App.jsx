import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import ProductList from './pages/products/ProductList'
import Purchase from './pages/Purchase'
import Accounting from './pages/Accounting'
import CRM from './pages/CRM'
import HR from './pages/HR'
import Manufacturing from './pages/Manufacturing'
import Specialized from './pages/Specialized'
import Settings from './pages/Settings'
import Reports from './pages/Reports'
import NotFound from './pages/NotFound'

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="sales" element={<Sales />} />
            <Route path="products" element={<ProductList />} />
            <Route path="purchase" element={<Purchase />} />
            <Route path="accounting" element={<Accounting />} />
            <Route path="crm" element={<CRM />} />
            <Route path="hr" element={<HR />} />
            <Route path="manufacturing" element={<Manufacturing />} />
            <Route path="specialized" element={<Specialized />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
