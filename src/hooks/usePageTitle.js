import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const titleMap = {
    '/': 'Dashboard',
    '/sales': 'Sales',
    '/sales/quotations': 'Quotations',
    '/sales/orders': 'Sales Orders',
    '/sales/invoices': 'Invoices',
    '/sales/payments': 'Payments',
    '/sales/credit-notes': 'Credit Notes',
    '/sales/debit-notes': 'Debit Notes',
    '/sales/delivery-notes': 'Delivery Notes',
    '/sales/targets': 'Sales Targets',
    '/sales/pricing-rules': 'Pricing Rules',
    '/purchase': 'Purchase',
    '/purchase/vendors': 'Vendors',
    '/purchase/rfqs': 'RFQs',
    '/purchase/orders': 'Purchase Orders',
    '/purchase/bills': 'Bills',
    '/accounting': 'Accounting',
    '/accounting/journals': 'Journals',
    '/accounting/chart-of-accounts': 'Chart of Accounts',
    '/crm': 'CRM',
    '/crm/leads': 'Leads',
    '/crm/opportunities': 'Opportunities',
    '/crm/contacts': 'Contacts',
    '/crm/activities': 'Activities',
    '/crm/pipeline': 'Pipeline',
    '/hr': 'HR',
    '/hr/employees': 'Employees',
    '/hr/attendance': 'Attendance',
    '/hr/leaves': 'Leaves',
    '/hr/payroll': 'Payroll',
    '/hr/performance': 'Performance',
    '/hr/org-chart': 'Org Chart',
    '/inventory': 'Inventory',
    '/products': 'Products',
    '/manufacturing': 'Manufacturing',
    '/settings': 'Settings',
}

export function usePageTitle(customTitle) {
    const location = useLocation()

    useEffect(() => {
        const baseTitle = 'Sic CRM'
        if (customTitle) {
            document.title = `${customTitle} - ${baseTitle}`
        } else {
            const pageTitle = titleMap[location.pathname]
            document.title = pageTitle ? `${pageTitle} - ${baseTitle}` : baseTitle
        }
    }, [location.pathname, customTitle])
}
