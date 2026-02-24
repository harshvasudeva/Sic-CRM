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

// Influencer Module - Core
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

// Influencer Module - Analytics & Intelligence
const AudienceDemographics = React.lazy(() => import('./pages/influencer/AudienceDemographics'))
const BotDetection = React.lazy(() => import('./pages/influencer/BotDetection'))
const AudienceQuality = React.lazy(() => import('./pages/influencer/AudienceQuality'))
const NicheOverlap = React.lazy(() => import('./pages/influencer/NicheOverlap'))
const CompetitorAnalysis = React.lazy(() => import('./pages/influencer/CompetitorAnalysis'))
const SentimentAnalysis = React.lazy(() => import('./pages/influencer/SentimentAnalysis'))
const ViralityPrediction = React.lazy(() => import('./pages/influencer/ViralityPrediction'))
const SeasonalTrends = React.lazy(() => import('./pages/influencer/SeasonalTrends'))
const ContentFormatSplit = React.lazy(() => import('./pages/influencer/ContentFormatSplit'))
const ConsistencyTracker = React.lazy(() => import('./pages/influencer/ConsistencyTracker'))

// Influencer Module - Campaign Management
const CampaignBuilder = React.lazy(() => import('./pages/influencer/CampaignBuilder'))
const BriefGenerator = React.lazy(() => import('./pages/influencer/BriefGenerator'))
const DeliverablesTracker = React.lazy(() => import('./pages/influencer/DeliverablesTracker'))
const CampaignPerformance = React.lazy(() => import('./pages/influencer/CampaignPerformance'))
const MultiCreatorComparison = React.lazy(() => import('./pages/influencer/MultiCreatorComparison'))
const CampaignTemplates = React.lazy(() => import('./pages/influencer/CampaignTemplates'))
const BudgetAllocator = React.lazy(() => import('./pages/influencer/BudgetAllocator'))
const CampaignCalendar = React.lazy(() => import('./pages/influencer/CampaignCalendar'))
const ContentApproval = React.lazy(() => import('./pages/influencer/ContentApproval'))
const PostCampaignReport = React.lazy(() => import('./pages/influencer/PostCampaignReport'))

// Influencer Module - AI & Matching
const NaturalLanguageSearch = React.lazy(() => import('./pages/influencer/NaturalLanguageSearch'))
const LookalikeDiscovery = React.lazy(() => import('./pages/influencer/LookalikeDiscovery'))
const FitScoreExplainer = React.lazy(() => import('./pages/influencer/FitScoreExplainer'))
const AudiencePersonaGenerator = React.lazy(() => import('./pages/influencer/AudiencePersonaGenerator'))
const TrendAlignedSuggestions = React.lazy(() => import('./pages/influencer/TrendAlignedSuggestions'))
const GoalTemplates = React.lazy(() => import('./pages/influencer/GoalTemplates'))
const ExclusionFilters = React.lazy(() => import('./pages/influencer/ExclusionFilters'))
const CreatorTierClassification = React.lazy(() => import('./pages/influencer/CreatorTierClassification'))
const RematchAlerts = React.lazy(() => import('./pages/influencer/RematchAlerts'))
const CollaborativeFiltering = React.lazy(() => import('./pages/influencer/CollaborativeFiltering'))

// Influencer Module - Creator Outreach & CRM
const OutreachEmailGenerator = React.lazy(() => import('./pages/influencer/OutreachEmailGenerator'))
const OutreachStatusTracker = React.lazy(() => import('./pages/influencer/OutreachStatusTracker'))
const CreatorNotesTags = React.lazy(() => import('./pages/influencer/CreatorNotesTags'))
const CreatorWatchlist = React.lazy(() => import('./pages/influencer/CreatorWatchlist'))
const CreatorAlerts = React.lazy(() => import('./pages/influencer/CreatorAlerts'))
const ContactVault = React.lazy(() => import('./pages/influencer/ContactVault'))
const DealHistoryLog = React.lazy(() => import('./pages/influencer/DealHistoryLog'))

