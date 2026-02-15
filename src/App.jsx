import React, { Suspense } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import ModuleErrorBoundary from './components/ModuleErrorBoundary'
import Layout from './components/Layout'
import LoadingSkeleton from './components/LoadingSkeleton'

// Setup (eagerly loaded)
import Setup from './pages/Setup'

// Dashboard (eagerly loaded - landing page)
import Dashboard from './pages/Dashboard'

// Lazy-loaded modules
const Sales = React.lazy(() => import('./pages/Sales'))
const ProductList = React.lazy(() => import('./pages/products/ProductList'))
const PriceLists = React.lazy(() => import('./pages/products/PriceLists'))
const Purchase = React.lazy(() => import('./pages/Purchase'))
const Accounting = React.lazy(() => import('./pages/Accounting'))

// Sales Module
const Quotations = React.lazy(() => import('./pages/sales/Quotations'))
const SalesOrders = React.lazy(() => import('./pages/sales/SalesOrders'))
const Invoices = React.lazy(() => import('./pages/sales/Invoices'))
const CreditNotes = React.lazy(() => import('./pages/sales/CreditNotes'))
const PricingRules = React.lazy(() => import('./pages/sales/PricingRules'))
const SalesTargets = React.lazy(() => import('./pages/sales/SalesTargets'))
const QuotationTemplates = React.lazy(() => import('./pages/sales/QuotationTemplates'))
const InvoiceTemplates = React.lazy(() => import('./pages/sales/InvoiceTemplates'))
const DeliveryNotes = React.lazy(() => import('./pages/sales/DeliveryNotes'))

// Purchase Module
const Vendors = React.lazy(() => import('./pages/purchase/Vendors'))
const PurchaseOrders = React.lazy(() => import('./pages/purchase/PurchaseOrders'))
const PurchaseRequisitions = React.lazy(() => import('./pages/purchase/PurchaseRequisitions'))
const RFQs = React.lazy(() => import('./pages/purchase/RFQs'))
const GRNs = React.lazy(() => import('./pages/purchase/GRNs'))
const SupplierInvoices = React.lazy(() => import('./pages/purchase/SupplierInvoices'))
const VendorReturns = React.lazy(() => import('./pages/purchase/VendorReturns'))
const VendorEvaluations = React.lazy(() => import('./pages/purchase/VendorEvaluations'))
const Subscriptions = React.lazy(() => import('./pages/purchase/Subscriptions'))

// Accounting Module
const JournalEntries = React.lazy(() => import('./pages/accounting/JournalEntries'))
const GeneralLedger = React.lazy(() => import('./pages/accounting/GeneralLedger'))
const BankAccounts = React.lazy(() => import('./pages/accounting/BankAccounts'))
const AccountingExpenses = React.lazy(() => import('./pages/accounting/Expenses'))
const Budgets = React.lazy(() => import('./pages/accounting/Budgets'))
const AccountsReceivable = React.lazy(() => import('./pages/accounting/AccountsReceivable'))
const AccountsPayable = React.lazy(() => import('./pages/accounting/AccountsPayable'))
const ChartOfAccounts = React.lazy(() => import('./pages/accounting/ChartOfAccounts'))
const FinancialReports = React.lazy(() => import('./pages/accounting/FinancialReports'))
const FixedAssets = React.lazy(() => import('./pages/accounting/FixedAssets'))
const CostCenters = React.lazy(() => import('./pages/accounting/CostCenters'))
const Taxation = React.lazy(() => import('./pages/accounting/Taxation'))
const Automation = React.lazy(() => import('./pages/accounting/Automation'))
const ChequePrinting = React.lazy(() => import('./pages/accounting/ChequePrinting'))
const DebitNotes = React.lazy(() => import('./pages/accounting/DebitNotes'))

