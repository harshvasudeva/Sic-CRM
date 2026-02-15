/**
 * Email Template Store - manages email templates with {{variable}} support.
 * Templates can be used across Sales, CRM, and other modules.
 */

const STORAGE_KEY = 'sic_crm_email_templates'

const DEFAULT_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{company}}!',
    body: `Dear {{name}},

Welcome to {{company}}! We're excited to have you on board.

Your account has been set up and you can get started right away. If you have any questions, don't hesitate to reach out to your account manager, {{accountManager}}.

Best regards,
{{senderName}}
{{company}}`,
    category: 'general',
    variables: ['name', 'company', 'accountManager', 'senderName'],
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'follow-up',
    name: 'Sales Follow-up',
    subject: 'Following up on our conversation - {{company}}',
    body: `Hi {{name}},

Thank you for taking the time to speak with me about {{product}}. I wanted to follow up on our conversation and see if you had any additional questions.

As discussed, here's a brief summary:
- {{keyPoint1}}
- {{keyPoint2}}

I'd love to schedule a follow-up call to discuss next steps. Would {{proposedDate}} work for you?

Best regards,
{{senderName}}`,
    category: 'sales',
    variables: ['name', 'company', 'product', 'keyPoint1', 'keyPoint2', 'proposedDate', 'senderName'],
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'invoice-reminder',
    name: 'Invoice Reminder',
    subject: 'Payment Reminder - Invoice #{{invoiceNumber}}',
    body: `Dear {{name}},

This is a friendly reminder that Invoice #{{invoiceNumber}} for {{amount}} was due on {{dueDate}}.

If you've already sent the payment, please disregard this message. Otherwise, we'd appreciate if you could process the payment at your earliest convenience.

Payment details:
- Invoice: #{{invoiceNumber}}
- Amount: {{amount}}
- Due Date: {{dueDate}}

Please let us know if you have any questions.

Best regards,
{{senderName}}
{{company}}`,
    category: 'accounting',
    variables: ['name', 'invoiceNumber', 'amount', 'dueDate', 'senderName', 'company'],
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'quotation',
    name: 'Quotation Email',
    subject: 'Quotation for {{product}} - {{company}}',
    body: `Dear {{name}},

Thank you for your interest in {{product}}. Please find the quotation details below:

Product/Service: {{product}}
Quantity: {{quantity}}
Unit Price: {{unitPrice}}
Total: {{totalAmount}}
Valid Until: {{validUntil}}

Terms & Conditions:
{{terms}}

Please feel free to reach out if you'd like to discuss or have any modifications.

Best regards,
{{senderName}}
{{company}}`,
    category: 'sales',
    variables: ['name', 'product', 'company', 'quantity', 'unitPrice', 'totalAmount', 'validUntil', 'terms', 'senderName'],
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lead-nurture',
    name: 'Lead Nurture',
    subject: '{{company}} - Resources to help you get started',
    body: `Hi {{name}},

I hope this email finds you well! I noticed you recently expressed interest in {{product}}.

I thought you might find these resources helpful:
1. {{resource1}}
2. {{resource2}}

Would you be available for a quick 15-minute call this week? I'd love to understand your needs better and see how we can help.

Cheers,
{{senderName}}`,
    category: 'crm',
    variables: ['name', 'company', 'product', 'resource1', 'resource2', 'senderName'],
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
]

function getTemplates() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES))
    return DEFAULT_TEMPLATES
  } catch {
    return DEFAULT_TEMPLATES
  }
}

function saveTemplates(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

export function getAllTemplates() {
  return getTemplates()
}

export function getTemplatesByCategory(category) {
  return getTemplates().filter(t => t.category === category)
}

export function getTemplateById(id) {
  return getTemplates().find(t => t.id === id)
}

export function createTemplate(template) {
  const templates = getTemplates()
  const newTemplate = {
    ...template,
    id: `tpl_${Date.now()}`,
    variables: extractVariables(template.body + ' ' + template.subject),
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  templates.push(newTemplate)
  saveTemplates(templates)
  return newTemplate
}

export function updateTemplate(id, updates) {
  const templates = getTemplates()
  const idx = templates.findIndex(t => t.id === id)
  if (idx === -1) return null
  templates[idx] = {
    ...templates[idx],
    ...updates,
    variables: extractVariables((updates.body || templates[idx].body) + ' ' + (updates.subject || templates[idx].subject)),
    updatedAt: new Date().toISOString(),
  }
  saveTemplates(templates)
  return templates[idx]
}

export function deleteTemplate(id) {
  const templates = getTemplates()
  const filtered = templates.filter(t => t.id !== id)
  saveTemplates(filtered)
}

export function duplicateTemplate(id) {
  const template = getTemplateById(id)
  if (!template) return null
  return createTemplate({
    name: `${template.name} (Copy)`,
    subject: template.subject,
    body: template.body,
    category: template.category,
  })
}

/**
 * Render a template by replacing {{variables}} with values.
 */
export function renderTemplate(templateId, values = {}) {
  const template = typeof templateId === 'string' ? getTemplateById(templateId) : templateId
  if (!template) return { subject: '', body: '' }

  const replace = (text) => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return values[key] !== undefined ? values[key] : match
    })
  }

  return {
    subject: replace(template.subject),
    body: replace(template.body),
    unresolvedVars: template.variables.filter(v => values[v] === undefined),
  }
}

/**
 * Extract {{variable}} names from template text.
 */
export function extractVariables(text) {
  const matches = text.match(/\{\{(\w+)\}\}/g) || []
  return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))]
}

export const TEMPLATE_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'sales', label: 'Sales' },
  { value: 'crm', label: 'CRM' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'hr', label: 'HR' },
  { value: 'support', label: 'Support' },
]
