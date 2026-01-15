# Sic CRM - Enterprise Resource Planning

A comprehensive ERP and CRM solution built with React, Vite, and modern UI design. Perfect for businesses transitioning from Tally or similar accounting software.

## 🎯 Features

### Core Modules
- **Sales Management**: Quotations, Sales Orders, Invoices, Credit Notes, Pricing Rules, Sales Targets, Invoice Templates
- **Purchase Management**: Vendors, Purchase Orders, Requisitions, RFQs, Goods Receipt Notes, Supplier Invoices, Returns, Evaluations
- **Accounting & Finance**: Journal Entries, General Ledger, Bank Accounts, Expenses, Budgets, Accounts Receivable/Payable, Chart of Accounts, Financial Reports, Fixed Assets, Cost Centers
- **Inventory Management**: Products, Stock Movement, Stock Transfers, Warehouses, Serial Numbers, Stock Groups, Units of Measure
- **CRM**: Leads, Opportunities, Contacts, Activities with pipeline management
- **HR & Payroll**: Employees, Attendance, Leaves, Payroll, Training, Performance, Expenses, Announcements, Departments
- **Manufacturing**: Bill of Materials, Work Centers, Production Orders
- **Specialized Modules**: Point of Sale (POS), Internal Chat/Discuss, Rentals, Website Builder

## ⌨️ Tally-Like Shortcuts & Features

### Voucher Shortcuts (F4-F10)
- **F4** - Contra Voucher (cash/bank transfers)
- **F5** - Payment Voucher (cash/bank payments)
- **F6** - Receipt Voucher (cash/bank receipts)
- **F7** - Journal Voucher (non-cash entries)
- **F8** - Sales Voucher (create sales invoices)
- **F9** - Purchase Voucher (create purchase invoices)
- **F10** - Memo Voucher (stock/accounting memos)

### Additional Voucher Shortcuts
- **Ctrl+F8** - Credit Note (issue to customers)
- **Ctrl+F9** - Debit Note (issue to vendors)
- **Alt+F8** - Delivery Challan (goods delivery)
- **Alt+F6** - Receipt Note (purchase returns)
- **Alt+F7** - Reversal Journal (reverse posted entries)
- **Alt+F10** - Stock Journal (adjust inventory)
- **Alt+P** - Physical Stock Verification

### Inventory Shortcuts
- Press `Ctrl+K` to open **Command Palette** - Quick search and access all features
- Navigate between Vouchers, Inventory, Accounting, Payroll, Reports, System tabs
- Arrow keys to navigate, Enter to select, Esc to close

### General Shortcuts
- **Ctrl+A** - Accept/Save
- **Ctrl+S** - Save current form
- **Ctrl+E** - Export data
- **Ctrl+I** - Import data
- **Ctrl+P** - Print
- **Ctrl+B** - Take backup
- **Ctrl+R** - Restore backup
- **Ctrl+F** - Find / Search
- **?** - View all keyboard shortcuts
- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo

### Tally Features Implemented
- ✅ **Multi-level Stock Groups** - Organize inventory by Raw, Finished, Consumables, Services
- ✅ **Multiple Units of Measure** - Define alternate units with conversion factors
- ✅ **Cost Centers** - Track expenses by department, project, location, employee, product
- ✅ **Budget & Cost Control** - Compare budgeted vs actual spending
- ✅ **Chart of Accounts** - Full COA structure with categories and sub-accounts
- ✅ **Multiple Price Lists** - Wholesale, Retail, Distributor, Special pricing
- ✅ **Bill-by-Bill** - Reference purchase orders to sales orders
- ✅ **Fixed Assets** - Track depreciable assets with automatic depreciation
- ✅ **GST/TDS Compliance** - Ready for Indian statutory reporting
- ✅ **Interest Calculation** - Auto-calculate on dues
- ✅ **Stock Categories** - Categorize items for better organization
- ✅ **Alternate Units** - Multiple units per item (e.g., Box, Pack, Carton)
- ✅ **Batch-wise Stock Tracking** - Track inventory by batch numbers
- ✅ **Excise & VAT** - Manufacturing excise and VAT tracking
- ✅ **Journal Entry Types** - Payment, Receipt, Contra, Journal, Sales, Purchase, Memo
- ✅ **Credit/Debit Notes** - Issue credit notes to customers, debit notes to vendors
- ✅ **Delivery Challans** - Create delivery notes for sales
- ✅ **Receipt Notes** - Document purchase returns
- ✅ **Stock Journal** - Manual stock adjustments
- ✅ **Physical Stock Verification** - Reconcile physical with book stock
- ✅ **Reversal Journal** - Reverse posted entries
- ✅ **Voucher Register** - View all vouchers by type
- ✅ **MIS Reports** - Management Information System reports
- ✅ **ESIC/PF** - Employee contribution tracking

