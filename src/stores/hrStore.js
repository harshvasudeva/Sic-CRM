// Comprehensive HR Store with localStorage persistence

const STORAGE_KEYS = {
    employees: 'sic-crm-employees',
    departments: 'sic-crm-departments',
    attendance: 'sic-crm-attendance',
    leaves: 'sic-crm-leaves',
    payroll: 'sic-crm-payroll',
    documents: 'sic-crm-hr-docs',
    announcements: 'sic-crm-announcements',
    trainings: 'sic-crm-trainings',
    performance: 'sic-crm-performance',
    expenses: 'sic-crm-expenses'
}

// ==================== DEPARTMENTS ====================
const initialDepartments = [
    { id: 'dept-001', name: 'Engineering', head: 'emp-001', budget: 500000, employeeCount: 12 },
    { id: 'dept-002', name: 'Sales', head: 'emp-002', budget: 300000, employeeCount: 8 },
    { id: 'dept-003', name: 'Marketing', head: 'emp-003', budget: 200000, employeeCount: 5 },
    { id: 'dept-004', name: 'Human Resources', head: 'emp-004', budget: 150000, employeeCount: 4 },
    { id: 'dept-005', name: 'Finance', head: 'emp-005', budget: 250000, employeeCount: 6 },
    { id: 'dept-006', name: 'Operations', head: null, budget: 180000, employeeCount: 7 }
]

