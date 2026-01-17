const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // 1. Create Vendors
    const vendor1 = await prisma.vendor.upsert({
        where: { vendorCode: 'VEN-001' },
        update: {},
        create: {
            vendorCode: 'VEN-001',
            name: 'Acme Hardware Supplies',
            email: 'sales@acmehardware.com',
            status: 'active',
            type: 'product',
            rating: 4.5,
            creditLimit: 50000
        }
    });

    const vendor2 = await prisma.vendor.upsert({
        where: { vendorCode: 'VEN-002' },
        update: {},
        create: {
            vendorCode: 'VEN-002',
            name: 'Global IT Solutions',
            email: 'contact@globalit.com',
            status: 'active',
            type: 'service',
            rating: 4.8,
            creditLimit: 100000
        }
    });

    const vendor3 = await prisma.vendor.upsert({
        where: { vendorCode: 'VEN-003' },
        update: {},
        create: {
            vendorCode: 'VEN-003',
            name: 'Office Depot',
            email: 'business@officedepot.com',
            status: 'active',
            type: 'consumable',
            rating: 4.2
        }
    });

    const vendor4 = await prisma.vendor.upsert({
        where: { vendorCode: 'VEN-004' },
        update: {},
        create: {
            vendorCode: 'VEN-004',
            name: 'Amazon Web Services',
            email: 'billing@aws.amazon.com',
            status: 'active',
            type: 'service', // SaaS
            rating: 5.0
        }
    });

    console.log('Created Vendors:', vendor1.name, vendor2.name, vendor3.name, vendor4.name);

    // 2. Create Products (Mocking as simple items since Product model might be complex/separate)
    // We'll trust the strings in PO items for now or create if Product model exists and is simple.
    // Checking schema: Product model is NOT in the provided view of schema.prisma (it ends at Purchase Module).
    // But wait, there was `productsRoutes` in server.js. 
    // Let's create purely text-based items for now to be safe, as PO items support `name` string.

    // 3. Create RFQs
    const rfq = await prisma.rFQ.create({
        data: {
            rfqNumber: 'RFQ-2025-001',
            title: 'Laptops for New Hires',
            issueDate: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            status: 'sent',
            items: {
                create: [
                    { name: 'MacBook Pro 16"', quantity: 5, specifications: 'M3 Max, 32GB RAM' },
                    { name: 'Dell XPS 15', quantity: 3, specifications: 'i9, 32GB RAM' }
                ]
            }
        }
    });
    console.log('Created RFQ:', rfq.rfqNumber);

    // 4. Create Purchase Orders
    const po1 = await prisma.purchaseOrder.create({
        data: {
            orderNumber: 'PO-2025-001',
            vendorId: vendor1.id,
            orderDate: new Date(),
            expectedDelivery: new Date(new Date().setDate(new Date().getDate() + 14)),
            subtotal: 5000,
            totalAmount: 5250, // +5% tax
            taxAmount: 250,
            status: 'issued',
            items: {
                create: [
                    { name: 'Industrial Drill', quantity: 10, unitPrice: 200, total: 2000 },
                    { name: 'Safety Helmets', quantity: 50, unitPrice: 60, total: 3000 }
                ]
            }
        }
    });

    const po2 = await prisma.purchaseOrder.create({
        data: {
            orderNumber: 'PO-2025-002',
            vendorId: vendor2.id,
            orderDate: new Date(),
            status: 'draft',
            subtotal: 15000,
            totalAmount: 15000,
            items: {
                create: [
                    {
                        name: 'Cloud Migration Consultancy',
                        quantity: 100,
                        unitPrice: 150,
                        total: 15000,
                        serviceType: 'consulting',
                        startDate: new Date(),
                        endDate: new Date(new Date().setDate(new Date().getDate() + 30))
                    }
                ]
            }
        }
    });

    // 5. Create SaaS Subscriptions (PO-2025-003)
    const po3 = await prisma.purchaseOrder.create({
        data: {
            orderNumber: 'PO-2025-003',
            vendorId: vendor4.id,
            orderDate: new Date('2024-01-01'),
            status: 'issued',
            subtotal: 1200,
            totalAmount: 1200,
            // Represents a yearly contract or monthly recurring
            items: {
                create: [
                    {
                        name: 'AWS EC2 Instances',
                        quantity: 1,
                        unitPrice: 1200,
                        total: 1200,
                        serviceType: 'subscription',
                        period: 'monthly',
                        startDate: new Date(),
                        endDate: new Date(new Date().setDate(new Date().getDate() + 30))
                    }
                ]
            }
        }
    });

    console.log('Created POs:', po1.orderNumber, po2.orderNumber, po3.orderNumber);

    // 6. Create GRN
    const grn = await prisma.gRN.create({
        data: {
            grnNumber: 'GRN-2025-001',
            purchaseOrderId: po1.id,
            vendorId: vendor1.id,
            receiptDate: new Date(),
            status: 'completed',
            items: {
                create: [
                    { name: 'Industrial Drill', orderedQty: 10, receivedQty: 10, acceptedQty: 10 },
                    { name: 'Safety Helmets', orderedQty: 50, receivedQty: 50, acceptedQty: 50 }
                ]
            }
        }
    });
    console.log('Created GRN:', grn.grnNumber);

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