// Inventory Module
const Inventory = React.lazy(() => import('./pages/inventory/Inventory'))
const StockMovements = React.lazy(() => import('./pages/inventory/StockMovements'))
const StockTransfers = React.lazy(() => import('./pages/inventory/StockTransfers'))
const Warehouses = React.lazy(() => import('./pages/inventory/Warehouses'))
const SerialNumbers = React.lazy(() => import('./pages/inventory/SerialNumbers'))
const StockGroups = React.lazy(() => import('./pages/inventory/StockGroups'))
const Units = React.lazy(() => import('./pages/inventory/Units'))
const StockJournal = React.lazy(() => import('./pages/inventory/StockJournal'))
const PhysicalStock = React.lazy(() => import('./pages/inventory/PhysicalStock'))
const RejectionsIn = React.lazy(() => import('./pages/inventory/RejectionsIn'))
const RejectionsOut = React.lazy(() => import('./pages/inventory/RejectionsOut'))

// HR Module
const HRDashboard = React.lazy(() => import('./pages/hr/HRDashboard'))
const EmployeeList = React.lazy(() => import('./pages/hr/EmployeeList'))
const RecruitmentBoard = React.lazy(() => import('./pages/hr/RecruitmentBoard'))
const AssetList = React.lazy(() => import('./pages/hr/AssetList'))
const TimeSheet = React.lazy(() => import('./pages/hr/TimeSheet'))
const OrgChart = React.lazy(() => import('./pages/hr/OrgChart'))
const Attendance = React.lazy(() => import('./pages/hr/Attendance'))
const Leaves = React.lazy(() => import('./pages/hr/Leaves'))
const Payroll = React.lazy(() => import('./pages/hr/Payroll'))
const Trainings = React.lazy(() => import('./pages/hr/Trainings'))
const Performance = React.lazy(() => import('./pages/hr/Performance'))
const Expenses = React.lazy(() => import('./pages/hr/Expenses'))
const Announcements = React.lazy(() => import('./pages/hr/Announcements'))
const Departments = React.lazy(() => import('./pages/hr/Departments'))

// CRM Module
const CRMDashboard = React.lazy(() => import('./pages/crm/CRMDashboard'))
const Leads = React.lazy(() => import('./pages/crm/Leads'))
const Opportunities = React.lazy(() => import('./pages/crm/Opportunities'))
const Contacts = React.lazy(() => import('./pages/crm/Contacts'))
const Activities = React.lazy(() => import('./pages/crm/Activities'))

// Influencer Module
const InfluencerDashboard = React.lazy(() => import('./pages/influencer/InfluencerDashboard'))
const CreatorDatabase = React.lazy(() => import('./pages/influencer/CreatorDatabase'))
const CampaignDashboard = React.lazy(() => import('./pages/influencer/CampaignDashboard'))
const CampaignGenerator = React.lazy(() => import('./pages/influencer/CampaignGenerator'))
const OutreachDashboard = React.lazy(() => import('./pages/influencer/OutreachDashboard'))
const SalesCRM = React.lazy(() => import('./pages/influencer/SalesCRM'))
const ContentScheduling = React.lazy(() => import('./pages/influencer/ContentScheduling'))
const PaymentInvoicing = React.lazy(() => import('./pages/influencer/PaymentInvoicing'))
const CreatorAnalytics = React.lazy(() => import('./pages/influencer/CreatorAnalytics'))
const CampaignComparison = React.lazy(() => import('./pages/influencer/CampaignComparison'))

// Manufacturing Module
const Manufacturing = React.lazy(() => import('./pages/Manufacturing'))
const BillOfMaterials = React.lazy(() => import('./pages/manufacturing/BillOfMaterials'))
const WorkCenters = React.lazy(() => import('./pages/manufacturing/WorkCenters'))
const ProductionOrders = React.lazy(() => import('./pages/manufacturing/ProductionOrders'))

