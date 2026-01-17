import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import ModuleErrorBoundary from './components/ModuleErrorBoundary'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import ProductList from './pages/products/ProductList'
import PriceLists from './pages/products/PriceLists'
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
import DeliveryNotes from './pages/sales/DeliveryNotes'

// Purchase Module
import Vendors from './pages/purchase/Vendors'
import PurchaseOrders from './pages/purchase/PurchaseOrders'
import PurchaseRequisitions from './pages/purchase/PurchaseRequisitions'
import RFQs from './pages/purchase/RFQs'
import GRNs from './pages/purchase/GRNs'
import SupplierInvoices from './pages/purchase/SupplierInvoices'
import VendorReturns from './pages/purchase/VendorReturns'
import VendorEvaluations from './pages/purchase/VendorEvaluations'
import Subscriptions from './pages/purchase/Subscriptions'

// Accounting Module
import JournalEntries from './pages/accounting/JournalEntries'
import GeneralLedger from './pages/accounting/GeneralLedger'
import BankAccounts from './pages/accounting/BankAccounts'
import AccountingExpenses from './pages/accounting/Expenses'
import Budgets from './pages/accounting/Budgets'
import AccountsReceivable from './pages/accounting/AccountsReceivable'
import AccountsPayable from './pages/accounting/AccountsPayable'
import ChartOfAccounts from './pages/accounting/ChartOfAccounts'
import FinancialReports from './pages/accounting/FinancialReports'
import FixedAssets from './pages/accounting/FixedAssets'
import CostCenters from './pages/accounting/CostCenters'
import Taxation from './pages/accounting/Taxation'
import Automation from './pages/accounting/Automation'
import ChequePrinting from './pages/accounting/ChequePrinting'
import DebitNotes from './pages/accounting/DebitNotes'

// Inventory Module
import Inventory from './pages/inventory/Inventory'
import StockMovements from './pages/inventory/StockMovements'
import StockTransfers from './pages/inventory/StockTransfers'
import Warehouses from './pages/inventory/Warehouses'
import SerialNumbers from './pages/inventory/SerialNumbers'
import StockGroups from './pages/inventory/StockGroups'
import Units from './pages/inventory/Units'
import StockJournal from './pages/inventory/StockJournal'
import PhysicalStock from './pages/inventory/PhysicalStock'
import RejectionsIn from './pages/inventory/RejectionsIn'
import RejectionsOut from './pages/inventory/RejectionsOut'

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
import BillOfMaterials from './pages/manufacturing/BillOfMaterials'
import WorkCenters from './pages/manufacturing/WorkCenters'
import ProductionOrders from './pages/manufacturing/ProductionOrders'
import Specialized from './pages/Specialized'
import PointOfSale from './pages/specialized/PointOfSale'
import Discuss from './pages/specialized/Discuss'
import Rentals from './pages/specialized/Rentals'
import WebsiteBuilder from './pages/specialized/WebsiteBuilder'
import Settings from './pages/Settings'
import Reports from './pages/Reports'
import TallyHelp from './pages/TallyHelp'
import NotFound from './pages/NotFound'

// Setup
import Setup from './pages/Setup'