// ==================== EMPLOYEES ====================
const initialEmployees = [
    {
        id: 'emp-001',
        employeeId: 'EMP-2024-001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@siccrm.com',
        phone: '+1-555-0101',
        department: 'Engineering',
        position: 'CTO',
        employmentType: 'full-time',
        status: 'active',
        hireDate: '2020-01-15',
        salary: 150000,
        manager: null,
        skills: ['Leadership', 'System Design', 'Python', 'Cloud Architecture'],
        workLocation: 'office',
        address: '123 Tech Ave, San Francisco, CA',
        emergencyContact: { name: 'Jane Smith', phone: '+1-555-0102', relation: 'Spouse' },
        bankDetails: { accountName: 'John Smith', accountNumber: '****4521', bankName: 'Chase' },
        documents: ['contract', 'nda', 'tax-w4'],
        leaveBalance: { annual: 18, sick: 10, personal: 3 },
        avatar: null,
        dateOfBirth: '1985-06-20',
        gender: 'male',
        nationality: 'American',
        probationEnd: null,
        createdAt: '2020-01-15'
    },
    {
        id: 'emp-002',
        employeeId: 'EMP-2024-002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@siccrm.com',
        phone: '+1-555-0103',
        department: 'Sales',
        position: 'Sales Director',
        employmentType: 'full-time',
        status: 'active',
        hireDate: '2021-03-20',
        salary: 120000,
        manager: 'emp-001',
        skills: ['Sales Strategy', 'Negotiation', 'CRM', 'Team Management'],
        workLocation: 'hybrid',
        address: '456 Market St, San Francisco, CA',
        emergencyContact: { name: 'Mike Johnson', phone: '+1-555-0104', relation: 'Brother' },
        bankDetails: { accountName: 'Sarah Johnson', accountNumber: '****7832', bankName: 'Bank of America' },
        documents: ['contract', 'nda'],
        leaveBalance: { annual: 15, sick: 8, personal: 2 },
        avatar: null,
        dateOfBirth: '1988-11-12',
        gender: 'female',
        nationality: 'American',
        probationEnd: null,
        createdAt: '2021-03-20'
    },
    {
        id: 'emp-003',
        employeeId: 'EMP-2024-003',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@siccrm.com',
        phone: '+1-555-0105',
        department: 'Marketing',
        position: 'Marketing Manager',
        employmentType: 'full-time',
        status: 'active',
        hireDate: '2022-07-01',
        salary: 95000,
        manager: 'emp-001',
        skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
        workLocation: 'remote',
        address: '789 Innovation Blvd, Austin, TX',
        emergencyContact: { name: 'Lisa Chen', phone: '+1-555-0106', relation: 'Spouse' },
        bankDetails: { accountName: 'Michael Chen', accountNumber: '****2145', bankName: 'Wells Fargo' },
        documents: ['contract', 'nda', 'remote-agreement'],
        leaveBalance: { annual: 12, sick: 6, personal: 2 },
        avatar: null,
        dateOfBirth: '1990-04-25',
        gender: 'male',
        nationality: 'American',
        probationEnd: null,
        createdAt: '2022-07-01'
    },
    {
        id: 'emp-004',
        employeeId: 'EMP-2024-004',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@siccrm.com',
        phone: '+1-555-0107',
        department: 'Human Resources',
        position: 'HR Manager',
        employmentType: 'full-time',
        status: 'active',
        hireDate: '2021-09-15',
        salary: 85000,
        manager: 'emp-001',
        skills: ['Recruitment', 'Employee Relations', 'Compensation', 'Training'],
        workLocation: 'office',
        address: '321 HR Lane, San Francisco, CA',
        emergencyContact: { name: 'Robert Davis', phone: '+1-555-0108', relation: 'Father' },
        bankDetails: { accountName: 'Emily Davis', accountNumber: '****9876', bankName: 'Chase' },
        documents: ['contract', 'nda'],
        leaveBalance: { annual: 14, sick: 8, personal: 3 },
        avatar: null,
        dateOfBirth: '1992-08-18',
        gender: 'female',
        nationality: 'American',
        probationEnd: null,
        createdAt: '2021-09-15'
    },
    {
        id: 'emp-005',
        employeeId: 'EMP-2024-005',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@siccrm.com',
        phone: '+1-555-0109',
        department: 'Finance',
        position: 'CFO',
        employmentType: 'full-time',
        status: 'active',
        hireDate: '2020-06-01',
        salary: 140000,
        manager: null,
        skills: ['Financial Planning', 'Accounting', 'Risk Management', 'Budgeting'],
        workLocation: 'office',
        address: '555 Finance Dr, San Francisco, CA',
        emergencyContact: { name: 'Mary Wilson', phone: '+1-555-0110', relation: 'Spouse' },
        bankDetails: { accountName: 'David Wilson', accountNumber: '****3456', bankName: 'Citi' },
        documents: ['contract', 'nda', 'tax-w4'],
        leaveBalance: { annual: 20, sick: 10, personal: 4 },
        avatar: null,
        dateOfBirth: '1980-12-05',
        gender: 'male',
        nationality: 'American',
        probationEnd: null,
        createdAt: '2020-06-01'
    },
    {
        id: 'emp-006',
        employeeId: 'EMP-2024-006',
        firstName: 'Jessica',
        lastName: 'Brown',
        email: 'jessica.brown@siccrm.com',
        phone: '+1-555-0111',
        department: 'Engineering',
        position: 'Senior Developer',
        employmentType: 'full-time',
        status: 'active',
        hireDate: '2023-01-10',
        salary: 110000,
        manager: 'emp-001',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
        workLocation: 'hybrid',
        address: '888 Code St, San Jose, CA',
        emergencyContact: { name: 'Tom Brown', phone: '+1-555-0112', relation: 'Brother' },
        bankDetails: { accountName: 'Jessica Brown', accountNumber: '****6543', bankName: 'Chase' },
        documents: ['contract', 'nda'],
        leaveBalance: { annual: 10, sick: 5, personal: 2 },
        avatar: null,
        dateOfBirth: '1994-02-14',
        gender: 'female',
        nationality: 'American',
        probationEnd: '2023-04-10',
        createdAt: '2023-01-10'
    },
    {
        id: 'emp-007',
        employeeId: 'EMP-2024-007',
        firstName: 'Alex',
        lastName: 'Martinez',
        email: 'alex.martinez@siccrm.com',
        phone: '+1-555-0113',
        department: 'Engineering',
        position: 'DevOps Engineer',
        employmentType: 'contract',
        status: 'active',
        hireDate: '2024-06-01',
        salary: 95000,
        manager: 'emp-001',
        skills: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
        workLocation: 'remote',
        address: '999 Cloud Ave, Seattle, WA',
        emergencyContact: { name: 'Maria Martinez', phone: '+1-555-0114', relation: 'Mother' },
        bankDetails: { accountName: 'Alex Martinez', accountNumber: '****1234', bankName: 'US Bank' },
        documents: ['contract'],
        leaveBalance: { annual: 8, sick: 4, personal: 1 },
        avatar: null,
        dateOfBirth: '1996-09-30',
        gender: 'non-binary',
        nationality: 'American',
        probationEnd: '2024-09-01',
        createdAt: '2024-06-01'
    },
    {
        id: 'emp-008',
        employeeId: 'EMP-2024-008',
        firstName: 'Rachel',
        lastName: 'Kim',
        email: 'rachel.kim@siccrm.com',
        phone: '+1-555-0115',
        department: 'Sales',
        position: 'Account Executive',
        employmentType: 'full-time',
        status: 'on-leave',
        hireDate: '2023-04-15',
        salary: 75000,
        manager: 'emp-002',
        skills: ['B2B Sales', 'Account Management', 'Presentations', 'Salesforce'],
        workLocation: 'office',
        address: '444 Sales Way, San Francisco, CA',
        emergencyContact: { name: 'James Kim', phone: '+1-555-0116', relation: 'Spouse' },
        bankDetails: { accountName: 'Rachel Kim', accountNumber: '****8765', bankName: 'Chase' },
        documents: ['contract', 'nda'],
        leaveBalance: { annual: 8, sick: 3, personal: 1 },
        avatar: null,
        dateOfBirth: '1991-07-22',
        gender: 'female',
        nationality: 'Korean-American',
        probationEnd: null,
        createdAt: '2023-04-15'
    }
]

