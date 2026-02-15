import { useMemo } from 'react'

/**
 * Hook for smart form pre-filling based on related record context.
 * When creating a Deal from a Contact, auto-fills contact fields, etc.
 *
 * @param {string} targetType - The type of record being created (e.g. 'deal', 'invoice')
 * @param {Object} sourceRecord - The source record to pre-fill from (e.g. a contact)
 * @param {string} sourceType - The type of the source record (e.g. 'contact', 'lead')
 */

const PREFILL_MAPS = {
  // Creating a deal from a contact
  'contact->deal': (contact) => ({
    contactName: contact.name || '',
    contactEmail: contact.email || '',
    contactPhone: contact.phone || '',
    company: contact.company || '',
    source: 'Existing Contact',
  }),

  // Creating an invoice from a deal/opportunity
  'deal->invoice': (deal) => ({
    customerName: deal.contactName || deal.company || '',
    customerEmail: deal.contactEmail || '',
    amount: deal.value || deal.amount || '',
    reference: `Deal: ${deal.title || deal.name || ''}`,
    currency: deal.currency || 'INR',
  }),

  // Creating a deal from a lead
  'lead->deal': (lead) => ({
    contactName: lead.name || '',
    contactEmail: lead.email || '',
    contactPhone: lead.phone || '',
    company: lead.company || '',
    source: lead.source || '',
    title: `Deal - ${lead.name || lead.company || ''}`,
  }),

  // Creating a contact from a lead (lead conversion)
  'lead->contact': (lead) => ({
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    company: lead.company || '',
    source: lead.source || '',
    notes: lead.notes || '',
  }),

  // Creating a purchase order from a vendor
  'vendor->purchaseOrder': (vendor) => ({
    vendorName: vendor.name || '',
    vendorEmail: vendor.email || '',
    vendorPhone: vendor.phone || '',
    paymentTerms: vendor.paymentTerms || 'Net 30',
  }),

  // Creating a quotation from a contact
  'contact->quotation': (contact) => ({
    customerName: contact.name || '',
    customerEmail: contact.email || '',
    customerPhone: contact.phone || '',
    company: contact.company || '',
  }),

  // Creating a credit note from an invoice
  'invoice->creditNote': (invoice) => ({
    customerName: invoice.customerName || '',
    originalInvoice: invoice.number || invoice.id || '',
    amount: invoice.amount || '',
    reason: '',
  }),
}

export function useSmartPrefill(targetType, sourceRecord, sourceType) {
  const prefilled = useMemo(() => {
    if (!sourceRecord || !sourceType || !targetType) return {}
    const mapKey = `${sourceType}->${targetType}`
    const mapper = PREFILL_MAPS[mapKey]
    if (!mapper) return {}
    return mapper(sourceRecord)
  }, [targetType, sourceRecord, sourceType])

  return { prefilled, hasPrefill: Object.keys(prefilled).length > 0 }
}