// Specialized Module
const Specialized = React.lazy(() => import('./pages/Specialized'))
const PointOfSale = React.lazy(() => import('./pages/specialized/PointOfSale'))
const Discuss = React.lazy(() => import('./pages/specialized/Discuss'))
const Rentals = React.lazy(() => import('./pages/specialized/Rentals'))
const WebsiteBuilder = React.lazy(() => import('./pages/specialized/WebsiteBuilder'))

// Other
const Settings = React.lazy(() => import('./pages/Settings'))
const Reports = React.lazy(() => import('./pages/Reports'))
const TallyHelp = React.lazy(() => import('./pages/TallyHelp'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

// Loading fallback for lazy-loaded routes
function PageLoader() {
  return (
    <div style={{ padding: '40px 24px' }}>
      <LoadingSkeleton variant="title" width="30%" />
      <div style={{ marginTop: 24 }}>
        <LoadingSkeleton count={6} />
      </div>
    </div>
  )
}

function App() {
  const [isConfigured, setIsConfigured] = React.useState(true);

  React.useEffect(() => {
    fetch('http://localhost:5000/api/setup/status')
      .then(res => res.json())
      .then(data => {
        if (!data.configured) setIsConfigured(false);
      })
      .catch(() => {
        console.log('Setup check failed');
      });
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/setup" element={<Setup />} />
            <Route path="/" element={!isConfigured ? <Navigate to="/setup" /> : <Layout />}>
              <Route index element={<Dashboard />} />

              {/* Sales Module Routes */}
              <Route element={<ModuleErrorBoundary moduleName="Sales"><Outlet /></ModuleErrorBoundary>}>
                <Route path="sales" element={<Suspense fallback={<PageLoader />}><Sales /></Suspense>} />
                <Route path="sales/quotations" element={<Suspense fallback={<PageLoader />}><Quotations /></Suspense>} />
                <Route path="sales/quotations/templates" element={<Suspense fallback={<PageLoader />}><QuotationTemplates /></Suspense>} />
                <Route path="sales/orders" element={<Suspense fallback={<PageLoader />}><SalesOrders /></Suspense>} />
                <Route path="sales/invoices" element={<Suspense fallback={<PageLoader />}><Invoices /></Suspense>} />
                <Route path="sales/invoices/templates" element={<Suspense fallback={<PageLoader />}><InvoiceTemplates /></Suspense>} />
                <Route path="sales/credit-notes" element={<Suspense fallback={<PageLoader />}><CreditNotes /></Suspense>} />
                <Route path="sales/pricing" element={<Suspense fallback={<PageLoader />}><PricingRules /></Suspense>} />
                <Route path="sales/targets" element={<Suspense fallback={<PageLoader />}><SalesTargets /></Suspense>} />
                <Route path="sales/delivery-notes" element={<Suspense fallback={<PageLoader />}><DeliveryNotes /></Suspense>} />
              </Route>

              {/* Purchase Module Routes */}
              <Route element={<ModuleErrorBoundary moduleName="Purchase"><Outlet /></ModuleErrorBoundary>}>
                <Route path="purchase" element={<Suspense fallback={<PageLoader />}><Purchase /></Suspense>} />
                <Route path="purchase/vendors" element={<Suspense fallback={<PageLoader />}><Vendors /></Suspense>} />
                <Route path="purchase/orders" element={<Suspense fallback={<PageLoader />}><PurchaseOrders /></Suspense>} />
                <Route path="purchase/requisitions" element={<Suspense fallback={<PageLoader />}><PurchaseRequisitions /></Suspense>} />
                <Route path="purchase/rfqs" element={<Suspense fallback={<PageLoader />}><RFQs /></Suspense>} />
                <Route path="purchase/grns" element={<Suspense fallback={<PageLoader />}><GRNs /></Suspense>} />
                <Route path="purchase/supplier-invoices" element={<Suspense fallback={<PageLoader />}><SupplierInvoices /></Suspense>} />
                <Route path="purchase/returns" element={<Suspense fallback={<PageLoader />}><VendorReturns /></Suspense>} />
                <Route path="purchase/evaluations" element={<Suspense fallback={<PageLoader />}><VendorEvaluations /></Suspense>} />
                <Route path="purchase/subscriptions" element={<Suspense fallback={<PageLoader />}><Subscriptions /></Suspense>} />
              </Route>

              {/* Accounting Module Routes */}
              <Route element={<ModuleErrorBoundary moduleName="Accounting"><Outlet /></ModuleErrorBoundary>}>
                <Route path="accounting" element={<Suspense fallback={<PageLoader />}><Accounting /></Suspense>} />
                <Route path="accounting/journal" element={<Suspense fallback={<PageLoader />}><JournalEntries /></Suspense>} />
                <Route path="accounting/journal-entries" element={<Suspense fallback={<PageLoader />}><JournalEntries /></Suspense>} />
                <Route path="accounting/general-ledger" element={<Suspense fallback={<PageLoader />}><GeneralLedger /></Suspense>} />
                <Route path="accounting/ledger" element={<Suspense fallback={<PageLoader />}><GeneralLedger /></Suspense>} />
                <Route path="accounting/bank" element={<Suspense fallback={<PageLoader />}><BankAccounts /></Suspense>} />
                <Route path="accounting/bank-accounts" element={<Suspense fallback={<PageLoader />}><BankAccounts /></Suspense>} />
                <Route path="accounting/expenses" element={<Suspense fallback={<PageLoader />}><AccountingExpenses /></Suspense>} />
                <Route path="accounting/budgets" element={<Suspense fallback={<PageLoader />}><Budgets /></Suspense>} />
                <Route path="accounting/receivable" element={<Suspense fallback={<PageLoader />}><AccountsReceivable /></Suspense>} />
                <Route path="accounting/receivables" element={<Suspense fallback={<PageLoader />}><AccountsReceivable /></Suspense>} />
                <Route path="accounting/payable" element={<Suspense fallback={<PageLoader />}><AccountsPayable /></Suspense>} />
                <Route path="accounting/payables" element={<Suspense fallback={<PageLoader />}><AccountsPayable /></Suspense>} />
                <Route path="accounting/chart" element={<Suspense fallback={<PageLoader />}><ChartOfAccounts /></Suspense>} />
                <Route path="accounting/chart-of-accounts" element={<Suspense fallback={<PageLoader />}><ChartOfAccounts /></Suspense>} />
                <Route path="accounting/reports" element={<Suspense fallback={<PageLoader />}><FinancialReports /></Suspense>} />
                <Route path="accounting/assets" element={<Suspense fallback={<PageLoader />}><FixedAssets /></Suspense>} />
                <Route path="accounting/cost-centers" element={<Suspense fallback={<PageLoader />}><CostCenters /></Suspense>} />
                <Route path="accounting/taxation" element={<Suspense fallback={<PageLoader />}><Taxation /></Suspense>} />
                <Route path="accounting/automation" element={<Suspense fallback={<PageLoader />}><Automation /></Suspense>} />
                <Route path="accounting/cheque-printing" element={<Suspense fallback={<PageLoader />}><ChequePrinting /></Suspense>} />
                <Route path="accounting/debit-notes" element={<Suspense fallback={<PageLoader />}><DebitNotes /></Suspense>} />
              </Route>

              {/* Inventory Module Routes */}
              <Route element={<ModuleErrorBoundary moduleName="Inventory"><Outlet /></ModuleErrorBoundary>}>
                <Route path="inventory" element={<Suspense fallback={<PageLoader />}><Inventory /></Suspense>} />
                <Route path="inventory/movements" element={<Suspense fallback={<PageLoader />}><StockMovements /></Suspense>} />
                <Route path="inventory/transfers" element={<Suspense fallback={<PageLoader />}><StockTransfers /></Suspense>} />
                <Route path="inventory/warehouses" element={<Suspense fallback={<PageLoader />}><Warehouses /></Suspense>} />
                <Route path="inventory/serial-numbers" element={<Suspense fallback={<PageLoader />}><SerialNumbers /></Suspense>} />
                <Route path="inventory/stock-groups" element={<Suspense fallback={<PageLoader />}><StockGroups /></Suspense>} />
                <Route path="inventory/units" element={<Suspense fallback={<PageLoader />}><Units /></Suspense>} />
                <Route path="inventory/stock-journal" element={<Suspense fallback={<PageLoader />}><StockJournal /></Suspense>} />
                <Route path="inventory/physical-stock" element={<Suspense fallback={<PageLoader />}><PhysicalStock /></Suspense>} />
                <Route path="inventory/rejections-in" element={<Suspense fallback={<PageLoader />}><RejectionsIn /></Suspense>} />
                <Route path="inventory/rejections-out" element={<Suspense fallback={<PageLoader />}><RejectionsOut /></Suspense>} />
              </Route>

              <Route element={<ModuleErrorBoundary moduleName="Products"><Outlet /></ModuleErrorBoundary>}>
                <Route path="products" element={<Suspense fallback={<PageLoader />}><ProductList /></Suspense>} />
                <Route path="products/price-lists" element={<Suspense fallback={<PageLoader />}><PriceLists /></Suspense>} />
              </Route>

              {/* CRM Module Routes */}
              <Route element={<ModuleErrorBoundary moduleName="CRM"><Outlet /></ModuleErrorBoundary>}>
                <Route path="crm" element={<Suspense fallback={<PageLoader />}><CRMDashboard /></Suspense>} />
                <Route path="crm/leads" element={<Suspense fallback={<PageLoader />}><Leads /></Suspense>} />
                <Route path="crm/leads/new" element={<Suspense fallback={<PageLoader />}><Leads /></Suspense>} />
                <Route path="crm/opportunities" element={<Suspense fallback={<PageLoader />}><Opportunities /></Suspense>} />
                <Route path="crm/opportunities/new" element={<Suspense fallback={<PageLoader />}><Opportunities /></Suspense>} />
                <Route path="crm/contacts" element={<Suspense fallback={<PageLoader />}><Contacts /></Suspense>} />
                <Route path="crm/contacts/new" element={<Suspense fallback={<PageLoader />}><Contacts /></Suspense>} />
                <Route path="crm/activities" element={<Suspense fallback={<PageLoader />}><Activities /></Suspense>} />
              </Route>

              {/* Influencer Module Routes */}
              <Route element={<ModuleErrorBoundary moduleName="Influencer"><Outlet /></ModuleErrorBoundary>}>
                <Route path="influencer" element={<Suspense fallback={<PageLoader />}><InfluencerDashboard /></Suspense>} />
                <Route path="influencer/creators" element={<Suspense fallback={<PageLoader />}><CreatorDatabase /></Suspense>} />
                <Route path="influencer/campaigns" element={<Suspense fallback={<PageLoader />}><CampaignDashboard /></Suspense>} />
                <Route path="influencer/generator" element={<Suspense fallback={<PageLoader />}><CampaignGenerator /></Suspense>} />
                <Route path="influencer/outreach" element={<Suspense fallback={<PageLoader />}><OutreachDashboard /></Suspense>} />
                <Route path="influencer/sales" element={<Suspense fallback={<PageLoader />}><SalesCRM /></Suspense>} />
                <Route path="influencer/content" element={<Suspense fallback={<PageLoader />}><ContentScheduling /></Suspense>} />
                <Route path="influencer/invoices" element={<Suspense fallback={<PageLoader />}><PaymentInvoicing /></Suspense>} />
                <Route path="influencer/analytics" element={<Suspense fallback={<PageLoader />}><CreatorAnalytics /></Suspense>} />
                <Route path="influencer/comparison" element={<Suspense fallback={<PageLoader />}><CampaignComparison /></Suspense>} />
              </Route>

              {/* HR Module Routes */}
              <Route element={<ModuleErrorBoundary moduleName="HR"><Outlet /></ModuleErrorBoundary>}>
                <Route path="hr" element={<Suspense fallback={<PageLoader />}><HRDashboard /></Suspense>} />
                <Route path="hr/employees" element={<Suspense fallback={<PageLoader />}><EmployeeList /></Suspense>} />
                <Route path="hr/employees/new" element={<Suspense fallback={<PageLoader />}><EmployeeList /></Suspense>} />
                <Route path="hr/recruitment" element={<Suspense fallback={<PageLoader />}><RecruitmentBoard /></Suspense>} />
                <Route path="hr/assets" element={<Suspense fallback={<PageLoader />}><AssetList /></Suspense>} />
                <Route path="hr/timesheets" element={<Suspense fallback={<PageLoader />}><TimeSheet /></Suspense>} />
                <Route path="hr/org-chart" element={<Suspense fallback={<PageLoader />}><OrgChart /></Suspense>} />
                <Route path="hr/attendance" element={<Suspense fallback={<PageLoader />}><Attendance /></Suspense>} />
                <Route path="hr/leaves" element={<Suspense fallback={<PageLoader />}><Leaves /></Suspense>} />
                <Route path="hr/payroll" element={<Suspense fallback={<PageLoader />}><Payroll /></Suspense>} />
                <Route path="hr/trainings" element={<Suspense fallback={<PageLoader />}><Trainings /></Suspense>} />
                <Route path="hr/performance" element={<Suspense fallback={<PageLoader />}><Performance /></Suspense>} />
                <Route path="hr/expenses" element={<Suspense fallback={<PageLoader />}><Expenses /></Suspense>} />
                <Route path="hr/announcements" element={<Suspense fallback={<PageLoader />}><Announcements /></Suspense>} />
                <Route path="hr/departments" element={<Suspense fallback={<PageLoader />}><Departments /></Suspense>} />
              </Route>

              <Route element={<ModuleErrorBoundary moduleName="Manufacturing"><Outlet /></ModuleErrorBoundary>}>
                <Route path="manufacturing" element={<Suspense fallback={<PageLoader />}><Manufacturing /></Suspense>} />
                <Route path="manufacturing/bom" element={<Suspense fallback={<PageLoader />}><BillOfMaterials /></Suspense>} />
                <Route path="manufacturing/work-centers" element={<Suspense fallback={<PageLoader />}><WorkCenters /></Suspense>} />
                <Route path="manufacturing/production-orders" element={<Suspense fallback={<PageLoader />}><ProductionOrders /></Suspense>} />
              </Route>

              <Route element={<ModuleErrorBoundary moduleName="Specialized"><Outlet /></ModuleErrorBoundary>}>
                <Route path="specialized" element={<Suspense fallback={<PageLoader />}><Specialized /></Suspense>} />
                <Route path="specialized/pos" element={<Suspense fallback={<PageLoader />}><PointOfSale /></Suspense>} />
                <Route path="specialized/discuss" element={<Suspense fallback={<PageLoader />}><Discuss /></Suspense>} />
                <Route path="specialized/rentals" element={<Suspense fallback={<PageLoader />}><Rentals /></Suspense>} />
                <Route path="specialized/website-builder" element={<Suspense fallback={<PageLoader />}><WebsiteBuilder /></Suspense>} />
              </Route>

              <Route path="settings" element={<ModuleErrorBoundary moduleName="Settings"><Suspense fallback={<PageLoader />}><Settings /></Suspense></ModuleErrorBoundary>} />
              <Route path="reports" element={<ModuleErrorBoundary moduleName="Reports"><Suspense fallback={<PageLoader />}><Reports /></Suspense></ModuleErrorBoundary>} />
              <Route path="tally-help" element={<ModuleErrorBoundary moduleName="Help"><Suspense fallback={<PageLoader />}><TallyHelp /></Suspense></ModuleErrorBoundary>} />
              <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
            </Route>
          </Routes>
        </Suspense>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