// ==================== ATTENDANCE ====================
const generateAttendance = () => {
    const attendance = []
    const today = new Date()

    initialEmployees.slice(0, 5).forEach(emp => {
        for (let i = 0; i < 10; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
                attendance.push({
                    id: `att-${emp.id}-${i}`,
                    employeeId: emp.id,
                    date: date.toISOString().split('T')[0],
                    checkIn: '09:' + String(Math.floor(Math.random() * 30)).padStart(2, '0'),
                    checkOut: '17:' + String(30 + Math.floor(Math.random() * 30)).padStart(2, '0'),
                    status: Math.random() > 0.9 ? 'late' : 'present',
                    workHours: 8 + Math.random().toFixed(1),
                    overtime: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
                    notes: ''
                })
            }
        }
    })
    return attendance
}

// ==================== LEAVE REQUESTS ====================
const initialLeaves = [
    {
        id: 'leave-001',
        employeeId: 'emp-008',
        type: 'annual',
        startDate: '2026-01-10',
        endDate: '2026-01-20',
        days: 7,
        reason: 'Family vacation',
        status: 'approved',
        approvedBy: 'emp-002',
        appliedOn: '2025-12-20',
        documents: []
    },
    {
        id: 'leave-002',
        employeeId: 'emp-003',
        type: 'sick',
        startDate: '2026-01-08',
        endDate: '2026-01-09',
        days: 2,
        reason: 'Medical appointment',
        status: 'approved',
        approvedBy: 'emp-001',
        appliedOn: '2026-01-07',
        documents: ['medical-certificate']
    },
    {
        id: 'leave-003',
        employeeId: 'emp-006',
        type: 'annual',
        startDate: '2026-01-25',
        endDate: '2026-01-28',
        days: 3,
        reason: 'Personal time off',
        status: 'pending',
        approvedBy: null,
        appliedOn: '2026-01-14',
        documents: []
    }
]

