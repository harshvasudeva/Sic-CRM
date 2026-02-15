/**
 * Payroll Tax Rules Store - manage Indian payroll tax calculations.
 * Supports: PF, ESI, Professional Tax, TDS (Income Tax).
 */

const STORAGE_KEY = 'sic_crm_payroll_tax'

const DEFAULT_RULES = {
  pf: {
    enabled: true,
    name: 'Provident Fund (PF)',
    employeeRate: 12,
    employerRate: 12,
    wageLimit: 15000,
    description: '12% of basic salary (up to Rs 15,000)',
  },
  esi: {
    enabled: true,
    name: 'ESI',
    employeeRate: 0.75,
    employerRate: 3.25,
    wageLimit: 21000,
    description: 'Applicable if gross salary <= Rs 21,000/month',
  },
  professionalTax: {
    enabled: true,
    name: 'Professional Tax',
    slabs: [
      { from: 0, to: 10000, tax: 0 },
      { from: 10001, to: 15000, tax: 150 },
      { from: 15001, to: Infinity, tax: 200 },
    ],
    maxAnnual: 2500,
    description: 'State-level professional tax',
  },
  tds: {
    enabled: true,
    name: 'TDS (Income Tax)',
    regime: 'new',
    oldRegimeSlabs: [
      { from: 0, to: 250000, rate: 0 },
      { from: 250001, to: 500000, rate: 5 },
      { from: 500001, to: 1000000, rate: 20 },
      { from: 1000001, to: Infinity, rate: 30 },
    ],
    newRegimeSlabs: [
      { from: 0, to: 300000, rate: 0 },
      { from: 300001, to: 700000, rate: 5 },
      { from: 700001, to: 1000000, rate: 10 },
      { from: 1000001, to: 1200000, rate: 15 },
      { from: 1200001, to: 1500000, rate: 20 },
      { from: 1500001, to: Infinity, rate: 30 },
    ],
    standardDeduction: 75000,
    surchargeThreshold: 5000000,
    surchargeRate: 10,
    cess: 4,
  },
}

function getStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RULES))
    return DEFAULT_RULES
  } catch {
    return DEFAULT_RULES
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Calculate full payroll deductions for an employee.
 */
export function calculatePayroll(employee) {
  const rules = getStore()
  const basic = employee.basicSalary || employee.salary * 0.5 || 0
  const gross = employee.grossSalary || employee.salary || 0
  const annual = gross * 12

  const deductions = {}
  let totalDeductions = 0

  // PF
  if (rules.pf.enabled) {
    const pfWage = Math.min(basic, rules.pf.wageLimit)
    deductions.pf = {
      employee: Math.round(pfWage * rules.pf.employeeRate / 100),
      employer: Math.round(pfWage * rules.pf.employerRate / 100),
    }
    totalDeductions += deductions.pf.employee
  }

  // ESI
  if (rules.esi.enabled && gross <= rules.esi.wageLimit) {
    deductions.esi = {
      employee: Math.round(gross * rules.esi.employeeRate / 100),
      employer: Math.round(gross * rules.esi.employerRate / 100),
    }
    totalDeductions += deductions.esi.employee
  }

  // Professional Tax
  if (rules.professionalTax.enabled) {
    const ptSlab = rules.professionalTax.slabs.find(s => gross >= s.from && gross <= s.to)
    deductions.professionalTax = ptSlab ? ptSlab.tax : 0
    totalDeductions += deductions.professionalTax
  }

  // TDS
  if (rules.tds.enabled) {
    const slabs = rules.tds.regime === 'new' ? rules.tds.newRegimeSlabs : rules.tds.oldRegimeSlabs
    const taxableIncome = Math.max(0, annual - rules.tds.standardDeduction)
    let annualTax = 0

    for (const slab of slabs) {
      if (taxableIncome > slab.from) {
        const taxable = Math.min(taxableIncome, slab.to || Infinity) - slab.from
        annualTax += taxable * (slab.rate / 100)
      }
    }

    // Cess
    annualTax *= (1 + rules.tds.cess / 100)

    deductions.tds = Math.round(annualTax / 12)
    totalDeductions += deductions.tds
  }

  return {
    gross,
    basic,
    deductions,
    totalDeductions,
    netSalary: gross - totalDeductions,
    ctc: gross + (deductions.pf?.employer || 0) + (deductions.esi?.employer || 0),
  }
}

export function getTaxRules() {
  return getStore()
}

export function updateTaxRules(updates) {
  const store = getStore()
  const updated = { ...store, ...updates }
  save(updated)
  return updated
}

export function setTaxRegime(regime) {
  const store = getStore()
  store.tds.regime = regime
  save(store)
}
