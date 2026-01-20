const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Global Search
router.get('/', async (req, res) => {
    try {
        const { q } = req.query
        if (!q || q.length < 2) return res.json([])

        const query = q.toLowerCase()

        // Parallel search across models
        const [employees, assets, candidates, announcements] = await Promise.all([
            prisma.employee.findMany({
                where: {
                    OR: [
                        { firstName: { contains: query, mode: 'insensitive' } },
                        { lastName: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: 5,
                select: { id: true, firstName: true, lastName: true, department: { select: { departmentName: true } } }
            }),
            prisma.asset.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { assetNumber: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: 5
            }),
            prisma.candidate.findMany({
                where: { name: { contains: query, mode: 'insensitive' } },
                take: 5
            }),
            prisma.announcement.findMany({
                where: { title: { contains: query, mode: 'insensitive' } },
                take: 3
            })
        ])

        const results = [
            ...employees.map(e => ({ type: 'Employee', title: `${e.firstName} ${e.lastName}`, subtitle: e.department?.departmentName, link: `/hr/employees` })), // deep linking todo
            ...assets.map(a => ({ type: 'Asset', title: a.name, subtitle: a.assetNumber, link: `/hr/assets` })),
            ...candidates.map(c => ({ type: 'Candidate', title: c.name, subtitle: c.status, link: `/hr/recruitment` })),
            ...announcements.map(a => ({ type: 'Announcement', title: a.title, subtitle: 'Announcement', link: `/hr/announcements` }))
        ]

        res.json(results)
    } catch (error) {
        console.error('Search error:', error)
        res.status(500).json({ error: 'Search failed' })
    }
})

module.exports = router