// ==================== PAYROLL ====================
const initialPayroll = [
    {
        id: 'pay-001',
        employeeId: 'emp-001',
        period: '2026-01',
        basicSalary: 12500,
        overtime: 0,
        bonus: 2000,
        deductions: { tax: 3500, insurance: 500, retirement: 625 },
        netSalary: 9875,
        status: 'paid',
        paidOn: '2026-01-01'
    },
    {
        id: 'pay-002',
        employeeId: 'emp-002',
        period: '2026-01',
        basicSalary: 10000,
        overtime: 500,
        bonus: 1500,
        deductions: { tax: 2800, insurance: 450, retirement: 500 },
        netSalary: 8250,
        status: 'paid',
        paidOn: '2026-01-01'
    }
]

// ==================== TRAININGS ====================
const initialTrainings = [
    {
        id: 'train-001',
        title: 'Leadership Development Program',
        description: 'Comprehensive leadership training for managers',
        instructor: 'External - Leadership Institute',
        startDate: '2026-02-01',
        endDate: '2026-02-15',
        duration: '40 hours',
        mode: 'hybrid',
        capacity: 20,
        enrolled: ['emp-002', 'emp-003', 'emp-004'],
        status: 'upcoming',
        category: 'leadership'
    },
    {
        id: 'train-002',
        title: 'Advanced React & TypeScript',
        description: 'Technical training for frontend developers',
        instructor: 'emp-006',
        startDate: '2026-01-20',
        endDate: '2026-01-22',
        duration: '24 hours',
        mode: 'online',
        capacity: 15,
        enrolled: ['emp-007'],
        status: 'upcoming',
        category: 'technical'
    },
    {
        id: 'train-003',
        title: 'Workplace Safety & Compliance',
        description: 'Mandatory annual safety training',
        instructor: 'HR Department',
        startDate: '2026-01-10',
        endDate: '2026-01-10',
        duration: '4 hours',
        mode: 'in-person',
        capacity: 50,
        enrolled: initialEmployees.map(e => e.id),
        status: 'completed',
        category: 'compliance'
    }
]

// ==================== PERFORMANCE ====================
const initialPerformance = [
    {
        id: 'perf-001',
        employeeId: 'emp-006',
        reviewPeriod: 'Q4 2025',
        reviewDate: '2025-12-20',
        reviewer: 'emp-001',
        overallRating: 4.5,
        ratings: {
            productivity: 5,
            quality: 4,
            teamwork: 5,
            communication: 4,
            initiative: 4
        },
        goals: [
            { goal: 'Complete API migration', status: 'completed', score: 5 },
            { goal: 'Mentor junior developers', status: 'completed', score: 4 },
            { goal: 'Improve test coverage to 80%', status: 'in-progress', score: 3 }
        ],
        strengths: 'Excellent technical skills, great team player',
        improvements: 'Could improve documentation practices',
        status: 'completed'
    }
]

// ==================== ANNOUNCEMENTS ====================
const initialAnnouncements = [
    {
        id: 'ann-001',
        title: 'Company All-Hands Meeting',
        content: 'Join us for our quarterly all-hands meeting on January 20th at 2 PM PST.',
        author: 'emp-001',
        priority: 'high',
        departments: ['all'],
        createdAt: '2026-01-10',
        expiresAt: '2026-01-21',
        pinned: true
    },
    {
        id: 'ann-002',
        title: 'New Health Insurance Benefits',
        content: 'We are excited to announce enhanced health insurance coverage starting February 1st.',
        author: 'emp-004',
        priority: 'medium',
        departments: ['all'],
        createdAt: '2026-01-08',
        expiresAt: '2026-02-01',
        pinned: false
    },
    {
        id: 'ann-003',
        title: 'Engineering Team Building Event',
        content: 'Engineering team building event scheduled for January 25th. Please RSVP by Jan 18th.',
        author: 'emp-001',
        priority: 'low',
        departments: ['Engineering'],
        createdAt: '2026-01-05',
        expiresAt: '2026-01-26',
        pinned: false
    }
]

