import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import ProductList from './pages/products/ProductList'
import Purchase from './pages/Purchase'
import Accounting from './pages/Accounting'

// HR Module
import HRDashboard from './pages/hr/HRDashboard'
import EmployeeList from './pages/hr/EmployeeList'
import Attendance from './pages/hr/Attendance'
import Leaves from './pages/hr/Leaves'
import Payroll from './pages/hr/Payroll'
import Trainings from './pages/hr/Trainings'
import Performance from './pages/hr/Performance'
import Expenses from './pages/hr/Expenses'
import Announcements from './pages/hr/Announcements'
import Departments from './pages/hr/Departments'

// CRM Module
import CRMDashboard from './pages/crm/CRMDashboard'
import Leads from './pages/crm/Leads'
import Opportunities from './pages/crm/Opportunities'
import Contacts from './pages/crm/Contacts'
import Activities from './pages/crm/Activities'

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

            {/* CRM Module Routes */}
            <Route path="crm" element={<CRMDashboard />} />
            <Route path="crm/leads" element={<Leads />} />
            <Route path="crm/leads/new" element={<Leads />} />
            <Route path="crm/opportunities" element={<Opportunities />} />
            <Route path="crm/opportunities/new" element={<Opportunities />} />
            <Route path="crm/contacts" element={<Contacts />} />
            <Route path="crm/contacts/new" element={<Contacts />} />
            <Route path="crm/activities" element={<Activities />} />

            {/* HR Module Routes */}
            <Route path="hr" element={<HRDashboard />} />
            <Route path="hr/employees" element={<EmployeeList />} />
            <Route path="hr/employees/new" element={<EmployeeList />} />
            <Route path="hr/attendance" element={<Attendance />} />
            <Route path="hr/leaves" element={<Leaves />} />
            <Route path="hr/payroll" element={<Payroll />} />
            <Route path="hr/trainings" element={<Trainings />} />
            <Route path="hr/performance" element={<Performance />} />
            <Route path="hr/expenses" element={<Expenses />} />
            <Route path="hr/announcements" element={<Announcements />} />
            <Route path="hr/departments" element={<Departments />} />

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
