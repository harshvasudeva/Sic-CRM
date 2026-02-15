import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels = {
    sales: 'Sales',
    purchase: 'Purchase',
    accounting: 'Accounting',
    inventory: 'Inventory',
    products: 'Products',
    crm: 'CRM',
    hr: 'HR & Employees',
    manufacturing: 'Manufacturing',
    specialized: 'Specialized',
    influencer: 'Influencer',
    quotations: 'Quotations',
    orders: 'Sales Orders',
    invoices: 'Invoices',
    payments: 'Payments',
    'credit-notes': 'Credit Notes',
    'debit-notes': 'Debit Notes',
    'delivery-notes': 'Delivery Notes',
    targets: 'Sales Targets',
    'pricing-rules': 'Pricing Rules',
    commissions: 'Commissions',
    returns: 'Returns',
    employees: 'Employees',
    attendance: 'Attendance',
    leaves: 'Leaves',
    payroll: 'Payroll',
    performance: 'Performance',
    trainings: 'Trainings',
    recruitment: 'Recruitment',
    announcements: 'Announcements',
    expenses: 'Expenses',
    'org-chart': 'Org Chart',
    assets: 'Assets',
    'sales-scripts': 'Sales Scripts',
    leads: 'Leads',
    opportunities: 'Opportunities',
    contacts: 'Contacts',
    activities: 'Activities',
    pipeline: 'Pipeline',
    dashboard: 'Dashboard',
    vendors: 'Vendors',
    rfqs: 'RFQs',
    'purchase-orders': 'Purchase Orders',
    bills: 'Bills',
    journals: 'Journals',
    'chart-of-accounts': 'Chart of Accounts',
    reports: 'Reports',
    settings: 'Settings',
}

function Breadcrumbs() {
    const location = useLocation()
    const pathSegments = location.pathname.split('/').filter(Boolean)

    if (pathSegments.length === 0) return null

    const crumbs = pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/')
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        const isLast = index === pathSegments.length - 1

        return { path, label, isLast }
    })

    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-item breadcrumb-home">
                <Home size={14} />
            </Link>
            {crumbs.map((crumb, i) => (
                <span key={crumb.path} style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronRight size={14} className="breadcrumb-separator" />
                    {crumb.isLast ? (
                        <span className="breadcrumb-item breadcrumb-current">{crumb.label}</span>
                    ) : (
                        <Link to={crumb.path} className="breadcrumb-item">{crumb.label}</Link>
                    )}
                </span>
            ))}

            <style>{`
                .breadcrumbs {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    padding: 8px 0;
                    margin-bottom: 12px;
                    font-size: 0.8rem;
                    flex-wrap: wrap;
                }
                .breadcrumb-item {
                    color: var(--text-secondary);
                    text-decoration: none;
                    padding: 2px 6px;
                    border-radius: 4px;
                    transition: all 0.15s;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .breadcrumb-item:hover:not(.breadcrumb-current) {
                    color: var(--accent-primary);
                    background: rgba(99, 102, 241, 0.08);
                }
                .breadcrumb-current {
                    color: var(--text-primary);
                    font-weight: 500;
                }
                .breadcrumb-separator {
                    color: var(--text-muted);
                    opacity: 0.5;
                    flex-shrink: 0;
                }
                .breadcrumb-home {
                    color: var(--text-muted);
                }
                .breadcrumb-home:hover {
                    color: var(--accent-primary);
                }
            `}</style>
        </nav>
    )
}

export default Breadcrumbs