// ==================== EXPENSES ====================
const initialExpenses = [
    {
        id: 'exp-001',
        employeeId: 'emp-002',
        category: 'travel',
        amount: 450.00,
        description: 'Flight to NYC for client meeting',
        date: '2026-01-05',
        receipt: 'receipt-001.pdf',
        status: 'approved',
        approvedBy: 'emp-005',
        approvedOn: '2026-01-07'
    },
    {
        id: 'exp-002',
        employeeId: 'emp-003',
        category: 'software',
        amount: 99.00,
        description: 'Adobe Creative Cloud subscription',
        date: '2026-01-10',
        receipt: 'receipt-002.pdf',
        status: 'pending',
        approvedBy: null,
        approvedOn: null
    }
]

// ==================== HELPER FUNCTIONS ====================
function getStore(key, initial) {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
}

function setStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
}

// ==================== EMPLOYEES CRUD ====================
export function getEmployees() {
    return getStore(STORAGE_KEYS.employees, initialEmployees)
}

export function getEmployee(id) {
    return getEmployees().find(e => e.id === id)
}

export function createEmployee(data) {
    const employees = getEmployees()
    const newEmployee = {
        ...data,
        id: `emp-${Date.now()}`,
        employeeId: `EMP-${new Date().getFullYear()}-${String(employees.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString().split('T')[0],
        leaveBalance: { annual: 15, sick: 10, personal: 3 },
        documents: []
    }
    employees.push(newEmployee)
    setStore(STORAGE_KEYS.employees, employees)
    return newEmployee
}

export function updateEmployee(id, data) {
    const employees = getEmployees()
    const index = employees.findIndex(e => e.id === id)
    if (index === -1) return null
    employees[index] = { ...employees[index], ...data }
    setStore(STORAGE_KEYS.employees, employees)
    return employees[index]
}

export function deleteEmployee(id) {
    const employees = getEmployees().filter(e => e.id !== id)
    setStore(STORAGE_KEYS.employees, employees)
    return true
}

// ==================== DEPARTMENTS ====================
export function getDepartments() {
    return getStore(STORAGE_KEYS.departments, initialDepartments)
}

export function createDepartment(data) {
    const departments = getDepartments()
    const newDept = { ...data, id: `dept-${Date.now()}` }
    departments.push(newDept)
    setStore(STORAGE_KEYS.departments, departments)
    return newDept
}

export function updateDepartment(id, data) {
    const departments = getDepartments()
    const index = departments.findIndex(d => d.id === id)
    if (index === -1) return null
    departments[index] = { ...departments[index], ...data }
    setStore(STORAGE_KEYS.departments, departments)
    return departments[index]
}

// ==================== ATTENDANCE ====================
export function getAttendance(filters = {}) {
    let attendance = getStore(STORAGE_KEYS.attendance, generateAttendance())
    if (filters.employeeId) {
        attendance = attendance.filter(a => a.employeeId === filters.employeeId)
    }
    if (filters.date) {
        attendance = attendance.filter(a => a.date === filters.date)
    }
    return attendance
}

export function checkIn(employeeId) {
    const attendance = getAttendance()
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toTimeString().slice(0, 5)

    const existing = attendance.find(a => a.employeeId === employeeId && a.date === today)
    if (existing) return existing

    const newRecord = {
        id: `att-${Date.now()}`,
        employeeId,
        date: today,
        checkIn: now,
        checkOut: null,
        status: now > '09:30' ? 'late' : 'present',
        workHours: 0,
        overtime: 0,
        notes: ''
    }
    attendance.push(newRecord)
    setStore(STORAGE_KEYS.attendance, attendance)
    return newRecord
}

export function checkOut(employeeId) {
    const attendance = getAttendance()
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toTimeString().slice(0, 5)

    const index = attendance.findIndex(a => a.employeeId === employeeId && a.date === today)
    if (index === -1) return null

    attendance[index].checkOut = now
    // Calculate work hours
    const [inH, inM] = attendance[index].checkIn.split(':').map(Number)
    const [outH, outM] = now.split(':').map(Number)
    attendance[index].workHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60
    attendance[index].overtime = Math.max(0, attendance[index].workHours - 8)

    setStore(STORAGE_KEYS.attendance, attendance)
    return attendance[index]
}

// ==================== LEAVES ====================
export function getLeaves(filters = {}) {
    let leaves = getStore(STORAGE_KEYS.leaves, initialLeaves)
    if (filters.employeeId) {
        leaves = leaves.filter(l => l.employeeId === filters.employeeId)
    }
    if (filters.status) {
        leaves = leaves.filter(l => l.status === filters.status)
    }
    return leaves
}

export function applyLeave(data) {
    const leaves = getLeaves()
    const newLeave = {
        ...data,
        id: `leave-${Date.now()}`,
        status: 'pending',
        approvedBy: null,
        appliedOn: new Date().toISOString().split('T')[0]
    }
    leaves.push(newLeave)
    setStore(STORAGE_KEYS.leaves, leaves)
    return newLeave
}

export function updateLeaveStatus(id, status, approverId) {
    const leaves = getLeaves()
    const index = leaves.findIndex(l => l.id === id)
    if (index === -1) return null
    leaves[index].status = status
    leaves[index].approvedBy = approverId
    setStore(STORAGE_KEYS.leaves, leaves)

    // Update employee leave balance if approved
    if (status === 'approved') {
        const employee = getEmployee(leaves[index].employeeId)
        if (employee) {
            const type = leaves[index].type
            employee.leaveBalance[type] -= leaves[index].days
            updateEmployee(employee.id, { leaveBalance: employee.leaveBalance })
        }
    }

    return leaves[index]
}

// ==================== PAYROLL ====================
export function getPayroll(filters = {}) {
    let payroll = getStore(STORAGE_KEYS.payroll, initialPayroll)
    if (filters.employeeId) {
        payroll = payroll.filter(p => p.employeeId === filters.employeeId)
    }
    if (filters.period) {
        payroll = payroll.filter(p => p.period === filters.period)
    }
    return payroll
}

export function generatePayroll(employeeId, period) {
    const employee = getEmployee(employeeId)
    if (!employee) return null

    const monthlySalary = employee.salary / 12
    const tax = monthlySalary * 0.28
    const insurance = 500
    const retirement = monthlySalary * 0.05

    const payroll = getPayroll()
    const newPayroll = {
        id: `pay-${Date.now()}`,
        employeeId,
        period,
        basicSalary: monthlySalary,
        overtime: 0,
        bonus: 0,
        deductions: { tax, insurance, retirement },
        netSalary: monthlySalary - tax - insurance - retirement,
        status: 'pending',
        paidOn: null
    }
    payroll.push(newPayroll)
    setStore(STORAGE_KEYS.payroll, payroll)
    return newPayroll
}

// ==================== TRAININGS ====================
export function getTrainings() {
    return getStore(STORAGE_KEYS.trainings, initialTrainings)
}

export function createTraining(data) {
    const trainings = getTrainings()
    const newTraining = { ...data, id: `train-${Date.now()}`, enrolled: [] }
    trainings.push(newTraining)
    setStore(STORAGE_KEYS.trainings, trainings)
    return newTraining
}

export function enrollInTraining(trainingId, employeeId) {
    const trainings = getTrainings()
    const index = trainings.findIndex(t => t.id === trainingId)
    if (index === -1) return null
    if (!trainings[index].enrolled.includes(employeeId)) {
        trainings[index].enrolled.push(employeeId)
    }
    setStore(STORAGE_KEYS.trainings, trainings)
    return trainings[index]
}

// ==================== PERFORMANCE ====================
export function getPerformanceReviews(filters = {}) {
    let reviews = getStore(STORAGE_KEYS.performance, initialPerformance)
    if (filters.employeeId) {
        reviews = reviews.filter(r => r.employeeId === filters.employeeId)
    }
    return reviews
}

export function createPerformanceReview(data) {
    const reviews = getPerformanceReviews()
    const newReview = { ...data, id: `perf-${Date.now()}`, status: 'draft' }
    reviews.push(newReview)
    setStore(STORAGE_KEYS.performance, reviews)
    return newReview
}

// ==================== ANNOUNCEMENTS ====================
export function getAnnouncements() {
    return getStore(STORAGE_KEYS.announcements, initialAnnouncements)
}

export function createAnnouncement(data) {
    const announcements = getAnnouncements()
    const newAnn = {
        ...data,
        id: `ann-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
    }
    announcements.push(newAnn)
    setStore(STORAGE_KEYS.announcements, announcements)
    return newAnn
}

