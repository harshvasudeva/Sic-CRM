import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Printer, Search, Settings } from 'lucide-react'
import DataTable from '../../components/DataTable'
import FormInput, { FormSelect } from '../../components/FormInput'
import { getExpenses, getBankAccounts } from '../../stores/accountingStore'
import { formatCurrency } from '../../stores/settingsStore'

function ChequePrinting() {
    const [payments, setPayments] = useState([])
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [bankAccounts, setBankAccounts] = useState([])
    const [selectedBank, setSelectedBank] = useState('')

    useEffect(() => {
        setBankAccounts(getBankAccounts())
        loadPayments()
    }, [])

    const loadPayments = () => {
        // Filter expenses that are paid and potentially need a cheque (simplified filter)
        // In real app, check payment mode = 'Cheque'
        const data = getExpenses({ status: 'paid' })
        setPayments(data)
    }

    const handlePrint = () => {
        window.print()
    }

    const columns = [
        { key: 'date', label: 'Date' },
        { key: 'payee', label: 'Payee', render: (_, r) => r.vendorId || r.description }, // Simplified payee
        { key: 'totalAmount', label: 'Amount', render: (v) => formatCurrency(v) },
        {
            key: 'action',
            label: 'Action',
            render: (_, row) => (
                <button className="btn-secondary btn-sm" onClick={() => setSelectedPayment(row)}>Select</button>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header no-print" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Cheque</span> Printing</h1>
                    <p className="page-description">Generate printable cheques for payments.</p>
                </div>
            </motion.div>

            <div className="layout-grid">
                <div className="list-section no-print">
                    <div className="filters">
                        <FormSelect label="Bank Account" value={selectedBank} onChange={e => setSelectedBank(e.target.value)} options={bankAccounts.map(b => ({ value: b.id, label: `${b.bankName} - ${b.accountNumber}` }))} />
                    </div>
                    <DataTable columns={columns} data={payments} />
                </div>

                <div className="preview-section">
                    {selectedPayment ? (
                        <div className="cheque-preview">
                            <div className="cheque-border">
                                <div className="cheque-header">
                                    <div className="bank-info">
                                        <h3>{bankAccounts.find(b => b.id === selectedBank)?.bankName || 'Bank Name'}</h3>
                                        <p>Branch Address, City, State</p>
                                    </div>
                                    <div className="date-box">
                                        <span>{selectedPayment.date.split('-').reverse().join('')}</span>
                                    </div>
                                </div>
                                <div className="cheque-body">
                                    <div className="row">
                                        <span>Pay</span>
                                        <div className="line payee">{selectedPayment.vendorId || selectedPayment.description}</div>
                                        <span>Or Bearer</span>
                                    </div>
                                    <div className="row">
                                        <span>Rupees</span>
                                        <div className="line words">
                                            {/* Simplified number to words placeholder */}
                                            {formatCurrency(selectedPayment.totalAmount)} ONLY
                                        </div>
                                    </div>
                                    <div className="row amount-row">
                                        <div className="box amount">
                                            ₹ {selectedPayment.totalAmount}
                                        </div>
                                    </div>
                                    <div className="row signature-row">
                                        <div className="signature-box">
                                            Authorised Signatory
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="preview-actions no-print">
                                <button className="btn-primary" onClick={handlePrint}>
                                    <Printer size={16} /> Print Cheque
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Select a payment to preview cheque</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .layout-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px; }
                .list-section { background: var(--bg-card); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); }
                .preview-section { background: #f0f0f0; padding: 24px; border-radius: 8px; display: flex; justify-content: center; align-items: center; min-height: 400px; }
                
                .cheque-preview { width: 100%; max-width: 700px; }
                .cheque-border { background: white; border: 1px solid #ccc; padding: 20px; height: 350px; position: relative; font-family: 'Courier New', monospace; color: black; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                
                .cheque-header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                .bank-info h3 { margin: 0; font-size: 1.2rem; font-weight: bold; }
                .date-box { border: 1px solid #333; padding: 4px 8px; letter-spacing: 4px; font-weight: bold; }
                
                .cheque-body { display: flex; flex-direction: column; gap: 20px; }
                .row { display: flex; align-items: baseline; gap: 10px; font-size: 1rem; }
                .line { border-bottom: 1px solid #333; flex-grow: 1; padding: 0 10px; }
                .line.payee { font-weight: bold; }
                .amount-row { justify-content: flex-end; margin-top: 20px; }
                .box.amount { border: 2px solid #333; padding: 8px 16px; font-weight: bold; font-size: 1.2rem; background: linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee), linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee); background-size: 10px 10px; background-position: 0 0, 5px 5px; }
                
                .signature-row { justify-content: flex-end; margin-top: 40px; }
                .signature-box { border-top: 1px solid #333; padding-top: 4px; text-align: center; width: 200px; font-size: 0.8rem; }
                
                .preview-actions { margin-top: 20px; text-align: center; }
                .empty-state { color: #666; font-style: italic; }
                
                @media print {
                    .no-print { display: none !important; }
                    .page { padding: 0; margin: 0; }
                    .layout-grid { display: block; }
                    .preview-section { background: white; padding: 0; border: none; }
                    .cheque-border { border: none; box-shadow: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
                }

                /* Dark mode overrides for preview */
                [data-theme='dark'] .cheque-border { background: #fff; color: #000; }
            `}</style>
        </div>
    )
}

export default ChequePrinting