// Influencer Module - Team & Collaboration
const Workspaces = React.lazy(() => import('./pages/influencer/Workspaces'))
const SharedFavorites = React.lazy(() => import('./pages/influencer/SharedFavorites'))
const TeamActivityFeed = React.lazy(() => import('./pages/influencer/TeamActivityFeed'))
const CreatorProfileComments = React.lazy(() => import('./pages/influencer/CreatorProfileComments'))
const CampaignAssignments = React.lazy(() => import('./pages/influencer/CampaignAssignments'))

// Influencer Module - Monetization & Billing
const SubscriptionPlans = React.lazy(() => import('./pages/influencer/SubscriptionPlans'))
const UsageAnalytics = React.lazy(() => import('./pages/influencer/UsageAnalytics'))
const CreatorDbSize = React.lazy(() => import('./pages/influencer/CreatorDbSize'))
const BillingHistory = React.lazy(() => import('./pages/influencer/BillingHistory'))
const TrialMode = React.lazy(() => import('./pages/influencer/TrialMode'))

// Influencer Module - Platform Expansion
const TikTokCreators = React.lazy(() => import('./pages/influencer/TikTokCreators'))
const YouTubeCreators = React.lazy(() => import('./pages/influencer/YouTubeCreators'))
const CreatorOnboarding = React.lazy(() => import('./pages/influencer/CreatorOnboarding'))
const CreatorVerification = React.lazy(() => import('./pages/influencer/CreatorVerification'))
const ApiAccess = React.lazy(() => import('./pages/influencer/ApiAccess'))

// Influencer Module - Reporting & Export
const ReportBuilder = React.lazy(() => import('./pages/influencer/ReportBuilder'))
const ScheduledReports = React.lazy(() => import('./pages/influencer/ScheduledReports'))
const CreatorProfileExport = React.lazy(() => import('./pages/influencer/CreatorProfileExport'))
const DashboardEmbed = React.lazy(() => import('./pages/influencer/DashboardEmbed'))

// Influencer Module - Admin & Operations
const AdminDashboard = React.lazy(() => import('./pages/influencer/AdminDashboard'))
const DataRefreshScheduler = React.lazy(() => import('./pages/influencer/DataRefreshScheduler'))
const BulkImport = React.lazy(() => import('./pages/influencer/BulkImport'))
const UserManagement = React.lazy(() => import('./pages/influencer/UserManagement'))