// ==================== EXPENSES ====================
export function getExpenses(filters = {}) {
    let expenses = getStore(STORAGE_KEYS.expenses, initialExpenses)
    if (filters.employeeId) {
        expenses = expenses.filter(e => e.employeeId === filters.employeeId)
    }
    if (filters.status) {
        expenses = expenses.filter(e => e.status === filters.status)
    }
    return expenses
}

export function submitExpense(data) {
    const expenses = getExpenses()
    const newExpense = {
        ...data,
        id: `exp-${Date.now()}`,
        status: 'pending',
        approvedBy: null,
        approvedOn: null
    }
    expenses.push(newExpense)
    setStore(STORAGE_KEYS.expenses, expenses)
    return newExpense
}

export function approveExpense(id, approverId) {
    const expenses = getExpenses()
    const index = expenses.findIndex(e => e.id === id)
    if (index === -1) return null
    expenses[index].status = 'approved'
    expenses[index].approvedBy = approverId
    expenses[index].approvedOn = new Date().toISOString().split('T')[0]
    setStore(STORAGE_KEYS.expenses, expenses)
    return expenses[index]
}

// ==================== STATISTICS ====================
export function getHRStats() {
    const employees = getEmployees()
    const leaves = getLeaves()
    const attendance = getAttendance()
    const today = new Date().toISOString().split('T')[0]

    return {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.status === 'active').length,
        onLeave: employees.filter(e => e.status === 'on-leave').length,
        newHires: employees.filter(e => {
            const hireDate = new Date(e.hireDate)
            const monthAgo = new Date()
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return hireDate >= monthAgo
        }).length,
        pendingLeaves: leaves.filter(l => l.status === 'pending').length,
        todayAttendance: attendance.filter(a => a.date === today).length,
        departments: getDepartments().length,
        averageTenure: calculateAverageTenure(employees),
        genderDistribution: calculateGenderDistribution(employees),
        departmentDistribution: calculateDepartmentDistribution(employees)
    }
}

function calculateAverageTenure(employees) {
    const now = new Date()
    const totalMonths = employees.reduce((sum, emp) => {
        const hireDate = new Date(emp.hireDate)
        return sum + ((now - hireDate) / (1000 * 60 * 60 * 24 * 30))
    }, 0)
    return (totalMonths / employees.length / 12).toFixed(1)
}

function calculateGenderDistribution(employees) {
    const distribution = {}
    employees.forEach(e => {
        distribution[e.gender] = (distribution[e.gender] || 0) + 1
    })
    return distribution
}

function calculateDepartmentDistribution(employees) {
    const distribution = {}
    employees.forEach(e => {
        distribution[e.department] = (distribution[e.department] || 0) + 1
    })
    return distribution
}
