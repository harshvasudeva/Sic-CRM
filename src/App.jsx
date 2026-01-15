import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import ProductList from './pages/products/ProductList'
import Purchase from './pages/Purchase'
import Accounting from './pages/Accounting'

// Sales Module
import Quotations from './pages/sales/Quotations'
import SalesOrders from './pages/sales/SalesOrders'
import Invoices from './pages/sales/Invoices'
import CreditNotes from './pages/sales/CreditNotes'
import PricingRules from './pages/sales/PricingRules'
import SalesTargets from './pages/sales/SalesTargets'
import QuotationTemplates from './pages/sales/QuotationTemplates'
import InvoiceTemplates from './pages/sales/InvoiceTemplates'

// Purchase Module
import Vendors from './pages/purchase/Vendors'
import PurchaseOrders from './pages/purchase/PurchaseOrders'
import PurchaseRequisitions from './pages/purchase/PurchaseRequisitions'
import RFQs from './pages/purchase/RFQs'
import GRNs from './pages/purchase/GRNs'
import SupplierInvoices from './pages/purchase/SupplierInvoices'
import VendorReturns from './pages/purchase/VendorReturns'
import VendorEvaluations from './pages/purchase/VendorEvaluations'

// Accounting Module
import JournalEntries from './pages/accounting/JournalEntries'
import GeneralLedger from './pages/accounting/GeneralLedger'
import BankAccounts from './pages/accounting/BankAccounts'
import AccountingExpenses from './pages/accounting/Expenses'
import Budgets from './pages/accounting/Budgets'
import AccountsReceivable from './pages/accounting/AccountsReceivable'
import AccountsPayable from './pages/accounting/AccountsPayable'
import ChartOfAccounts from './pages/accounting/ChartOfAccounts'

// Inventory Module
import Inventory from './pages/inventory/Inventory'
import StockMovements from './pages/inventory/StockMovements'
import StockTransfers from './pages/inventory/StockTransfers'
import Warehouses from './pages/inventory/Warehouses'
import SerialNumbers from './pages/inventory/SerialNumbers'

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

// Manufacturing Module
import BillOfMaterials from './pages/manufacturing/BillOfMaterials'
import WorkCenters from './pages/manufacturing/WorkCenters'
import ProductionOrders from './pages/manufacturing/ProductionOrders'

// Specialized Module
import PointOfSale from './pages/specialized/PointOfSale'
import Discuss from './pages/specialized/Discuss'
import Rentals from './pages/specialized/Rentals'
import WebsiteBuilder from './pages/specialized/WebsiteBuilder'
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
            
            {/* Sales Module Routes */}
            <Route path="sales/quotations" element={<Quotations />} />
            <Route path="sales/quotations/templates" element={<QuotationTemplates />} />
            <Route path="sales/orders" element={<SalesOrders />} />
            <Route path="sales/invoices" element={<Invoices />} />
            <Route path="sales/invoices/templates" element={<InvoiceTemplates />} />
            <Route path="sales/credit-notes" element={<CreditNotes />} />
            <Route path="sales/pricing" element={<PricingRules />} />
            <Route path="sales/targets" element={<SalesTargets />} />
            
            {/* Purchase Module Routes */}
            <Route path="purchase/vendors" element={<Vendors />} />
            <Route path="purchase/orders" element={<PurchaseOrders />} />
            <Route path="purchase/requisitions" element={<PurchaseRequisitions />} />
            <Route path="purchase/rfqs" element={<RFQs />} />
            <Route path="purchase/grns" element={<GRNs />} />
            <Route path="purchase/supplier-invoices" element={<SupplierInvoices />} />
            <Route path="purchase/returns" element={<VendorReturns />} />
            <Route path="purchase/evaluations" element={<VendorEvaluations />} />
            
            {/* Accounting Module Routes */}
            <Route path="accounting/journal-entries" element={<JournalEntries />} />
            <Route path="accounting/general-ledger" element={<GeneralLedger />} />
            <Route path="accounting/bank-accounts" element={<BankAccounts />} />
            <Route path="accounting/expenses" element={<AccountingExpenses />} />
            <Route path="accounting/budgets" element={<Budgets />} />
            <Route path="accounting/receivables" element={<AccountsReceivable />} />
            <Route path="accounting/payables" element={<AccountsPayable />} />
            <Route path="accounting/chart-of-accounts" element={<ChartOfAccounts />} />
            
            {/* Inventory Module Routes */}
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/movements" element={<StockMovements />} />
            <Route path="inventory/transfers" element={<StockTransfers />} />
            <Route path="inventory/warehouses" element={<Warehouses />} />
            <Route path="inventory/serial-numbers" element={<SerialNumbers />} />
            
            <Route path="products" element={<ProductList />} />
            <Route path="purchase" element={<Purchase />} />

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
            <Route path="manufacturing/bom" element={<BillOfMaterials />} />
            <Route path="manufacturing/work-centers" element={<WorkCenters />} />
            <Route path="manufacturing/production-orders" element={<ProductionOrders />} />

            <Route path="specialized" element={<Specialized />} />
            <Route path="specialized/pos" element={<PointOfSale />} />
            <Route path="specialized/discuss" element={<Discuss />} />
            <Route path="specialized/rentals" element={<Rentals />} />
            <Route path="specialized/website-builder" element={<WebsiteBuilder />} />
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
