import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import Products from './pages/Products'
import Purchase from './pages/Purchase'
import Accounting from './pages/Accounting'
import CRM from './pages/CRM'
import HR from './pages/HR'
import Manufacturing from './pages/Manufacturing'
import Specialized from './pages/Specialized'
import Settings from './pages/Settings'
import Reports from './pages/Reports'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="sales" element={<Sales />} />
        <Route path="products" element={<Products />} />
        <Route path="purchase" element={<Purchase />} />
        <Route path="accounting" element={<Accounting />} />
        <Route path="crm" element={<CRM />} />
        <Route path="hr" element={<HR />} />
        <Route path="manufacturing" element={<Manufacturing />} />
        <Route path="specialized" element={<Specialized />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  )
}

export default App
