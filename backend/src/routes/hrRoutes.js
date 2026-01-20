const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { body, query, validationResult } = require('express-validator');

// ==================== DEPARTMENTS ====================

router.get('/departments', async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            include: { head: true, employees: true }
        });
        res.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

router.post('/departments', [
    body('departmentName').notEmpty().withMessage('Name is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const department = await prisma.department.create({ data: req.body });
        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== EMPLOYEES ====================

router.get('/employees', async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            include: { department: true, manager: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

router.post('/employees', [
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('email').isEmail(),
    body('salary').isNumeric()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const employee = await prisma.employee.create({
            data: {
                ...req.body,
                employeeId: `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` // Simple ID gen
            }
        });
        res.status(201).json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/employees/:id', async (req, res) => {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id: req.params.id },
            include: { department: true, manager: true, attendance: { take: 10, orderBy: { date: 'desc' } }, leaves: true, payrolls: true }
        });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

router.put('/employees/:id', async (req, res) => {
    try {
        const employee = await prisma.employee.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// ==================== ATTENDANCE ====================

router.get('/attendance', async (req, res) => {
    try {
        const { employeeId, date } = req.query;
        const where = {};
        if (employeeId) where.employeeId = employeeId;
        if (date) where.date = new Date(date);

        const attendance = await prisma.attendance.findMany({
            where,
            include: { employee: true },
            orderBy: { date: 'desc' }
        });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

router.post('/attendance/check-in', [
    body('employeeId').notEmpty()
], async (req, res) => {
    try {
        const { employeeId } = req.body;
        const now = new Date();
        const today = new Date(); // Normalized date for query
        today.setHours(0, 0, 0, 0);

        // Upsert to handle re-checks or simplified logic
        const record = await prisma.attendance.upsert({
            where: {
                employeeId_date: {
                    employeeId,
                    date: today
                }
            },
            update: { checkIn: now }, // Usually check-in only happens once, but for simplicity
            create: {
                employeeId,
                date: today,
                checkIn: now,
                status: 'present'
            }
        });
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/attendance/check-out', [
    body('employeeId').notEmpty()
], async (req, res) => {
    try {
        const { employeeId } = req.body;
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const record = await prisma.attendance.findUnique({
            where: {
                employeeId_date: { employeeId, date: today }
            }
        });

        if (!record) return res.status(404).json({ error: 'No check-in found for today' });

        // Calculate hours
        let workHours = 0;
        if (record.checkIn) {
            const diffMs = now - new Date(record.checkIn);
            workHours = diffMs / (1000 * 60 * 60);
        }

        const updated = await prisma.attendance.update({
            where: { id: record.id },
            data: {
                checkOut: now,
                workHours
            }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== LEAVES ====================

router.get('/leaves', async (req, res) => {
    try {
        const { employeeId, status } = req.query;
        const where = {};
        if (employeeId) where.employeeId = employeeId;
        if (status) where.status = status;

        const leaves = await prisma.leaveRequest.findMany({
            where,
            include: { employee: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaves' });
    }
});

router.post('/leaves', [
    body('employeeId').notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('leaveType').notEmpty()
], async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffIds = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const leave = await prisma.leaveRequest.create({
            data: { ...req.body, totalDays: diffIds }
        });
        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/leaves/:id/status', async (req, res) => {
    try {
        const { status, approvedBy } = req.body;
        const leave = await prisma.leaveRequest.update({
            where: { id: req.params.id },
            data: { status, approvedBy }
        });
        res.json(leave);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== PAYROLL ====================

router.get('/payroll', async (req, res) => {
    try {
        const { period, employeeId } = req.query;
        const where = {};
        if (period) where.period = period;
        if (employeeId) where.employeeId = employeeId;

        const payroll = await prisma.payroll.findMany({
            where,
            include: { employee: true }
        });
        res.json(payroll);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payroll' });
    }
});

router.post('/payroll/generate', [
    body('period').notEmpty() // "2024-01"
], async (req, res) => {
    try {
        const { period } = req.body;
        const employees = await prisma.employee.findMany({ where: { status: 'active' } });

        const generated = [];

        // Simple auto-generation
        for (const emp of employees) {
            const basic = emp.salary / 12;
            const tax = basic * 0.2; // Simplified tax
            const net = basic - tax;

            // Check if exists
            const existing = await prisma.payroll.findUnique({
                where: { employeeId_period: { employeeId: emp.id, period } }
            });

            if (!existing) {
                const p = await prisma.payroll.create({
                    data: {
                        employeeId: emp.id,
                        period,
                        startPeriod: new Date(`${period}-01`),
                        endPeriod: new Date(`${period}-28`), // Simplified
                        basicSalary: basic,
                        grossSalary: basic,
                        totalDeductions: tax,
                        tax,
                        netSalary: net,
                        status: 'generated'
                    }
                });
                generated.push(p);
            }
        }

        res.json({ message: `Generated payroll for ${generated.length} employees`, count: generated.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== ANNOUNCEMENTS ====================

router.get('/announcements', async (req, res) => {
    try {
        const announcements = await prisma.announcement.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/announcements', async (req, res) => {
    try {
        const ann = await prisma.announcement.create({ data: req.body });
        res.status(201).json(ann);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ==================== TIME TRACKING ====================

router.get('/time-entries', async (req, res) => {
    try {
        const { employeeId, startDate, endDate } = req.query
        const where = {}
        if (employeeId) where.employeeId = employeeId
        if (startDate && endDate) {
            where.startTime = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        }

        const entries = await prisma.timeEntry.findMany({
            where,
            include: { employee: true },
            orderBy: { startTime: 'desc' }
        })
        res.json(entries)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post('/time-entries/start', async (req, res) => {
    try {
        const { employeeId, description, projectId } = req.body
        const entry = await prisma.timeEntry.create({
            data: {
                employeeId,
                description,
                projectId,
                startTime: new Date()
            }
        })
        res.json(entry)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post('/time-entries/stop', async (req, res) => {
    try {
        const { id } = req.body
        const entry = await prisma.timeEntry.findUnique({ where: { id } })
        if (!entry) return res.status(404).json({ error: 'Entry not found' })

        const endTime = new Date()
        const duration = Math.round((endTime - new Date(entry.startTime)) / 1000 / 60) // minutes

        const updated = await prisma.timeEntry.update({
            where: { id },
            data: { endTime, duration }
        })
        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// ==================== RECRUITMENT ====================

router.get('/job-postings', async (req, res) => {
    try {
        const jobs = await prisma.jobPosting.findMany({
            include: { candidates: true }
        })
        res.json(jobs)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post('/job-postings', async (req, res) => {
    try {
        const job = await prisma.jobPosting.create({ data: req.body })
        res.json(job)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/candidates', async (req, res) => {
    try {
        const candidates = await prisma.candidate.findMany({
            include: { jobPosting: true }
        })
        res.json(candidates)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post('/candidates', async (req, res) => {
    try {
        const candidate = await prisma.candidate.create({ data: req.body })
        res.json(candidate)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.patch('/candidates/:id/status', async (req, res) => {
    try {
        const { status } = req.body
        const candidate = await prisma.candidate.update({
            where: { id: req.params.id },
            data: { status }
        })
        res.json(candidate)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// ==================== ASSETS ====================

router.get('/assets', async (req, res) => {
    try {
        const assets = await prisma.asset.findMany({
            include: { employee: true }
        })
        res.json(assets)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post('/assets', async (req, res) => {
    try {
        const asset = await prisma.asset.create({ data: req.body })
        res.json(asset)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.patch('/assets/:id/assign', async (req, res) => {
    try {
        const { employeeId } = req.body
        const asset = await prisma.asset.update({
            where: { id: req.params.id },
            data: {
                assignedTo: employeeId,
                status: employeeId ? 'assigned' : 'in-stock'
            }
        })
        res.json(asset)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router;
