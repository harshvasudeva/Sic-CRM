const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ==================== SALES SCRIPTS ====================
router.get('/scripts', async (req, res) => {
    try {
        const scripts = await prisma.salesScript.findMany({
            where: { isActive: true },
            orderBy: { title: 'asc' }
        })
        res.json(scripts)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post('/scripts', async (req, res) => {
    try {
        const script = await prisma.salesScript.create({ data: req.body })
        res.json(script)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router
