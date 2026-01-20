const API_URL = 'http://localhost:5000/api/hr'

async function fetchAPI(endpoint, options = {}) {
    try {
        const res = await fetch(`${API_URL}${endpoint}`, options)
        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'API Request Failed')
        }
        return await res.json()
    } catch (err) {
        console.error(`API Error (${endpoint}):`, err)
        return [] // Fallback for list views
    }
}

// ==================== DEPARTMENTS ====================
export async function getDepartments() {
    return await fetchAPI('/departments')
}

export async function createDepartment(data) {
    return await fetchAPI('/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
}

// ==================== EMPLOYEES ====================
export async function getEmployees() {
    return await fetchAPI('/employees')
}

export async function getEmployee(id) {
    return await fetchAPI(`/employees/${id}`)
}

export async function createEmployee(data) {
    return await fetchAPI('/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
}

export async function updateEmployee(id, data) {
    return await fetchAPI(`/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
}

export async function deleteEmployee(id) {
    // Note: Delete endpoint wasn't in list but usually needed
    // For now assuming we might not have implemented DELETE in routes yet
    // return await fetchAPI(`/employees/${id}`, { method: 'DELETE' })
    console.warn('Delete not implemented in API yet')
    return true
}

// ==================== ATTENDANCE ====================
export async function getAttendance(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    return await fetchAPI(`/attendance?${params}`)
}

export async function checkIn(employeeId) {
    return await fetchAPI('/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
    })
}

export async function checkOut(employeeId) {
    return await fetchAPI('/attendance/check-out', {
        method: 'POST', // or PUT depending on route def
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
    })
}

// ==================== LEAVES ====================
export async function getLeaves(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    return await fetchAPI(`/leaves?${params}`)
}

export async function applyLeave(data) {
    return await fetchAPI('/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
}

export async function updateLeaveStatus(id, status, approverId) {
    return await fetchAPI(`/leaves/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approvedBy: approverId })
    })
}

// ==================== PAYROLL ====================
export async function getPayroll(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    return await fetchAPI(`/payroll?${params}`)
}

export async function generatePayroll(employeeId, period) {
    return await fetchAPI('/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, period })
    })
}

// ==================== ANNOUNCEMENTS ====================
export async function getAnnouncements() {
    return await fetchAPI('/announcements')
}

export async function createAnnouncement(data) {
    return await fetchAPI('/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
}

// ==================== STUBS (Not fully implemented in backend yet) ====================
export async function getTrainings() { return [] }
export async function createTraining(data) { return data }
export async function enrollInTraining(trainingId, employeeId) { return { trainingId, employeeId } }
export async function getPerformanceReviews() { return [] }
export async function getExpenses() { return [] }
export async function submitExpense(data) { return data }
export async function approveExpense(id) { return { id, status: 'approved' } }
export async function getHRStats() { return {} }