### Advanced Features
- 📊 **Real-time Analytics** - Dashboard with charts and KPIs
- 💾 **Data Persistence** - localStorage for frontend, PostgreSQL for backend
- 📧 **Multi-currency Support** - Transact in multiple currencies
- 🏪 **Multiple Warehouses** - Godowns/Warehouses management
- 🔐 **Role-based Access Control** - Different user roles and permissions
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark Theme** - Glassmorphism design with blue/purple accents
- 🔔 **Local-first Approach** - Works offline with localStorage
- 📧 **Backend API** - RESTful API with Express.js and PostgreSQL
- 📧 **JWT Authentication** - Secure token-based authentication
- 📨 **Email Notifications** - Automated email alerts for invoices, quotations, etc.
- 📄 **PDF Generation** - Generate PDF invoices, quotations, and reports
- 📊 **Data Export/Import** - Excel and CSV support
- 📎 **File Upload** - Drag-and-drop file attachments

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation
```bash
# Install dependencies
npm install

# Start frontend
npm run dev

# Start backend (optional)
cd backend
npm run dev
```

### Backend Setup (Optional PostgreSQL)
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run dev
```

## 📁 Project Structure
```
sic-crm/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CommandPalette.jsx      # Quick access to all features
│   │   ├── ShortcutHelp.jsx        # Tally keyboard shortcuts
│   │   ├── DataTable.jsx           # Data table with filtering/sorting
│   │   ├── Modal.jsx               # Dialog components
│   │   ├── FormInput.jsx            # Form input components
│   │   └── ...
│   ├── pages/              # Main pages
│   │   ├── sales/          # Sales module pages
│   │   ├── purchase/        # Purchase module pages
│   │   ├── accounting/      # Accounting module pages
│   │   ├── inventory/       # Inventory module pages
│   │   ├── crm/            # CRM module pages
│   │   ├── hr/             # HR module pages
│   │   ├── manufacturing/  # Manufacturing module pages
│   │   ├── specialized/     # Specialized module pages
│   │   ├── products/       # Product management pages
│   │   └── tally-help.jsx  # Complete Tally reference
│   ├── stores/             # State management (localStorage based)
│   └── utils/             # Utility functions (API, export)
└── backend/               # Express.js API (optional)
    ├── src/
    │   ├── config/          # Database configuration
    │   ├── controllers/      # API route handlers
    │   ├── models/          # Database models
    │   ├── routes/          # API routes
    │   └── utils/          # PDF, Email, Export utilities
    └── uploads/            # File upload directory
```

## 🎨 Tech Stack
- **Frontend**: React 19.2, Vite 7.2.4
- **Routing**: React Router DOM 7.12
- **Animations**: Framer Motion 12.26
- **Icons**: Lucide React
- **Backend**: Express.js, PostgreSQL, JWT, Nodemailer, PDFKit, ExcelJS
- **Styling**: CSS-in-JS with CSS variables for theming

## 📚 For Tally Users

If you're coming from Tally or similar software, you'll feel right at home! The system includes:

1. **Familiar Voucher Types** - Payment (F5), Receipt (F6), Contra (F4), Journal (F7), Sales (F8), Purchase (F9)
2. **Command Palette** - Press `Ctrl+K` to quickly access any feature
3. **Stock Groups & Units** - Organize items like Tally with groups and multiple units
4. **Cost Centers** - Department-wise expense tracking
5. **GST/TDS Ready** - Support for Indian statutory compliance
6. **Bill-by-Bill** - Link purchase orders to sales orders
7. **Complete Accounting** - Balance Sheet, P&L, Trial Balance, Fixed Assets
8. **Multiple Price Lists** - Different price levels for different customer types

### Keyboard Shortcut Reference
| Action | Shortcut |
|---------|----------|
| Command Palette | `Ctrl+K` |
| Save | `Ctrl+S` |
| Print | `Ctrl+P` |
| Export | `Ctrl+E` |
| Backup | `Ctrl+B` |
| Find | `Ctrl+F` |
| Accept | `Ctrl+A` |
| Payment Voucher | `F5` |
| Receipt Voucher | `F6` |
| Journal Voucher | `F7` |
| Sales Voucher | `F8` |
| Purchase Voucher | `F9` |
| Memo Voucher | `F10` |
| Contra Voucher | `F4` |
| Credit Note | `Ctrl+F8` |
| Debit Note | `Ctrl+F9` |
| Help | `?` |

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📮 Support

For issues, questions, or feature requests, please open an issue on GitHub.
