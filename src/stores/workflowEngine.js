// Workflow Engine - Cross-Module Automation
// Implements event-driven workflows connecting all ERP modules
// Section B: Seamless App Interconnections & Workflows (B1-B25)

const STORAGE_KEYS = {
  workflowDefinitions: 'sic-crm-workflow-defs',
  workflowExecutions: 'sic-crm-workflow-execs',
  workflowQueue: 'sic-crm-workflow-queue',
  moduleEvents: 'sic-crm-module-events',
  dashboardLayouts: 'sic-crm-dashboard-layouts',
  omniSearchIndex: 'sic-crm-omni-search-idx'
}

// ============================================================
//  EVENT TYPES - All cross-module triggers
// ============================================================

export const EVENT_TYPES = {
  // CRM Events
  CRM_LEAD_CREATED: 'crm.lead.created',
  CRM_LEAD_CONVERTED: 'crm.lead.converted',
  CRM_DEAL_WON: 'crm.deal.won',
  CRM_DEAL_LOST: 'crm.deal.lost',
  CRM_QUOTE_ACCEPTED: 'crm.quote.accepted',
  CRM_QUOTE_REJECTED: 'crm.quote.rejected',
  CRM_CONTACT_UPDATED: 'crm.contact.updated',

  // Sales Events
  SALES_ORDER_CREATED: 'sales.order.created',
  SALES_ORDER_CONFIRMED: 'sales.order.confirmed',
  SALES_ORDER_SHIPPED: 'sales.order.shipped',
  SALES_ORDER_DELIVERED: 'sales.order.delivered',
  SALES_INVOICE_CREATED: 'sales.invoice.created',
  SALES_RETURN_PROCESSED: 'sales.return.processed',
  SALES_CREDIT_NOTE_ISSUED: 'sales.creditnote.issued',

  // Purchase Events
  PURCHASE_ORDER_CREATED: 'purchase.order.created',
  PURCHASE_ORDER_APPROVED: 'purchase.order.approved',
  PURCHASE_GRN_RECEIVED: 'purchase.grn.received',
  PURCHASE_BILL_RECEIVED: 'purchase.bill.received',
  PURCHASE_RFQ_CREATED: 'purchase.rfq.created',
  PURCHASE_VENDOR_INVOICE: 'purchase.vendor.invoice',

  // Inventory Events
  INVENTORY_STOCK_LOW: 'inventory.stock.low',
  INVENTORY_STOCK_UPDATED: 'inventory.stock.updated',
  INVENTORY_STOCK_HOLD: 'inventory.stock.hold',
  INVENTORY_STOCK_RELEASED: 'inventory.stock.released',
  INVENTORY_TRANSFER_COMPLETE: 'inventory.transfer.complete',
  INVENTORY_ITEM_OUT_OF_STOCK: 'inventory.item.outofstock',

  // Manufacturing Events
  MANUFACTURING_ORDER_CREATED: 'manufacturing.order.created',
  MANUFACTURING_ORDER_STARTED: 'manufacturing.order.started',
  MANUFACTURING_ORDER_COMPLETED: 'manufacturing.order.completed',
  MANUFACTURING_MATERIAL_SHORT: 'manufacturing.material.short',
  MANUFACTURING_SCHEDULED: 'manufacturing.scheduled',

  // Accounting Events
  ACCOUNTING_JOURNAL_CREATED: 'accounting.journal.created',
  ACCOUNTING_PAYMENT_RECEIVED: 'accounting.payment.received',
  ACCOUNTING_PAYMENT_OVERDUE: 'accounting.payment.overdue',
  ACCOUNTING_RECEIVABLE_ADDED: 'accounting.receivable.added',
  ACCOUNTING_PAYABLE_ADDED: 'accounting.payable.added',

  // HR Events
  HR_PAYROLL_EXECUTED: 'hr.payroll.executed',
  HR_EMPLOYEE_CHECKED_IN: 'hr.employee.checkedin',
  HR_EMPLOYEE_CHECKED_OUT: 'hr.employee.checkedout',
  HR_LEAVE_APPROVED: 'hr.leave.approved',
  HR_LEAVE_STARTED: 'hr.leave.started',
  HR_LEAVE_ENDED: 'hr.leave.ended',
  HR_CANDIDATE_APPLIED: 'hr.candidate.applied',
  HR_CANDIDATE_STAGE_CHANGED: 'hr.candidate.stagechanged',

  // Influencer Events
  INFLUENCER_CODE_USED: 'influencer.code.used',
  INFLUENCER_PACKAGE_SENT: 'influencer.package.sent',
  INFLUENCER_PAYOUT_DUE: 'influencer.payout.due',

  // POS Events
  POS_BARCODE_SCANNED: 'pos.barcode.scanned',
  POS_DRAWER_OPEN_REQUEST: 'pos.drawer.openrequest',
  POS_SALE_COMPLETED: 'pos.sale.completed',

  // Settings Events
  SETTINGS_TAX_CHANGED: 'settings.tax.changed',
  SETTINGS_CURRENCY_CHANGED: 'settings.currency.changed',

  // Vendor Portal Events
  VENDOR_LOGIN: 'vendor.login',
  VENDOR_INVOICE_SUBMITTED: 'vendor.invoice.submitted',
  VENDOR_RFQ_RESPONDED: 'vendor.rfq.responded'
}

// ============================================================
//  IN-MEMORY EVENT BUS
// ============================================================

const _listeners = {}

/**
 * Emit a module event. Persists to event log and fires all handlers.
 */
export function emitEvent(eventName, payload = {}) {
  const event = {
    id: _uid(),
    eventName,
    payload,
    timestamp: new Date().toISOString(),
    source: payload._source || 'system'
  }

  // Persist event
  _appendEvent(event)

  // Fire handlers
  const handlers = _listeners[eventName] || []
  handlers.forEach(handler => {
    try {
      handler(event)
    } catch (err) {
      console.error(`[WorkflowEngine] Handler error for ${eventName}:`, err)
    }
  })

  // Fire wildcard handlers
  const wildcardHandlers = _listeners['*'] || []
  wildcardHandlers.forEach(handler => {
    try {
      handler(event)
    } catch (err) {
      console.error(`[WorkflowEngine] Wildcard handler error:`, err)
    }
  })

  // Evaluate workflow triggers
  _evaluateWorkflowTriggers(event)

  return event
}

/**
 * Register an event handler.
 */
export function onEvent(eventName, handler) {
  if (!_listeners[eventName]) _listeners[eventName] = []
  _listeners[eventName].push(handler)
  return () => offEvent(eventName, handler)
}

/**
 * Unregister an event handler.
 */
export function offEvent(eventName, handler) {
  if (!_listeners[eventName]) return
  _listeners[eventName] = _listeners[eventName].filter(h => h !== handler)
}

/**
 * Get recent module events from persistent log.
 */
export function getModuleEvents(limit = 100) {
  const events = _getStore(STORAGE_KEYS.moduleEvents, [])
  return events.slice(-limit)
}

/**
 * Clear old module events beyond retention window.
 */
export function pruneModuleEvents(maxAge = 30 * 24 * 60 * 60 * 1000) {
  const events = _getStore(STORAGE_KEYS.moduleEvents, [])
  const cutoff = new Date(Date.now() - maxAge).toISOString()
  const pruned = events.filter(e => e.timestamp > cutoff)
  _saveStore(STORAGE_KEYS.moduleEvents, pruned)
  return pruned.length
}

// ============================================================
//  WORKFLOW DEFINITIONS (B1-B25)
// ============================================================