function App() {
  const [isConfigured, setIsConfigured] = React.useState(true); // Optimistic default

  React.useEffect(() => {
    // Check if DB is configured
    fetch('http://localhost:5000/api/setup/status')
      .then(res => res.json())
      .then(data => {
        if (!data.configured) setIsConfigured(false);
      })
      .catch(() => {
        // Assume failure means not configured or down, safe to show setup or error
        // For now, let's just log it
        console.log('Setup check failed');
      });
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Routes>
          <Route path="/setup" element={<Setup />} />
          <Route path="/" element={!isConfigured ? <Navigate to="/setup" /> : <Layout />}>
            <Route index element={<Dashboard />} />


            {/* Sales Module Routes */}
            <Route element={<ModuleErrorBoundary moduleName="Sales"><Outlet /></ModuleErrorBoundary>}>
              <Route path="sales" element={<Sales />} />
              <Route path="sales/quotations" element={<Quotations />} />
              <Route path="sales/quotations/templates" element={<QuotationTemplates />} />
              <Route path="sales/orders" element={<SalesOrders />} />
              <Route path="sales/invoices" element={<Invoices />} />
              <Route path="sales/invoices/templates" element={<InvoiceTemplates />} />
              <Route path="sales/credit-notes" element={<CreditNotes />} />
              <Route path="sales/pricing" element={<PricingRules />} />
              <Route path="sales/targets" element={<SalesTargets />} />
              <Route path="sales/delivery-notes" element={<DeliveryNotes />} />
            </Route>

            {/* Purchase Module Routes */}
            <Route element={<ModuleErrorBoundary moduleName="Purchase"><Outlet /></ModuleErrorBoundary>}>
              <Route path="purchase" element={<Purchase />} />
              <Route path="purchase/vendors" element={<Vendors />} />
              <Route path="purchase/orders" element={<PurchaseOrders />} />
              <Route path="purchase/requisitions" element={<PurchaseRequisitions />} />
              <Route path="purchase/rfqs" element={<RFQs />} />
              <Route path="purchase/grns" element={<GRNs />} />
              <Route path="purchase/supplier-invoices" element={<SupplierInvoices />} />
              <Route path="purchase/returns" element={<VendorReturns />} />
              <Route path="purchase/evaluations" element={<VendorEvaluations />} />
              <Route path="purchase/subscriptions" element={<Subscriptions />} />
            </Route>

            {/* Accounting Module Routes */}
            <Route element={<ModuleErrorBoundary moduleName="Accounting"><Outlet /></ModuleErrorBoundary>}>
              <Route path="accounting" element={<Accounting />} />
              <Route path="accounting/journal" element={<JournalEntries />} />
              <Route path="accounting/journal-entries" element={<JournalEntries />} />
              <Route path="accounting/general-ledger" element={<GeneralLedger />} />
              <Route path="accounting/ledger" element={<GeneralLedger />} />
              <Route path="accounting/bank" element={<BankAccounts />} />
              <Route path="accounting/bank-accounts" element={<BankAccounts />} />
              <Route path="accounting/expenses" element={<AccountingExpenses />} />
              <Route path="accounting/budgets" element={<Budgets />} />
              <Route path="accounting/receivable" element={<AccountsReceivable />} />
              <Route path="accounting/receivables" element={<AccountsReceivable />} />
              <Route path="accounting/payable" element={<AccountsPayable />} />
              <Route path="accounting/payables" element={<AccountsPayable />} />
              <Route path="accounting/chart" element={<ChartOfAccounts />} />
              <Route path="accounting/chart-of-accounts" element={<ChartOfAccounts />} />
              <Route path="accounting/reports" element={<FinancialReports />} />
              <Route path="accounting/assets" element={<FixedAssets />} />
              <Route path="accounting/cost-centers" element={<CostCenters />} />
              <Route path="accounting/taxation" element={<Taxation />} />
              <Route path="accounting/automation" element={<Automation />} />
              <Route path="accounting/cheque-printing" element={<ChequePrinting />} />
              <Route path="accounting/debit-notes" element={<DebitNotes />} />
            </Route>

            {/* Inventory Module Routes */}
            <Route element={<ModuleErrorBoundary moduleName="Inventory"><Outlet /></ModuleErrorBoundary>}>
              <Route path="inventory" element={<Inventory />} />
              <Route path="inventory/movements" element={<StockMovements />} />
              <Route path="inventory/transfers" element={<StockTransfers />} />
              <Route path="inventory/warehouses" element={<Warehouses />} />
              <Route path="inventory/serial-numbers" element={<SerialNumbers />} />
              <Route path="inventory/stock-groups" element={<StockGroups />} />
              <Route path="inventory/units" element={<Units />} />
              <Route path="inventory/stock-journal" element={<StockJournal />} />
              <Route path="inventory/physical-stock" element={<PhysicalStock />} />
              <Route path="inventory/rejections-in" element={<RejectionsIn />} />
              <Route path="inventory/rejections-out" element={<RejectionsOut />} />
            </Route>

            <Route element={<ModuleErrorBoundary moduleName="Products"><Outlet /></ModuleErrorBoundary>}>
              <Route path="products" element={<ProductList />} />
              <Route path="products/price-lists" element={<PriceLists />} />
            </Route>
            {/* CRM Module Routes */}
            <Route element={<ModuleErrorBoundary moduleName="CRM"><Outlet /></ModuleErrorBoundary>}>
              <Route path="crm" element={<CRMDashboard />} />
              <Route path="crm/leads" element={<Leads />} />
              <Route path="crm/leads/new" element={<Leads />} />
              <Route path="crm/opportunities" element={<Opportunities />} />
              <Route path="crm/opportunities/new" element={<Opportunities />} />
              <Route path="crm/contacts" element={<Contacts />} />
              <Route path="crm/contacts/new" element={<Contacts />} />
              <Route path="crm/activities" element={<Activities />} />
            </Route>

            {/* HR Module Routes */}
            <Route element={<ModuleErrorBoundary moduleName="HR"><Outlet /></ModuleErrorBoundary>}>
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
            </Route>

            <Route element={<ModuleErrorBoundary moduleName="Manufacturing"><Outlet /></ModuleErrorBoundary>}>
              <Route path="manufacturing" element={<Manufacturing />} />
              <Route path="manufacturing/bom" element={<BillOfMaterials />} />
              <Route path="manufacturing/work-centers" element={<WorkCenters />} />
              <Route path="manufacturing/production-orders" element={<ProductionOrders />} />
            </Route>

            <Route element={<ModuleErrorBoundary moduleName="Specialized"><Outlet /></ModuleErrorBoundary>}>
              <Route path="specialized" element={<Specialized />} />
              <Route path="specialized/pos" element={<PointOfSale />} />
              <Route path="specialized/discuss" element={<Discuss />} />
              <Route path="specialized/rentals" element={<Rentals />} />
              <Route path="specialized/website-builder" element={<WebsiteBuilder />} />
            </Route>

            <Route path="settings" element={<ModuleErrorBoundary moduleName="Settings"><Settings /></ModuleErrorBoundary>} />
            <Route path="reports" element={<ModuleErrorBoundary moduleName="Reports"><Reports /></ModuleErrorBoundary>} />
            <Route path="tally-help" element={<ModuleErrorBoundary moduleName="Help"><TallyHelp /></ModuleErrorBoundary>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