// Influencer Module - UX
const SavedSearchPresets = React.lazy(() => import('./pages/influencer/SavedSearchPresets'))
const RecentlyViewed = React.lazy(() => import('./pages/influencer/RecentlyViewed'))
const KeyboardShortcuts = React.lazy(() => import('./pages/influencer/KeyboardShortcuts'))
const OnboardingWizard = React.lazy(() => import('./pages/influencer/OnboardingWizard'))
const WhatsNew = React.lazy(() => import('./pages/influencer/WhatsNew'))

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
                {/* Core */}
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

                {/* Analytics & Creator Intelligence */}
                <Route path="influencer/demographics" element={<Suspense fallback={<PageLoader />}><AudienceDemographics /></Suspense>} />
                <Route path="influencer/bot-detection" element={<Suspense fallback={<PageLoader />}><BotDetection /></Suspense>} />
                <Route path="influencer/audience-quality" element={<Suspense fallback={<PageLoader />}><AudienceQuality /></Suspense>} />
                <Route path="influencer/niche-overlap" element={<Suspense fallback={<PageLoader />}><NicheOverlap /></Suspense>} />
                <Route path="influencer/competitor-analysis" element={<Suspense fallback={<PageLoader />}><CompetitorAnalysis /></Suspense>} />
                <Route path="influencer/sentiment" element={<Suspense fallback={<PageLoader />}><SentimentAnalysis /></Suspense>} />
                <Route path="influencer/virality" element={<Suspense fallback={<PageLoader />}><ViralityPrediction /></Suspense>} />
                <Route path="influencer/seasonal-trends" element={<Suspense fallback={<PageLoader />}><SeasonalTrends /></Suspense>} />
                <Route path="influencer/content-format" element={<Suspense fallback={<PageLoader />}><ContentFormatSplit /></Suspense>} />
                <Route path="influencer/consistency" element={<Suspense fallback={<PageLoader />}><ConsistencyTracker /></Suspense>} />

                {/* Campaign Management */}
                <Route path="influencer/campaign-builder" element={<Suspense fallback={<PageLoader />}><CampaignBuilder /></Suspense>} />
                <Route path="influencer/brief-generator" element={<Suspense fallback={<PageLoader />}><BriefGenerator /></Suspense>} />
                <Route path="influencer/deliverables" element={<Suspense fallback={<PageLoader />}><DeliverablesTracker /></Suspense>} />
                <Route path="influencer/performance" element={<Suspense fallback={<PageLoader />}><CampaignPerformance /></Suspense>} />
                <Route path="influencer/creator-comparison" element={<Suspense fallback={<PageLoader />}><MultiCreatorComparison /></Suspense>} />
                <Route path="influencer/templates" element={<Suspense fallback={<PageLoader />}><CampaignTemplates /></Suspense>} />
                <Route path="influencer/budget-allocator" element={<Suspense fallback={<PageLoader />}><BudgetAllocator /></Suspense>} />
                <Route path="influencer/calendar" element={<Suspense fallback={<PageLoader />}><CampaignCalendar /></Suspense>} />
                <Route path="influencer/content-approval" element={<Suspense fallback={<PageLoader />}><ContentApproval /></Suspense>} />
                <Route path="influencer/post-campaign-report" element={<Suspense fallback={<PageLoader />}><PostCampaignReport /></Suspense>} />

                {/* AI & Matching */}
                <Route path="influencer/nl-search" element={<Suspense fallback={<PageLoader />}><NaturalLanguageSearch /></Suspense>} />
                <Route path="influencer/lookalike" element={<Suspense fallback={<PageLoader />}><LookalikeDiscovery /></Suspense>} />
                <Route path="influencer/fit-score" element={<Suspense fallback={<PageLoader />}><FitScoreExplainer /></Suspense>} />
                <Route path="influencer/persona-generator" element={<Suspense fallback={<PageLoader />}><AudiencePersonaGenerator /></Suspense>} />
                <Route path="influencer/trend-suggestions" element={<Suspense fallback={<PageLoader />}><TrendAlignedSuggestions /></Suspense>} />
                <Route path="influencer/goal-templates" element={<Suspense fallback={<PageLoader />}><GoalTemplates /></Suspense>} />
                <Route path="influencer/exclusion-filters" element={<Suspense fallback={<PageLoader />}><ExclusionFilters /></Suspense>} />
                <Route path="influencer/tier-classification" element={<Suspense fallback={<PageLoader />}><CreatorTierClassification /></Suspense>} />
                <Route path="influencer/rematch-alerts" element={<Suspense fallback={<PageLoader />}><RematchAlerts /></Suspense>} />
                <Route path="influencer/collaborative-filtering" element={<Suspense fallback={<PageLoader />}><CollaborativeFiltering /></Suspense>} />

                {/* Creator Outreach & CRM */}
                <Route path="influencer/email-generator" element={<Suspense fallback={<PageLoader />}><OutreachEmailGenerator /></Suspense>} />
                <Route path="influencer/outreach-tracker" element={<Suspense fallback={<PageLoader />}><OutreachStatusTracker /></Suspense>} />
                <Route path="influencer/notes-tags" element={<Suspense fallback={<PageLoader />}><CreatorNotesTags /></Suspense>} />
                <Route path="influencer/watchlist" element={<Suspense fallback={<PageLoader />}><CreatorWatchlist /></Suspense>} />
                <Route path="influencer/alerts" element={<Suspense fallback={<PageLoader />}><CreatorAlerts /></Suspense>} />
                <Route path="influencer/contact-vault" element={<Suspense fallback={<PageLoader />}><ContactVault /></Suspense>} />
                <Route path="influencer/deal-history" element={<Suspense fallback={<PageLoader />}><DealHistoryLog /></Suspense>} />

                {/* Team & Collaboration */}
                <Route path="influencer/workspaces" element={<Suspense fallback={<PageLoader />}><Workspaces /></Suspense>} />
                <Route path="influencer/shared-favorites" element={<Suspense fallback={<PageLoader />}><SharedFavorites /></Suspense>} />
                <Route path="influencer/activity-feed" element={<Suspense fallback={<PageLoader />}><TeamActivityFeed /></Suspense>} />
                <Route path="influencer/comments" element={<Suspense fallback={<PageLoader />}><CreatorProfileComments /></Suspense>} />
                <Route path="influencer/assignments" element={<Suspense fallback={<PageLoader />}><CampaignAssignments /></Suspense>} />

                {/* Monetization & Billing */}
                <Route path="influencer/subscription" element={<Suspense fallback={<PageLoader />}><SubscriptionPlans /></Suspense>} />
                <Route path="influencer/usage" element={<Suspense fallback={<PageLoader />}><UsageAnalytics /></Suspense>} />
                <Route path="influencer/db-size" element={<Suspense fallback={<PageLoader />}><CreatorDbSize /></Suspense>} />
                <Route path="influencer/billing" element={<Suspense fallback={<PageLoader />}><BillingHistory /></Suspense>} />
                <Route path="influencer/trial" element={<Suspense fallback={<PageLoader />}><TrialMode /></Suspense>} />

                {/* Platform Expansion */}
                <Route path="influencer/tiktok" element={<Suspense fallback={<PageLoader />}><TikTokCreators /></Suspense>} />
                <Route path="influencer/youtube" element={<Suspense fallback={<PageLoader />}><YouTubeCreators /></Suspense>} />
                <Route path="influencer/creator-onboarding" element={<Suspense fallback={<PageLoader />}><CreatorOnboarding /></Suspense>} />
                <Route path="influencer/verification" element={<Suspense fallback={<PageLoader />}><CreatorVerification /></Suspense>} />
                <Route path="influencer/api-access" element={<Suspense fallback={<PageLoader />}><ApiAccess /></Suspense>} />

                {/* Reporting & Export */}
                <Route path="influencer/report-builder" element={<Suspense fallback={<PageLoader />}><ReportBuilder /></Suspense>} />
                <Route path="influencer/scheduled-reports" element={<Suspense fallback={<PageLoader />}><ScheduledReports /></Suspense>} />
                <Route path="influencer/profile-export" element={<Suspense fallback={<PageLoader />}><CreatorProfileExport /></Suspense>} />
                <Route path="influencer/embed" element={<Suspense fallback={<PageLoader />}><DashboardEmbed /></Suspense>} />

                {/* Admin & Operations */}
                <Route path="influencer/admin" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
                <Route path="influencer/refresh-scheduler" element={<Suspense fallback={<PageLoader />}><DataRefreshScheduler /></Suspense>} />
                <Route path="influencer/bulk-import" element={<Suspense fallback={<PageLoader />}><BulkImport /></Suspense>} />
                <Route path="influencer/user-management" element={<Suspense fallback={<PageLoader />}><UserManagement /></Suspense>} />

                {/* UX */}
                <Route path="influencer/saved-searches" element={<Suspense fallback={<PageLoader />}><SavedSearchPresets /></Suspense>} />
                <Route path="influencer/recently-viewed" element={<Suspense fallback={<PageLoader />}><RecentlyViewed /></Suspense>} />
                <Route path="influencer/shortcuts" element={<Suspense fallback={<PageLoader />}><KeyboardShortcuts /></Suspense>} />
                <Route path="influencer/onboarding" element={<Suspense fallback={<PageLoader />}><OnboardingWizard /></Suspense>} />
                <Route path="influencer/whats-new" element={<Suspense fallback={<PageLoader />}><WhatsNew /></Suspense>} />
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