const BUILT_IN_WORKFLOWS = [
  // B1: CRM_TO_SALES - Quote accepted -> auto-create Sales Order
  {
    id: 'wf-b1-crm-to-sales',
    code: 'CRM_TO_SALES',
    name: 'Quote to Sales Order',
    description: 'When a CRM quote is accepted, automatically create a Sales Order with all line items, attachments, and discounts carried forward.',
    category: 'crm-sales',
    triggerEvent: EVENT_TYPES.CRM_QUOTE_ACCEPTED,
    enabled: true,
    conditions: [
      { field: 'payload.quote.status', operator: 'eq', value: 'accepted' }
    ],
    steps: [
      {
        id: 'step-1',
        action: 'CREATE_SALES_ORDER',
        module: 'sales',
        mapping: {
          customerId: 'payload.quote.customerId',
          customerName: 'payload.quote.customerName',
          items: 'payload.quote.items',
          discount: 'payload.quote.discount',
          attachments: 'payload.quote.attachments',
          currency: 'payload.quote.currency',
          notes: 'payload.quote.notes',
          sourceQuoteId: 'payload.quote.id'
        }
      },
      {
        id: 'step-2',
        action: 'NOTIFY',
        module: 'notifications',
        mapping: {
          title: '"Sales Order Created from Quote"',
          message: '"A new Sales Order was auto-created from accepted quote {payload.quote.id}"',
          type: 'info',
          target: 'payload.quote.assignedTo'
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B2: SALES_TO_MANUFACTURING - Sales Order + out of stock -> Manufacturing Order
  {
    id: 'wf-b2-sales-to-manufacturing',
    code: 'SALES_TO_MANUFACTURING',
    name: 'Sales Order to Manufacturing',
    description: 'When a Sales Order is confirmed and one or more items are out of stock, automatically spawn a Manufacturing Order for the deficit quantities.',
    category: 'sales-manufacturing',
    triggerEvent: EVENT_TYPES.SALES_ORDER_CONFIRMED,
    enabled: true,
    conditions: [
      { field: 'payload.hasOutOfStockItems', operator: 'eq', value: true }
    ],
    steps: [
      {
        id: 'step-1',
        action: 'CHECK_STOCK_LEVELS',
        module: 'inventory',
        mapping: {
          items: 'payload.order.items'
        }
      },
      {
        id: 'step-2',
        action: 'CREATE_MANUFACTURING_ORDER',
        module: 'manufacturing',
        mapping: {
          items: 'payload.outOfStockItems',
          priority: '"high"',
          sourceSalesOrderId: 'payload.order.id',
          requiredDate: 'payload.order.deliveryDate'
        },
        condition: { field: 'stepResults.step-1.deficitItems.length', operator: 'gt', value: 0 }
      },
      {
        id: 'step-3',
        action: 'NOTIFY',
        module: 'notifications',
        mapping: {
          title: '"Manufacturing Order Spawned"',
          message: '"Out-of-stock items from SO {payload.order.id} sent to manufacturing"',
          type: 'warning',
          target: 'manufacturing-manager'
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B3: MANUFACTURING_TO_INVENTORY - MO completed -> BOM material deductions + finished goods
  {
    id: 'wf-b3-manufacturing-to-inventory',
    code: 'MANUFACTURING_TO_INVENTORY',
    name: 'Manufacturing Completion to Inventory',
    description: 'When a Manufacturing Order completes, deduct raw materials per the BOM and add finished goods to inventory.',
    category: 'manufacturing-inventory',
    triggerEvent: EVENT_TYPES.MANUFACTURING_ORDER_COMPLETED,
    enabled: true,
    conditions: [],
    steps: [
      {
        id: 'step-1',
        action: 'DEDUCT_RAW_MATERIALS',
        module: 'inventory',
        mapping: {
          bomId: 'payload.manufacturingOrder.bomId',
          quantity: 'payload.manufacturingOrder.quantityProduced',
          warehouseId: 'payload.manufacturingOrder.warehouseId'
        }
      },
      {
        id: 'step-2',
        action: 'ADD_FINISHED_GOODS',
        module: 'inventory',
        mapping: {
          productId: 'payload.manufacturingOrder.productId',
          quantity: 'payload.manufacturingOrder.quantityProduced',
          warehouseId: 'payload.manufacturingOrder.destinationWarehouse',
          batchId: 'payload.manufacturingOrder.batchId',
          cost: 'payload.manufacturingOrder.unitCost'
        }
      },
      {
        id: 'step-3',
        action: 'NOTIFY',
        module: 'notifications',
        mapping: {
          title: '"Manufacturing Complete"',
          message: '"MO {payload.manufacturingOrder.id} finished. Inventory updated via BOM."',
          type: 'success'
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B4: THREE_WAY_MATCH - Lock vendor payments until PO + GRN + Bill match
  {
    id: 'wf-b4-three-way-match',
    code: 'THREE_WAY_MATCH',
    name: 'Three-Way Match for Vendor Payments',
    description: 'Lock vendor payments until the Purchase Order, Goods Received Note, and Vendor Bill all match on quantities and prices.',
    category: 'purchase-accounting',
    triggerEvent: EVENT_TYPES.PURCHASE_BILL_RECEIVED,
    enabled: true,
    conditions: [],
    steps: [
      {
        id: 'step-1',
        action: 'FETCH_PO',
        module: 'purchase',
        mapping: {
          poId: 'payload.bill.purchaseOrderId'
        }
      },
      {
        id: 'step-2',
        action: 'FETCH_GRN',
        module: 'purchase',
        mapping: {
          poId: 'payload.bill.purchaseOrderId'
        }
      },
      {
        id: 'step-3',
        action: 'VALIDATE_THREE_WAY_MATCH',
        module: 'purchase',
        mapping: {
          po: 'stepResults.step-1',
          grn: 'stepResults.step-2',
          bill: 'payload.bill',
          tolerancePercent: 2
        }
      },
      {
        id: 'step-4',
        action: 'LOCK_OR_RELEASE_PAYMENT',
        module: 'accounting',
        mapping: {
          vendorId: 'payload.bill.vendorId',
          billId: 'payload.bill.id',
          matchResult: 'stepResults.step-3.matched',
          discrepancies: 'stepResults.step-3.discrepancies'
        }
      },
      {
        id: 'step-5',
        action: 'NOTIFY',
        module: 'notifications',
        mapping: {
          title: '"Three-Way Match Result"',
          message: '"Bill {payload.bill.id}: {stepResults.step-3.matched ? \'Matched - Payment Released\' : \'Mismatch - Payment Locked\'}"',
          type: 'stepResults.step-3.matched ? "success" : "error"'
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B5: HR_TO_ACCOUNTING - Payroll -> Journal Entries
  {
    id: 'wf-b5-hr-to-accounting',
    code: 'HR_TO_ACCOUNTING',
    name: 'Payroll to Journal Entries',
    description: 'When payroll is executed, automatically generate Journal Entries for salaries, taxes, and deductions.',
    category: 'hr-accounting',
    triggerEvent: EVENT_TYPES.HR_PAYROLL_EXECUTED,
    enabled: true,
    conditions: [],
    steps: [
      {
        id: 'step-1',
        action: 'CREATE_JOURNAL_ENTRIES',
        module: 'accounting',
        mapping: {
          entries: 'payload.payroll.entries',
          period: 'payload.payroll.period',
          totalGross: 'payload.payroll.totalGross',
          totalDeductions: 'payload.payroll.totalDeductions',
          totalNet: 'payload.payroll.totalNet',
          taxBreakdown: 'payload.payroll.taxBreakdown'
        }
      },
      {
        id: 'step-2',
        action: 'UPDATE_PAYABLE',
        module: 'accounting',
        mapping: {
          type: '"salary_payable"',
          amount: 'payload.payroll.totalNet',
          dueDate: 'payload.payroll.payDate',
          reference: '"Payroll - {payload.payroll.period}"'
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B6: SALES_TO_ACCOUNTING - Goods shipped -> Accounts Receivable
  {
    id: 'wf-b6-sales-to-accounting',
    code: 'SALES_TO_ACCOUNTING',
    name: 'Shipment to Accounts Receivable',
    description: 'When goods are shipped against a Sales Order, automatically add the invoice amount to Accounts Receivable.',
    category: 'sales-accounting',
    triggerEvent: EVENT_TYPES.SALES_ORDER_SHIPPED,
    enabled: true,
    conditions: [],
    steps: [
      {
        id: 'step-1',
        action: 'CREATE_RECEIVABLE',
        module: 'accounting',
        mapping: {
          customerId: 'payload.order.customerId',
          customerName: 'payload.order.customerName',
          invoiceId: 'payload.order.invoiceId',
          amount: 'payload.order.totalAmount',
          currency: 'payload.order.currency',
          dueDate: 'payload.order.paymentDueDate',
          salesOrderId: 'payload.order.id'
        }
      },
      {
        id: 'step-2',
        action: 'NOTIFY',
        module: 'notifications',
        mapping: {
          title: '"Receivable Created"',
          message: '"AR entry added for SO {payload.order.id} - {payload.order.totalAmount}"',
          type: 'info',
          target: 'accounts-team'
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B7: INFLUENCER_COMMISSION - Influencer code used -> calculate commission -> payout queue
  {
    id: 'wf-b7-influencer-commission',
    code: 'INFLUENCER_COMMISSION',
    name: 'Influencer Commission Calculator',
    description: 'When an influencer discount code is used at checkout, calculate the commission and append it to the payout queue.',
    category: 'influencer-accounting',
    triggerEvent: EVENT_TYPES.INFLUENCER_CODE_USED,
    enabled: true,
    conditions: [
      { field: 'payload.code', operator: 'exists', value: true }
    ],
    steps: [
      {
        id: 'step-1',
        action: 'LOOKUP_INFLUENCER',
        module: 'influencer',
        mapping: {
          code: 'payload.code'
        }
      },
      {
        id: 'step-2',
        action: 'CALCULATE_COMMISSION',
        module: 'influencer',
        mapping: {
          influencerId: 'stepResults.step-1.influencerId',
          orderAmount: 'payload.orderAmount',
          commissionRate: 'stepResults.step-1.commissionRate',
          tierBonus: 'stepResults.step-1.tierBonus'
        }
      },
      {
        id: 'step-3',
        action: 'ADD_TO_PAYOUT_QUEUE',
        module: 'influencer',
        mapping: {
          influencerId: 'stepResults.step-1.influencerId',
          amount: 'stepResults.step-2.commissionAmount',
          orderId: 'payload.orderId',
          code: 'payload.code'
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B8: HR_LEAVE_REROUTE - Sales rep on leave -> reroute CRM leads
  {
    id: 'wf-b8-hr-leave-reroute',
    code: 'HR_LEAVE_REROUTE',
    name: 'Leave-Based Lead Rerouting',
    description: 'When a sales rep starts approved leave, unroute their new CRM leads to the next available agent based on load balancing.',
    category: 'hr-crm',
    triggerEvent: EVENT_TYPES.HR_LEAVE_STARTED,
    enabled: true,
    conditions: [
      { field: 'payload.employee.department', operator: 'eq', value: 'Sales' }
    ],
    steps: [
      {
        id: 'step-1',
        action: 'GET_AVAILABLE_AGENTS',
        module: 'crm',
        mapping: {
          excludeEmployeeId: 'payload.employee.id',
          department: '"Sales"'
        }
      },
      {
        id: 'step-2',
        action: 'REROUTE_LEADS',
        module: 'crm',
        mapping: {
          fromAgentId: 'payload.employee.id',
          toAgentId: 'stepResults.step-1.nextAvailableAgent',
          leaveStartDate: 'payload.leave.startDate',
          leaveEndDate: 'payload.leave.endDate',
          mode: '"round-robin"'
        }
      },
      {
        id: 'step-3',
        action: 'NOTIFY',
        module: 'notifications',
        mapping: {
          title: '"Leads Rerouted"',
          message: '"Leads from {payload.employee.name} rerouted during leave ({payload.leave.startDate} - {payload.leave.endDate})"',
          type: 'info',
          target: 'sales-manager'
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B9: VENDOR_PORTAL - Vendor login -> view RFQs, submit invoices
  {
    id: 'wf-b9-vendor-portal',
    code: 'VENDOR_PORTAL',
    name: 'Vendor Portal Integration',
    description: 'When a vendor logs in, surface their open RFQs and allow invoice submission directly into the Purchase module.',
    category: 'vendor-purchase',
    triggerEvent: EVENT_TYPES.VENDOR_LOGIN,
    enabled: true,
    conditions: [],
    steps: [
      {
        id: 'step-1',
        action: 'FETCH_VENDOR_RFQS',
        module: 'purchase',
        mapping: {
          vendorId: 'payload.vendor.id'
        }
      },
      {
        id: 'step-2',
        action: 'FETCH_VENDOR_POS',
        module: 'purchase',
        mapping: {
          vendorId: 'payload.vendor.id',
          status: '"active"'
        }
      },
      {
        id: 'step-3',
        action: 'BUILD_VENDOR_DASHBOARD',
        module: 'vendor-portal',
        mapping: {
          rfqs: 'stepResults.step-1',
          purchaseOrders: 'stepResults.step-2',
          vendorId: 'payload.vendor.id'
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B10: POS_STOCK_LOCK - Barcode scan -> 5 min global stock hold
  {
    id: 'wf-b10-pos-stock-lock',
    code: 'POS_STOCK_LOCK',
    name: 'POS Barcode Stock Hold',
    description: 'When a barcode is scanned at POS, place a 5-minute global stock hold to prevent overselling across all channels.',
    category: 'pos-inventory',
    triggerEvent: EVENT_TYPES.POS_BARCODE_SCANNED,
    enabled: true,
    conditions: [],
    steps: [
      {
        id: 'step-1',
        action: 'HOLD_STOCK',
        module: 'inventory',
        mapping: {
          productId: 'payload.productId',
          quantity: 'payload.quantity',
          holdDurationMs: 300000,
          holdType: '"pos-scan"',
          posTerminalId: 'payload.terminalId'
        }
      },
      {
        id: 'step-2',
        action: 'SCHEDULE_RELEASE',
        module: 'inventory',
        mapping: {
          holdId: 'stepResults.step-1.holdId',
          releaseAfterMs: 300000
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B11: SALES_RETURN_QUARANTINE - Return -> defective warehouse + Credit Note
  {
    id: 'wf-b11-sales-return-quarantine',
    code: 'SALES_RETURN_QUARANTINE',
    name: 'Sales Return Quarantine',
    description: 'When a return is processed, move the items to the defective warehouse for inspection and auto-generate a Credit Note.',
    category: 'sales-inventory',
    triggerEvent: EVENT_TYPES.SALES_RETURN_PROCESSED,
    enabled: true,
    conditions: [],
    steps: [
      {
        id: 'step-1',
        action: 'TRANSFER_TO_DEFECTIVE',
        module: 'inventory',
        mapping: {
          items: 'payload.return.items',
          fromWarehouse: 'payload.return.warehouseId',
          toWarehouse: '"defective-warehouse"',
          reason: 'payload.return.reason',
          returnId: 'payload.return.id'
        }
      },
      {
        id: 'step-2',
        action: 'CREATE_CREDIT_NOTE',
        module: 'sales',
        mapping: {
          customerId: 'payload.return.customerId',
          originalInvoiceId: 'payload.return.invoiceId',
          items: 'payload.return.items',
          amount: 'payload.return.refundAmount',
          reason: 'payload.return.reason'
        }
      },
      {
        id: 'step-3',
        action: 'NOTIFY',
        module: 'notifications',
        mapping: {
          title: '"Return Quarantined"',
          message: '"Return {payload.return.id} moved to defective warehouse. Credit Note issued."',
          type: 'warning'
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B12: CRM_HR_MIRROR - Reuse CRM Kanban for recruitment
  {
    id: 'wf-b12-crm-hr-mirror',
    code: 'CRM_HR_MIRROR',
    name: 'Recruitment via CRM Kanban',
    description: 'Mirror the CRM Kanban board for HR recruitment. Candidates flow through stages like leads: Applied -> Screening -> Interview -> Offer -> Hired.',
    category: 'hr-crm',
    triggerEvent: EVENT_TYPES.HR_CANDIDATE_APPLIED,
    enabled: true,
    conditions: [],
    steps: [
      {
        id: 'step-1',
        action: 'CREATE_CRM_LEAD_FROM_CANDIDATE',
        module: 'crm',
        mapping: {
          name: 'payload.candidate.name',
          email: 'payload.candidate.email',
          phone: 'payload.candidate.phone',
          source: '"Recruitment"',
          pipeline: '"recruitment"',
          stage: '"Applied"',
          customFields: {
            position: 'payload.candidate.position',
            resume: 'payload.candidate.resumeUrl',
            experience: 'payload.candidate.yearsExperience'
          }
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B13: MANUFACTURING_PROCUREMENT_WARN - Manufacturing scheduled + low materials -> alert Purchasing
  {
    id: 'wf-b13-manufacturing-procurement-warn',
    code: 'MANUFACTURING_PROCUREMENT_WARN',
    name: 'Manufacturing Material Shortage Alert',
    description: 'When manufacturing is scheduled and raw materials are low, alert the Purchasing team with a pre-filled PO draft.',
    category: 'manufacturing-purchase',
    triggerEvent: EVENT_TYPES.MANUFACTURING_SCHEDULED,
    enabled: true,
    conditions: [
      { field: 'payload.materialShortage', operator: 'eq', value: true }
    ],
    steps: [
      {
        id: 'step-1',
        action: 'CALCULATE_MATERIAL_DEFICIT',
        module: 'inventory',
        mapping: {
          bomId: 'payload.manufacturingOrder.bomId',
          requiredQuantity: 'payload.manufacturingOrder.quantity'
        }
      },
      {
        id: 'step-2',
        action: 'CREATE_DRAFT_PO',
        module: 'purchase',
        mapping: {
          items: 'stepResults.step-1.deficitItems',
          vendorSuggestions: 'stepResults.step-1.preferredVendors',
          urgency: '"high"',
          sourceManufacturingOrderId: 'payload.manufacturingOrder.id',
          status: '"draft"'
        }
      },
      {
        id: 'step-3',
        action: 'NOTIFY',
        module: 'notifications',
        mapping: {
          title: '"Material Shortage for Manufacturing"',
          message: '"MO {payload.manufacturingOrder.id} needs materials. Draft PO created for review."',
          type: 'error',
          target: 'purchasing-team'
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B14: INVENTORY_ATP - Available-to-Promise dates on Sales screen
  {
    id: 'wf-b14-inventory-atp',
    code: 'INVENTORY_ATP',
    name: 'Available-to-Promise Calculator',
    description: 'Show Available-to-Promise (ATP) delivery dates on the Sales Order screen by factoring in current stock, pending POs, and manufacturing schedules.',
    category: 'inventory-sales',
    triggerEvent: EVENT_TYPES.SALES_ORDER_CREATED,
    enabled: true,
    conditions: [],
    steps: [
      {
        id: 'step-1',
        action: 'GET_CURRENT_STOCK',
        module: 'inventory',
        mapping: {
          items: 'payload.order.items'
        }
      },
      {
        id: 'step-2',
        action: 'GET_PENDING_POS',
        module: 'purchase',
        mapping: {
          items: 'payload.order.items'
        }
      },
      {
        id: 'step-3',
        action: 'GET_MANUFACTURING_SCHEDULE',
        module: 'manufacturing',
        mapping: {
          items: 'payload.order.items'
        }
      },
      {
        id: 'step-4',
        action: 'CALCULATE_ATP',
        module: 'inventory',
        mapping: {
          currentStock: 'stepResults.step-1',
          pendingPOs: 'stepResults.step-2',
          manufacturingSchedule: 'stepResults.step-3',
          requiredItems: 'payload.order.items'
        }
      },
      {
        id: 'step-5',
        action: 'UPDATE_SALES_ORDER_ATP',
        module: 'sales',
        mapping: {
          orderId: 'payload.order.id',
          atpDates: 'stepResults.step-4.atpDates',
          earliestShipDate: 'stepResults.step-4.earliestShipDate'
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B16: SETTINGS_PROPAGATION - Tax bracket change -> propagate to drafts
  {
    id: 'wf-b16-settings-propagation',
    code: 'SETTINGS_PROPAGATION',
    name: 'Tax Settings Propagation',
    description: 'When a tax bracket is changed in Settings, prompt to apply the new rates to all existing draft quotes and orders.',
    category: 'settings-global',
    triggerEvent: EVENT_TYPES.SETTINGS_TAX_CHANGED,
    enabled: true,
    conditions: [],
    steps: [
      {
        id: 'step-1',
        action: 'FIND_AFFECTED_DRAFTS',
        module: 'sales',
        mapping: {
          oldTaxRate: 'payload.oldRate',
          newTaxRate: 'payload.newRate',
          taxCode: 'payload.taxCode',
          statuses: '["draft", "pending"]'
        }
      },
      {
        id: 'step-2',
        action: 'QUEUE_TAX_UPDATE_PROMPT',
        module: 'notifications',
        mapping: {
          title: '"Tax Rate Updated"',
          message: '"{stepResults.step-1.affectedCount} draft documents use the old rate. Apply new rate?"',
          type: 'warning',
          actionRequired: true,
          actionPayload: {
            documents: 'stepResults.step-1.affectedDocuments',
            newRate: 'payload.newRate'
          }
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B17: HR_POS_INTERLOCK - POS drawer only opens if employee checked in
  {
    id: 'wf-b17-hr-pos-interlock',
    code: 'HR_POS_INTERLOCK',
    name: 'HR-POS Attendance Interlock',
    description: 'POS cash drawer only opens if the requesting employee has checked in via the HR attendance system.',
    category: 'hr-pos',
    triggerEvent: EVENT_TYPES.POS_DRAWER_OPEN_REQUEST,
    enabled: true,
    conditions: [],
    steps: [
      {
        id: 'step-1',
        action: 'CHECK_ATTENDANCE',
        module: 'hr',
        mapping: {
          employeeId: 'payload.employeeId',
          date: 'payload.date'
        }
      },
      {
        id: 'step-2',
        action: 'GRANT_OR_DENY_DRAWER',
        module: 'pos',
        mapping: {
          employeeId: 'payload.employeeId',
          terminalId: 'payload.terminalId',
          allowed: 'stepResults.step-1.isCheckedIn',
          reason: 'stepResults.step-1.isCheckedIn ? "Attendance verified" : "Employee not checked in"'
        }
      },
      {
        id: 'step-3',
        action: 'NOTIFY',
        module: 'notifications',
        mapping: {
          title: '"POS Drawer Access"',
          message: 'stepResults.step-1.isCheckedIn ? "Drawer opened for {payload.employeeId}" : "Drawer DENIED - employee not checked in"',
          type: 'stepResults.step-1.isCheckedIn ? "info" : "error"',
          target: 'payload.employeeId'
        },
        condition: { field: 'stepResults.step-1.isCheckedIn', operator: 'eq', value: false }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B18: ACCOUNTING_CREDIT_HOLD - Customer overdue -> lock CRM conversion
  {
    id: 'wf-b18-accounting-credit-hold',
    code: 'ACCOUNTING_CREDIT_HOLD',
    name: 'Overdue Account Credit Hold',
    description: 'When a customer has overdue payments, lock CRM lead conversion to Sales Order until the balance is cleared.',
    category: 'accounting-crm',
    triggerEvent: EVENT_TYPES.ACCOUNTING_PAYMENT_OVERDUE,
    enabled: true,
    conditions: [
      { field: 'payload.daysOverdue', operator: 'gte', value: 30 }
    ],
    steps: [
      {
        id: 'step-1',
        action: 'SET_CREDIT_HOLD',
        module: 'crm',
        mapping: {
          customerId: 'payload.customerId',
          holdReason: '"Payment overdue by {payload.daysOverdue} days"',
          overdueAmount: 'payload.overdueAmount',
          blockedActions: '["convert_to_sales_order", "create_new_quote"]'
        }
      },
      {
        id: 'step-2',
        action: 'NOTIFY',
        module: 'notifications',
        mapping: {
          title: '"Credit Hold Applied"',
          message: '"Customer {payload.customerName} placed on credit hold. Overdue: {payload.overdueAmount}"',
          type: 'error',
          target: 'payload.assignedSalesRep'
        }
      }
    ],
    version: 1,
    builtIn: true
  },

  // B21: INFLUENCER_SEEDING - Package sent -> debit marketing stock + expense
  {
    id: 'wf-b21-influencer-seeding',
    code: 'INFLUENCER_SEEDING',
    name: 'Influencer Product Seeding',
    description: 'When a product package is sent to an influencer, debit the marketing stock allocation and write a marketing expense entry.',
    category: 'influencer-inventory-accounting',
    triggerEvent: EVENT_TYPES.INFLUENCER_PACKAGE_SENT,
    enabled: true,
    conditions: [],
    steps: [
      {
        id: 'step-1',
        action: 'DEBIT_MARKETING_STOCK',
        module: 'inventory',
        mapping: {
          items: 'payload.package.items',
          warehouseId: '"marketing-warehouse"',
          reason: '"Influencer seeding - {payload.influencer.name}"',
          referenceId: 'payload.package.id'
        }
      },
      {
        id: 'step-2',
        action: 'CREATE_MARKETING_EXPENSE',
        module: 'accounting',
        mapping: {
          category: '"Marketing - Influencer Seeding"',
          amount: 'payload.package.totalCostValue',
          influencerId: 'payload.influencer.id',
          influencerName: 'payload.influencer.name',
          items: 'payload.package.items',
          date: 'payload.package.sentDate'
        }
      },
      {
        id: 'step-3',
        action: 'NOTIFY',
        module: 'notifications',
        mapping: {
          title: '"Influencer Package Sent"',
          message: '"Package to {payload.influencer.name} recorded. Stock debited, expense logged."',
          type: 'info',
          target: 'marketing-team'
        }
      }
    ],
    version: 1,
    builtIn: true
  }
]

// ============================================================
//  WORKFLOW MANAGEMENT FUNCTIONS
// ============================================================

/**
 * Initialize workflow definitions store with built-in workflows.
 * Merges built-ins with any user customizations.
 */
export function initializeWorkflows() {
  const stored = _getStore(STORAGE_KEYS.workflowDefinitions, [])
  const builtInIds = new Set(BUILT_IN_WORKFLOWS.map(w => w.id))

  // Preserve user-created workflows
  const userWorkflows = stored.filter(w => !builtInIds.has(w.id))

  // Merge built-ins (using stored enabled state if available)
  const merged = BUILT_IN_WORKFLOWS.map(builtIn => {
    const existing = stored.find(s => s.id === builtIn.id)
    if (existing) {
      return { ...builtIn, enabled: existing.enabled, customConditions: existing.customConditions }
    }
    return { ...builtIn }
  })

  const all = [...merged, ...userWorkflows]
  _saveStore(STORAGE_KEYS.workflowDefinitions, all)
  return all
}

/**
 * Register a new custom workflow definition.
 */
export function registerWorkflow(definition) {
  const workflows = _getStore(STORAGE_KEYS.workflowDefinitions, [])
  const workflow = {
    id: definition.id || `wf-custom-${_uid()}`,
    ...definition,
    enabled: definition.enabled !== undefined ? definition.enabled : true,
    builtIn: false,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  workflows.push(workflow)
  _saveStore(STORAGE_KEYS.workflowDefinitions, workflows)
  return workflow
}

/**
 * Execute a workflow given its ID and triggering data.
 */
export function executeWorkflow(workflowId, triggerData) {
  const workflows = _getStore(STORAGE_KEYS.workflowDefinitions, [])
  const workflow = workflows.find(w => w.id === workflowId)

  if (!workflow) {
    return { success: false, error: 'Workflow not found', workflowId }
  }

  if (!workflow.enabled) {
    return { success: false, error: 'Workflow is disabled', workflowId }
  }

  // Evaluate conditions
  if (workflow.conditions && workflow.conditions.length > 0) {
    const conditionsMet = evaluateConditions(workflow.conditions, triggerData)
    if (!conditionsMet) {
      return { success: false, error: 'Conditions not met', workflowId, conditions: workflow.conditions }
    }
  }

  // Execute steps
  const execution = {
    id: `exec-${_uid()}`,
    workflowId: workflow.id,
    workflowName: workflow.name,
    workflowCode: workflow.code,
    triggerEvent: workflow.triggerEvent,
    triggerData,
    steps: [],
    status: 'running',
    startedAt: new Date().toISOString(),
    completedAt: null,
    outcome: null
  }

  const stepResults = {}

  for (const step of workflow.steps) {
    const stepExec = {
      stepId: step.id,
      action: step.action,
      module: step.module,
      status: 'pending',
      startedAt: new Date().toISOString(),
      result: null,
      error: null
    }

    // Check step-level condition
    if (step.condition) {
      const stepConditionMet = evaluateConditions(
        [step.condition],
        { ...triggerData, stepResults }
      )
      if (!stepConditionMet) {
        stepExec.status = 'skipped'
        stepExec.result = { reason: 'Step condition not met' }
        execution.steps.push(stepExec)
        continue
      }
    }

    try {
      // Resolve mappings
      const resolvedParams = _resolveMappings(step.mapping, { ...triggerData, stepResults })
      stepExec.status = 'completed'
      stepExec.result = {
        action: step.action,
        module: step.module,
        params: resolvedParams,
        simulatedOutput: _simulateStepAction(step.action, resolvedParams)
      }
      stepResults[step.id] = stepExec.result.simulatedOutput
    } catch (err) {
      stepExec.status = 'failed'
      stepExec.error = err.message || String(err)
    }

    stepExec.completedAt = new Date().toISOString()
    execution.steps.push(stepExec)

    // Abort on failure
    if (stepExec.status === 'failed') {
      execution.status = 'failed'
      execution.outcome = `Step ${step.id} failed: ${stepExec.error}`
      execution.completedAt = new Date().toISOString()
      _saveExecution(execution)
      return { success: false, execution }
    }
  }

  execution.status = 'completed'
  execution.outcome = `All ${execution.steps.length} steps completed successfully`
  execution.completedAt = new Date().toISOString()
  _saveExecution(execution)

  return { success: true, execution }
}

/**
 * Get workflow execution history, optionally filtered.
 */
export function getWorkflowExecutions(filters = {}) {
  let executions = _getStore(STORAGE_KEYS.workflowExecutions, [])

  if (filters.workflowId) {
    executions = executions.filter(e => e.workflowId === filters.workflowId)
  }
  if (filters.status) {
    executions = executions.filter(e => e.status === filters.status)
  }
  if (filters.since) {
    executions = executions.filter(e => e.startedAt >= filters.since)
  }
  if (filters.until) {
    executions = executions.filter(e => e.startedAt <= filters.until)
  }
  if (filters.workflowCode) {
    executions = executions.filter(e => e.workflowCode === filters.workflowCode)
  }
  if (filters.limit) {
    executions = executions.slice(-filters.limit)
  }

  return executions
}

/**
 * Evaluate an array of conditions against data. Returns true if ALL conditions pass.
 */
export function evaluateConditions(conditions, data) {
  if (!conditions || conditions.length === 0) return true

  return conditions.every(condition => {
    const actualValue = _resolveFieldPath(condition.field, data)

    switch (condition.operator) {
      case 'eq':
        return actualValue === condition.value
      case 'neq':
        return actualValue !== condition.value
      case 'gt':
        return Number(actualValue) > Number(condition.value)
      case 'gte':
        return Number(actualValue) >= Number(condition.value)
      case 'lt':
        return Number(actualValue) < Number(condition.value)
      case 'lte':
        return Number(actualValue) <= Number(condition.value)
      case 'contains':
        return String(actualValue).includes(String(condition.value))
      case 'not_contains':
        return !String(actualValue).includes(String(condition.value))
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(actualValue)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(actualValue)
      case 'exists':
        return condition.value ? (actualValue !== undefined && actualValue !== null) : (actualValue === undefined || actualValue === null)
      case 'regex':
        try { return new RegExp(condition.value).test(String(actualValue)) }
        catch { return false }
      default:
        console.warn(`[WorkflowEngine] Unknown operator: ${condition.operator}`)
        return false
    }
  })
}

/**
 * Enqueue an async workflow step for later processing.
 */
export function enqueueWorkflowStep(step) {
  const queue = _getStore(STORAGE_KEYS.workflowQueue, [])
  const entry = {
    id: `q-${_uid()}`,
    ...step,
    status: 'pending',
    enqueuedAt: new Date().toISOString(),
    attempts: 0,
    maxAttempts: step.maxAttempts || 3,
    nextAttemptAt: new Date().toISOString()
  }
  queue.push(entry)
  _saveStore(STORAGE_KEYS.workflowQueue, queue)
  return entry
}

/**
 * Process all pending items in the workflow queue.
 */
export function processWorkflowQueue() {
  const queue = _getStore(STORAGE_KEYS.workflowQueue, [])
  const now = new Date().toISOString()
  const results = []

  const updatedQueue = queue.map(entry => {
    if (entry.status !== 'pending') return entry
    if (entry.nextAttemptAt > now) return entry

    entry.attempts++
    try {
      const result = executeWorkflow(entry.workflowId, entry.triggerData)
      entry.status = result.success ? 'completed' : 'failed'
      entry.lastResult = result
      entry.processedAt = now
      results.push({ entryId: entry.id, ...result })
    } catch (err) {
      if (entry.attempts >= entry.maxAttempts) {
        entry.status = 'failed'
        entry.lastError = err.message
      } else {
        // Exponential backoff: 1min, 4min, 9min...
        const backoffMs = Math.pow(entry.attempts, 2) * 60000
        entry.nextAttemptAt = new Date(Date.now() + backoffMs).toISOString()
      }
      results.push({ entryId: entry.id, success: false, error: err.message })
    }
    return entry
  })

  _saveStore(STORAGE_KEYS.workflowQueue, updatedQueue)
  return results
}

/**
 * Get all registered workflow definitions.
 */
export function getWorkflowDefinitions() {
  const stored = _getStore(STORAGE_KEYS.workflowDefinitions, [])
  if (stored.length === 0) {
    return initializeWorkflows()
  }
  return stored
}

/**
 * Enable or disable a workflow.
 */
export function toggleWorkflow(workflowId, enabled) {
  const workflows = _getStore(STORAGE_KEYS.workflowDefinitions, [])
  const workflow = workflows.find(w => w.id === workflowId)
  if (!workflow) return null

  workflow.enabled = typeof enabled === 'boolean' ? enabled : !workflow.enabled
  workflow.updatedAt = new Date().toISOString()
  _saveStore(STORAGE_KEYS.workflowDefinitions, workflows)
  return workflow
}

/**
 * Update a workflow definition (custom workflows only, or overridable fields for built-ins).
 */
export function updateWorkflow(workflowId, updates) {
  const workflows = _getStore(STORAGE_KEYS.workflowDefinitions, [])
  const idx = workflows.findIndex(w => w.id === workflowId)
  if (idx === -1) return null

  const workflow = workflows[idx]
  if (workflow.builtIn) {
    // Only allow toggling enabled and adding custom conditions for built-ins
    if (updates.enabled !== undefined) workflow.enabled = updates.enabled
    if (updates.customConditions) workflow.customConditions = updates.customConditions
  } else {
    Object.assign(workflow, updates)
  }

  workflow.updatedAt = new Date().toISOString()
  workflow.version = (workflow.version || 1) + 1
  workflows[idx] = workflow
  _saveStore(STORAGE_KEYS.workflowDefinitions, workflows)
  return workflow
}

/**
 * Delete a custom workflow (built-in workflows cannot be deleted).
 */
export function deleteWorkflow(workflowId) {
  const workflows = _getStore(STORAGE_KEYS.workflowDefinitions, [])
  const workflow = workflows.find(w => w.id === workflowId)
  if (!workflow) return false
  if (workflow.builtIn) return false

  const updated = workflows.filter(w => w.id !== workflowId)
  _saveStore(STORAGE_KEYS.workflowDefinitions, updated)
  return true
}

/**
 * Get workflow status dashboard data.
 */
export function getWorkflowDashboard() {
  const workflows = getWorkflowDefinitions()
  const executions = _getStore(STORAGE_KEYS.workflowExecutions, [])
  const queue = _getStore(STORAGE_KEYS.workflowQueue, [])
  const events = _getStore(STORAGE_KEYS.moduleEvents, [])

  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const recentExecutions = executions.filter(e => e.startedAt >= last24h)
  const weeklyExecutions = executions.filter(e => e.startedAt >= last7d)

  // Per-workflow stats
  const workflowStats = workflows.map(wf => {
    const wfExecs = executions.filter(e => e.workflowId === wf.id)
    const recent = wfExecs.filter(e => e.startedAt >= last24h)
    const successful = wfExecs.filter(e => e.status === 'completed')
    const failed = wfExecs.filter(e => e.status === 'failed')

    return {
      id: wf.id,
      code: wf.code,
      name: wf.name,
      category: wf.category,
      enabled: wf.enabled,
      builtIn: wf.builtIn,
      totalExecutions: wfExecs.length,
      successCount: successful.length,
      failureCount: failed.length,
      successRate: wfExecs.length > 0 ? Math.round((successful.length / wfExecs.length) * 100) : 0,
      last24hExecutions: recent.length,
      lastExecutedAt: wfExecs.length > 0 ? wfExecs[wfExecs.length - 1].startedAt : null
    }
  })

  return {
    summary: {
      totalWorkflows: workflows.length,
      enabledWorkflows: workflows.filter(w => w.enabled).length,
      disabledWorkflows: workflows.filter(w => !w.enabled).length,
      builtInWorkflows: workflows.filter(w => w.builtIn).length,
      customWorkflows: workflows.filter(w => !w.builtIn).length,
      totalExecutions: executions.length,
      last24hExecutions: recentExecutions.length,
      last7dExecutions: weeklyExecutions.length,
      successRate: executions.length > 0
        ? Math.round((executions.filter(e => e.status === 'completed').length / executions.length) * 100)
        : 0,
      pendingQueueItems: queue.filter(q => q.status === 'pending').length,
      failedQueueItems: queue.filter(q => q.status === 'failed').length,
      totalEvents: events.length,
      recentEvents: events.filter(e => e.timestamp >= last24h).length
    },
    workflowStats,
    recentExecutions: recentExecutions.slice(-20),
    queueStatus: {
      pending: queue.filter(q => q.status === 'pending').length,
      completed: queue.filter(q => q.status === 'completed').length,
      failed: queue.filter(q => q.status === 'failed').length,
      total: queue.length
    }
  }
}

// ============================================================
//  CROSS-MODULE HELPERS (B15, B19, B20, B22-B25)
// ============================================================

/**
 * B15: AI Module Omni-Search - Search across all modules.
 */
export function omniSearch(query) {
  if (!query || query.trim().length === 0) return { results: [], query }

  const normalizedQuery = query.toLowerCase().trim()
  const results = []

  const MODULE_SEARCH_CONFIG = [
    { module: 'crm', storageKeys: ['sic-crm-leads', 'sic-crm-contacts', 'sic-crm-deals'], nameFields: ['name', 'company', 'email', 'phone'], entityType: 'contact' },
    { module: 'sales', storageKeys: ['sic-sales-quotations', 'sic-sales-orders', 'sic-sales-invoices'], nameFields: ['customerName', 'id', 'status', 'notes'], entityType: 'order' },
    { module: 'purchase', storageKeys: ['sic-purchase-orders', 'sic-purchase-rfqs', 'sic-purchase-bills'], nameFields: ['vendorName', 'id', 'status'], entityType: 'purchase' },
    { module: 'inventory', storageKeys: ['sic-inventory-products', 'sic-inventory-stock-levels'], nameFields: ['name', 'sku', 'category', 'description'], entityType: 'product' },
    { module: 'hr', storageKeys: ['sic-hr-employees', 'sic-hr-leaves', 'sic-hr-payroll'], nameFields: ['name', 'email', 'department', 'position'], entityType: 'employee' },
    { module: 'accounting', storageKeys: ['sic-accounting-journals', 'sic-accounting-ledger'], nameFields: ['description', 'account', 'reference'], entityType: 'journal' },
    { module: 'influencer', storageKeys: ['sic-influencer-profiles', 'sic-influencer-campaigns'], nameFields: ['name', 'platform', 'handle', 'campaignName'], entityType: 'influencer' }
  ]

  MODULE_SEARCH_CONFIG.forEach(config => {
    config.storageKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]')
        const items = Array.isArray(data) ? data : (data.items || data.list || Object.values(data))
        if (!Array.isArray(items)) return

        items.forEach(item => {
          const searchableText = config.nameFields
            .map(f => String(item[f] || ''))
            .join(' ')
            .toLowerCase()

          if (searchableText.includes(normalizedQuery)) {
            results.push({
              module: config.module,
              entityType: config.entityType,
              id: item.id,
              title: item.name || item.customerName || item.vendorName || item.description || item.id,
              subtitle: item.email || item.sku || item.status || item.department || '',
              matchedField: config.nameFields.find(f => String(item[f] || '').toLowerCase().includes(normalizedQuery)),
              data: item,
              score: _calculateSearchScore(normalizedQuery, searchableText)
            })
          }
        })
      } catch {
        // Skip unreadable storage keys
      }
    })
  })

  // Sort by relevance score
  results.sort((a, b) => b.score - a.score)

  return {
    results: results.slice(0, 50),
    totalResults: results.length,
    query,
    searchedModules: MODULE_SEARCH_CONFIG.map(c => c.module),
    timestamp: new Date().toISOString()
  }
}

/**
 * B19: Product Matrix Engine - Grid view for item variants.
 */
export function getProductMatrix(itemId) {
  try {
    const products = JSON.parse(localStorage.getItem('sic-inventory-products') || '[]')
    const allProducts = Array.isArray(products) ? products : []

    const baseProduct = allProducts.find(p => p.id === itemId)
    if (!baseProduct) return { found: false, itemId }

    // Find all variants by matching base SKU prefix or parent reference
    const baseSku = (baseProduct.sku || '').split('-')[0]
    const variants = allProducts.filter(p =>
      p.id !== itemId && (
        (p.parentProductId === itemId) ||
        (baseSku && (p.sku || '').startsWith(baseSku))
      )
    )

    // Extract attribute axes (size, color, material, etc.)
    const attributes = {}
    const allVariants = [baseProduct, ...variants]

    allVariants.forEach(v => {
      if (v.attributes) {
        Object.entries(v.attributes).forEach(([key, val]) => {
          if (!attributes[key]) attributes[key] = new Set()
          attributes[key].add(val)
        })
      }
      if (v.size) { if (!attributes.size) attributes.size = new Set(); attributes.size.add(v.size) }
      if (v.color) { if (!attributes.color) attributes.color = new Set(); attributes.color.add(v.color) }
    })

    // Convert sets to arrays
    const axes = {}
    Object.entries(attributes).forEach(([key, valSet]) => {
      axes[key] = Array.from(valSet)
    })

    // Build matrix grid
    const matrix = allVariants.map(v => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      price: v.price,
      cost: v.cost,
      stock: v.stock,
      status: v.status,
      attributes: v.attributes || { size: v.size, color: v.color }
    }))

    return {
      found: true,
      baseProduct: {
        id: baseProduct.id,
        name: baseProduct.name,
        sku: baseProduct.sku,
        category: baseProduct.category
      },
      axes,
      matrix,
      totalVariants: variants.length
    }
  } catch {
    return { found: false, itemId, error: 'Failed to build product matrix' }
  }
}

/**
 * B20: Cross-Module Link Previews - Mini-card data for any entity.
 */
export function getEntityPreview(entityType, entityId) {
  const ENTITY_CONFIG = {
    contact: { keys: ['sic-crm-leads', 'sic-crm-contacts'], fields: ['name', 'email', 'phone', 'company', 'status'] },
    deal: { keys: ['sic-crm-deals'], fields: ['name', 'value', 'stage', 'probability', 'assignedTo'] },
    quote: { keys: ['sic-sales-quotations'], fields: ['id', 'customerName', 'totalAmount', 'status', 'validUntil'] },
    salesOrder: { keys: ['sic-sales-orders'], fields: ['id', 'customerName', 'totalAmount', 'status', 'deliveryDate'] },
    invoice: { keys: ['sic-sales-invoices'], fields: ['id', 'customerName', 'totalAmount', 'status', 'dueDate'] },
    purchaseOrder: { keys: ['sic-purchase-orders'], fields: ['id', 'vendorName', 'totalAmount', 'status', 'expectedDate'] },
    product: { keys: ['sic-inventory-products'], fields: ['name', 'sku', 'price', 'stock', 'status', 'category'] },
    employee: { keys: ['sic-hr-employees'], fields: ['name', 'email', 'department', 'position', 'status'] },
    journal: { keys: ['sic-accounting-journals'], fields: ['id', 'description', 'amount', 'date', 'type'] },
    influencer: { keys: ['sic-influencer-profiles'], fields: ['name', 'platform', 'handle', 'followers', 'tier'] },
    vendor: { keys: ['sic-purchase-vendors'], fields: ['name', 'email', 'phone', 'category', 'rating'] }
  }

  const config = ENTITY_CONFIG[entityType]
  if (!config) {
    return { found: false, entityType, entityId, error: `Unknown entity type: ${entityType}` }
  }

  for (const key of config.keys) {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || '[]')
      const items = Array.isArray(raw) ? raw : (raw.items || raw.list || Object.values(raw))
      if (!Array.isArray(items)) continue

      const entity = items.find(item => item.id === entityId)
      if (entity) {
        const preview = { found: true, entityType, entityId }
        config.fields.forEach(field => {
          if (entity[field] !== undefined) preview[field] = entity[field]
        })
        preview.updatedAt = entity.updatedAt || entity.createdAt
        return preview
      }
    } catch {
      continue
    }
  }

  return { found: false, entityType, entityId }
}

/**
 * B22: Universal Drag-and-Drop Dashboard Layout persistence.
 */
export function saveDashboardLayout(userId, layout) {
  const layouts = _getStore(STORAGE_KEYS.dashboardLayouts, {})
  layouts[userId] = {
    layout,
    updatedAt: new Date().toISOString()
  }
  _saveStore(STORAGE_KEYS.dashboardLayouts, layouts)
  return layouts[userId]
}

export function getDashboardLayout(userId) {
  const layouts = _getStore(STORAGE_KEYS.dashboardLayouts, {})
  return layouts[userId] || {
    layout: _getDefaultDashboardLayout(),
    updatedAt: null
  }
}

/**
 * B23: Universal Import/Export for any module.
 */
export function importCSV(module, csvData, mappings = {}) {
  if (!csvData || typeof csvData !== 'string') {
    return { success: false, error: 'Invalid CSV data' }
  }

  const lines = csvData.trim().split('\n')
  if (lines.length < 2) {
    return { success: false, error: 'CSV must have headers and at least one data row' }
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const records = []
  const errors = []

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = _parseCSVLine(lines[i])
      const record = {}

      headers.forEach((header, idx) => {
        const targetField = mappings[header] || header
        record[targetField] = values[idx] !== undefined ? values[idx].trim().replace(/^"|"$/g, '') : ''
      })

      record.id = record.id || `imp-${_uid()}`
      record.importedAt = new Date().toISOString()
      record.source = 'csv-import'
      records.push(record)
    } catch (err) {
      errors.push({ row: i + 1, error: err.message || 'Parse error' })
    }
  }

  // Persist to module storage
  const storageKeyMap = {
    crm: 'sic-crm-contacts',
    sales: 'sic-sales-orders',
    purchase: 'sic-purchase-orders',
    inventory: 'sic-inventory-products',
    hr: 'sic-hr-employees',
    influencer: 'sic-influencer-profiles'
  }

  const targetKey = storageKeyMap[module]
  if (targetKey) {
    try {
      const existing = JSON.parse(localStorage.getItem(targetKey) || '[]')
      const merged = Array.isArray(existing) ? [...existing, ...records] : records
      localStorage.setItem(targetKey, JSON.stringify(merged))
    } catch {
      return { success: false, error: 'Failed to save imported records' }
    }
  }

  return {
    success: true,
    module,
    totalRows: lines.length - 1,
    importedCount: records.length,
    errorCount: errors.length,
    errors: errors.slice(0, 20),
    sampleRecords: records.slice(0, 3)
  }
}

export function exportModule(module, filters = {}, format = 'csv') {
  const storageKeyMap = {
    crm: ['sic-crm-leads', 'sic-crm-contacts', 'sic-crm-deals'],
    sales: ['sic-sales-quotations', 'sic-sales-orders', 'sic-sales-invoices'],
    purchase: ['sic-purchase-orders', 'sic-purchase-bills'],
    inventory: ['sic-inventory-products', 'sic-inventory-stock-levels'],
    hr: ['sic-hr-employees', 'sic-hr-leaves'],
    accounting: ['sic-accounting-journals', 'sic-accounting-ledger'],
    influencer: ['sic-influencer-profiles', 'sic-influencer-campaigns']
  }

  const keys = storageKeyMap[module]
  if (!keys) {
    return { success: false, error: `Unknown module: ${module}` }
  }

  let allRecords = []
  keys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]')
      const items = Array.isArray(data) ? data : (data.items || data.list || Object.values(data))
      if (Array.isArray(items)) {
        allRecords = allRecords.concat(items.map(item => ({ ...item, _sourceKey: key })))
      }
    } catch {
      // Skip
    }
  })

  // Apply filters
  if (filters.status) {
    allRecords = allRecords.filter(r => r.status === filters.status)
  }
  if (filters.since) {
    allRecords = allRecords.filter(r => (r.createdAt || r.date || '') >= filters.since)
  }
  if (filters.until) {
    allRecords = allRecords.filter(r => (r.createdAt || r.date || '') <= filters.until)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    allRecords = allRecords.filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(q))
    )
  }

  if (format === 'json') {
    return {
      success: true,
      module,
      format: 'json',
      recordCount: allRecords.length,
      data: allRecords
    }
  }

  // CSV format
  if (allRecords.length === 0) {
    return { success: true, module, format: 'csv', recordCount: 0, csv: '' }
  }

  const allFields = new Set()
  allRecords.forEach(r => Object.keys(r).forEach(k => {
    if (k !== '_sourceKey') allFields.add(k)
  }))
  const fields = Array.from(allFields)

  const headerLine = fields.map(f => `"${f}"`).join(',')
  const dataLines = allRecords.map(record =>
    fields.map(f => {
      const val = record[f]
      if (val === null || val === undefined) return '""'
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
      return `"${str.replace(/"/g, '""')}"`
    }).join(',')
  )

  return {
    success: true,
    module,
    format: 'csv',
    recordCount: allRecords.length,
    csv: [headerLine, ...dataLines].join('\n')
  }
}

/**
 * B24: Global Next Action Task Tray - All pending approvals/tasks/reminders.
 */
export function getNextActions(userId) {
  const actions = []

  // Gather pending approvals from workflow queue
  const queue = _getStore(STORAGE_KEYS.workflowQueue, [])
  queue
    .filter(q => q.status === 'pending')
    .forEach(q => {
      actions.push({
        id: `queue-${q.id}`,
        type: 'workflow_queue',
        title: `Workflow pending: ${q.workflowId}`,
        priority: 'medium',
        dueDate: q.nextAttemptAt,
        module: 'workflow',
        actionUrl: `/settings/workflows/${q.workflowId}`,
        createdAt: q.enqueuedAt
      })
    })

  // Gather notifications requiring action
  try {
    const notifications = JSON.parse(localStorage.getItem('sic-crm-notifications') || '[]')
    notifications
      .filter(n => n.actionRequired && !n.resolved)
      .forEach(n => {
        actions.push({
          id: `notif-${n.id}`,
          type: 'notification_action',
          title: n.title || n.message,
          priority: n.priority || 'medium',
          dueDate: n.dueDate,
          module: n.module || 'system',
          actionUrl: n.actionUrl,
          createdAt: n.createdAt
        })
      })
  } catch { /* skip */ }

  // Gather pending approval requests
  try {
    const approvals = JSON.parse(localStorage.getItem('sic-crm-approvals') || '[]')
    approvals
      .filter(a => a.status === 'pending' && (!userId || a.approverId === userId))
      .forEach(a => {
        actions.push({
          id: `approval-${a.id}`,
          type: 'approval',
          title: `Approve: ${a.title || a.type}`,
          priority: 'high',
          dueDate: a.dueDate,
          module: a.module,
          actionUrl: a.actionUrl || `/approvals/${a.id}`,
          createdAt: a.createdAt
        })
      })
  } catch { /* skip */ }

  // Gather overdue invoices for sales team
  try {
    const invoices = JSON.parse(localStorage.getItem('sic-sales-invoices') || '[]')
    const today = new Date().toISOString().split('T')[0]
    invoices
      .filter(inv => inv.status === 'sent' && inv.dueDate && inv.dueDate < today)
      .forEach(inv => {
        actions.push({
          id: `overdue-${inv.id}`,
          type: 'overdue_invoice',
          title: `Overdue invoice: ${inv.id} - ${inv.customerName}`,
          priority: 'high',
          dueDate: inv.dueDate,
          module: 'sales',
          actionUrl: `/sales/invoices/${inv.id}`,
          createdAt: inv.createdAt
        })
      })
  } catch { /* skip */ }

  // Gather low stock alerts
  try {
    const products = JSON.parse(localStorage.getItem('sic-inventory-products') || '[]')
    const lowStock = Array.isArray(products)
      ? products.filter(p => p.stock !== undefined && p.minStock !== undefined && p.stock <= p.minStock)
      : []
    lowStock.forEach(p => {
      actions.push({
        id: `lowstock-${p.id}`,
        type: 'low_stock',
        title: `Low stock: ${p.name} (${p.stock}/${p.minStock})`,
        priority: p.stock === 0 ? 'critical' : 'medium',
        module: 'inventory',
        actionUrl: `/inventory/products/${p.id}`,
        createdAt: new Date().toISOString()
      })
    })
  } catch { /* skip */ }

  // Sort by priority then date
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  actions.sort((a, b) => {
    const pDiff = (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
    if (pDiff !== 0) return pDiff
    return (a.dueDate || '9999') < (b.dueDate || '9999') ? -1 : 1
  })

  return {
    actions,
    totalCount: actions.length,
    byType: {
      workflow_queue: actions.filter(a => a.type === 'workflow_queue').length,
      notification_action: actions.filter(a => a.type === 'notification_action').length,
      approval: actions.filter(a => a.type === 'approval').length,
      overdue_invoice: actions.filter(a => a.type === 'overdue_invoice').length,
      low_stock: actions.filter(a => a.type === 'low_stock').length
    },
    userId,
    generatedAt: new Date().toISOString()
  }
}

/**
 * B25: Live Currency Localizer - Recalculate all monetary values on a page.
 */
export function localizePageCurrency(data, targetCurrency) {
  try {
    const currencyStore = JSON.parse(localStorage.getItem('sic_crm_currencies') || '{}')
    const rates = currencyStore.rates || { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094 }
    const symbols = currencyStore.symbols || { INR: '\u20B9', USD: '$', EUR: '\u20AC', GBP: '\u00A3' }
    const baseCurrency = currencyStore.baseCurrency || 'INR'

    if (!rates[targetCurrency]) {
      return { success: false, error: `Unsupported currency: ${targetCurrency}` }
    }

    const baseRate = rates[baseCurrency] || 1
    const targetRate = rates[targetCurrency]

    function convertValue(amount, fromCurrency) {
      if (typeof amount !== 'number' || isNaN(amount)) return amount
      const from = fromCurrency || baseCurrency
      const fromRate = rates[from] || 1
      // Convert to base first, then to target
      const inBase = amount / fromRate
      return Math.round(inBase * targetRate * 100) / 100
    }

    function localizeObject(obj) {
      if (Array.isArray(obj)) return obj.map(localizeObject)
      if (obj === null || typeof obj !== 'object') return obj

      const result = { ...obj }
      const moneyFields = ['amount', 'totalAmount', 'subtotal', 'total', 'price', 'cost',
        'value', 'balance', 'credit', 'debit', 'discount', 'tax', 'shipping',
        'commission', 'payout', 'salary', 'net', 'gross', 'overdueAmount',
        'refundAmount', 'unitPrice', 'lineTotal']

      const sourceCurrency = obj.currency || baseCurrency

      moneyFields.forEach(field => {
        if (typeof result[field] === 'number') {
          result[`_original_${field}`] = result[field]
          result[`_original_currency`] = sourceCurrency
          result[field] = convertValue(result[field], sourceCurrency)
        }
      })

      result.currency = targetCurrency
      result._currencySymbol = symbols[targetCurrency] || targetCurrency

      // Recurse into nested objects
      Object.keys(result).forEach(key => {
        if (key.startsWith('_original_') || key === '_currencySymbol') return
        if (Array.isArray(result[key])) {
          result[key] = result[key].map(localizeObject)
        } else if (result[key] && typeof result[key] === 'object') {
          result[key] = localizeObject(result[key])
        }
      })

      return result
    }

    const localized = localizeObject(data)

    return {
      success: true,
      data: localized,
      targetCurrency,
      symbol: symbols[targetCurrency] || targetCurrency,
      conversionRate: targetRate / baseRate,
      baseCurrency
    }
  } catch (err) {
    return { success: false, error: err.message || 'Currency localization failed' }
  }
}

// ============================================================
//  INTERNAL HELPERS
// ============================================================

function _getStore(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
    return defaultValue
  } catch {
    return defaultValue
  }
}

function _saveStore(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error(`[WorkflowEngine] Failed to save ${key}:`, err)
  }
}

function _uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

function _appendEvent(event) {
  const events = _getStore(STORAGE_KEYS.moduleEvents, [])
  events.push(event)
  // Keep last 1000 events
  if (events.length > 1000) events.splice(0, events.length - 1000)
  _saveStore(STORAGE_KEYS.moduleEvents, events)
}

function _saveExecution(execution) {
  const executions = _getStore(STORAGE_KEYS.workflowExecutions, [])
  executions.push(execution)
  // Keep last 500 executions
  if (executions.length > 500) executions.splice(0, executions.length - 500)
  _saveStore(STORAGE_KEYS.workflowExecutions, executions)
}

function _evaluateWorkflowTriggers(event) {
  const workflows = _getStore(STORAGE_KEYS.workflowDefinitions, [])
  workflows
    .filter(wf => wf.enabled && wf.triggerEvent === event.eventName)
    .forEach(wf => {
      try {
        executeWorkflow(wf.id, event.payload)
      } catch (err) {
        console.error(`[WorkflowEngine] Auto-trigger failed for ${wf.id}:`, err)
      }
    })
}

function _resolveFieldPath(path, data) {
  if (!path || !data) return undefined
  const parts = String(path).split('.')
  let current = data
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = current[part]
  }
  return current
}

function _resolveMappings(mapping, data) {
  if (!mapping) return {}
  const result = {}
  Object.entries(mapping).forEach(([key, valuePath]) => {
    if (typeof valuePath === 'object' && valuePath !== null && !Array.isArray(valuePath)) {
      // Nested mapping
      result[key] = _resolveMappings(valuePath, data)
    } else if (typeof valuePath === 'string') {
      if (valuePath.startsWith('"') && valuePath.endsWith('"')) {
        // Literal string value
        result[key] = valuePath.slice(1, -1)
      } else {
        result[key] = _resolveFieldPath(valuePath, data)
      }
    } else {
      // Direct value (number, boolean, etc.)
      result[key] = valuePath
    }
  })
  return result
}

function _simulateStepAction(action, params) {
  // Return simulated output for step chaining
  const simulations = {
    CHECK_STOCK_LEVELS: { deficitItems: params.items || [], checkedAt: new Date().toISOString() },
    FETCH_PO: { id: params.poId, items: [], total: 0, status: 'confirmed' },
    FETCH_GRN: { id: params.poId, items: [], receivedQuantities: {}, status: 'received' },
    VALIDATE_THREE_WAY_MATCH: { matched: true, discrepancies: [] },
    LOOKUP_INFLUENCER: { influencerId: 'inf-001', commissionRate: 10, tierBonus: 0 },
    CALCULATE_COMMISSION: { commissionAmount: (params.orderAmount || 0) * ((params.commissionRate || 10) / 100) },
    GET_AVAILABLE_AGENTS: { nextAvailableAgent: 'agent-fallback-001', agents: [] },
    FETCH_VENDOR_RFQS: { rfqs: [], count: 0 },
    FETCH_VENDOR_POS: { purchaseOrders: [], count: 0 },
    HOLD_STOCK: { holdId: `hold-${_uid()}`, success: true },
    CALCULATE_MATERIAL_DEFICIT: { deficitItems: [], preferredVendors: [] },
    GET_CURRENT_STOCK: { items: [], timestamp: new Date().toISOString() },
    GET_PENDING_POS: { items: [], expectedDates: {} },
    GET_MANUFACTURING_SCHEDULE: { items: [], completionDates: {} },
    CALCULATE_ATP: { atpDates: {}, earliestShipDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] },
    FIND_AFFECTED_DRAFTS: { affectedCount: 0, affectedDocuments: [] },
    CHECK_ATTENDANCE: { isCheckedIn: true, checkInTime: new Date().toISOString() }
  }

  return simulations[action] || { executed: true, action, params, timestamp: new Date().toISOString() }
}

function _calculateSearchScore(query, text) {
  let score = 0
  // Exact match gets highest score
  if (text === query) return 100
  // Starts with gets high score
  if (text.startsWith(query)) score += 50
  // Word-boundary match
  if (new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text)) score += 30
  // Contains match
  if (text.includes(query)) score += 10
  // Shorter text with match = more relevant
  score += Math.max(0, 20 - Math.floor(text.length / 20))
  return score
}

function _parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

function _getDefaultDashboardLayout() {
  return {
    widgets: [
      { id: 'w-1', type: 'kpi-summary', x: 0, y: 0, w: 12, h: 2, title: 'Key Metrics' },
      { id: 'w-2', type: 'sales-pipeline', x: 0, y: 2, w: 6, h: 4, title: 'Sales Pipeline' },
      { id: 'w-3', type: 'revenue-chart', x: 6, y: 2, w: 6, h: 4, title: 'Revenue Trend' },
      { id: 'w-4', type: 'task-tray', x: 0, y: 6, w: 4, h: 4, title: 'Action Items' },
      { id: 'w-5', type: 'recent-activity', x: 4, y: 6, w: 4, h: 4, title: 'Recent Activity' },
      { id: 'w-6', type: 'workflow-status', x: 8, y: 6, w: 4, h: 4, title: 'Workflow Status' }
    ],
    theme: 'default',
    columns: 12,
    rowHeight: 60
  }
}

// ============================================================
//  DEFAULT EXPORT
// ============================================================

const workflowEngine = {
  // Event System
  EVENT_TYPES,
  emitEvent,
  onEvent,
  offEvent,
  getModuleEvents,
  pruneModuleEvents,

  // Workflow Management
  initializeWorkflows,
  registerWorkflow,
  executeWorkflow,
  getWorkflowExecutions,
  evaluateConditions,
  enqueueWorkflowStep,
  processWorkflowQueue,
  getWorkflowDefinitions,
  toggleWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getWorkflowDashboard,

  // Cross-Module Helpers (B15, B19, B20, B22-B25)
  omniSearch,
  getProductMatrix,
  getEntityPreview,
  saveDashboardLayout,
  getDashboardLayout,
  importCSV,
  exportModule,
  getNextActions,
  localizePageCurrency
}

export default workflowEngine
