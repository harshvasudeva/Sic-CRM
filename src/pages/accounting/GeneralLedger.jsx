import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DataTable from '../../components/DataTable'
import FormSelect from '../../components/FormInput'
import { getJournalEntries, getChartOfAccounts } from '../../stores/accountingStore'

function GeneralLedger() {
    const [entries, setEntries] = useState([])
    const [filteredEntries, setFilteredEntries] = useState([])
    const [selectedAccount, setSelectedAccount] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        const allEntries = getJournalEntries()
        setEntries(allEntries)
        setFilteredEntries(allEntries)
    }

    useEffect(() => {
        if (selectedAccount) {
            setFilteredEntries(entries.filter(e => e.debitAccountId === selectedAccount || e.creditAccountId === selectedAccount))
        } else {
            setFilteredEntries(entries)
        }
    }, [selectedAccount, entries])

    const calculateBalance = () => {
        let debit = 0
        let credit = 0
        filteredEntries.forEach(entry => {
            if (entry.debitAccountId === selectedAccount) debit += entry.amount
            if (entry.creditAccountId === selectedAccount) credit += entry.amount
        })
        return { debit, credit, balance: debit - credit }
    }

    const balance = selectedAccount ? calculateBalance() : { debit: 0, credit: 0, balance: 0 }

    const columns = [
        { key: 'entryNumber', label: 'Entry #', render: (v) => <span className="entry-number">{v}</span> },
        { key: 'entryDate', label: 'Date', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'reference', label: 'Reference', render: (v) => <span className="reference">{v}</span> },
        { key: 'description', label: 'Description' },
        { key: 'debitAccountId', label: 'Debit Account', render: (v) => {
            const account = getChartOfAccounts().find(a => a.id === v)
            return account ? `${account.code}` : '-'
        }},
        { key: 'debit', label: 'Debit', render: (_, row) => row.debitAccountId === selectedAccount ? <span className="debit">${row.amount.toLocaleString()}</span> : '-' },
        { key: 'creditAccountId', label: 'Credit Account', render: (v) => {
            const account = getChartOfAccounts().find(a => a.id === v)
            return account ? `${account.code}` : '-'
        }},
        { key: 'credit', label: 'Credit', render: (_, row) => row.creditAccountId === selectedAccount ? <span className="credit">${row.amount.toLocaleString()}</span> : '-' },
        { key: 'balance', label: 'Balance', render: (_, row, index) => {
            let runningBalance = 0
            for (let i = 0; i <= index; i++) {
                const entry = filteredEntries[i]
                if (entry.debitAccountId === selectedAccount) runningBalance += entry.amount
                if (entry.creditAccountId === selectedAccount) runningBalance -= entry.amount
            }
            return <span className={`balance ${runningBalance >= 0 ? 'positive' : 'negative'}`}>${runningBalance.toLocaleString()}</span>
        }}
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">General</span> Ledger</h1>
                    <p className="page-description">
                        View all journal entries organized by account.
                    </p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="filter-bar">
                    <FormSelect 
                        label="Select Account" 
                        options={[
                            { value: '', label: 'All Accounts' },
                            ...getChartOfAccounts().map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))
                        ]} 
                        value={selectedAccount} 
                        onChange={(e) => setSelectedAccount(e.target.value)}
                    />
                    {selectedAccount && (
                        <div className="account-summary">
                            <div className="summary-item">
                                <span>Total Debits:</span>
                                <span className="debit">${balance.debit.toLocaleString()}</span>
                            </div>
                            <div className="summary-item">
                                <span>Total Credits:</span>
                                <span className="credit">${balance.credit.toLocaleString()}</span>
                            </div>
                            <div className="summary-item total">
                                <span>Balance:</span>
                                <span className={`balance ${balance.balance >= 0 ? 'positive' : 'negative'}`}>${balance.balance.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </div>

                <DataTable columns={columns} data={filteredEntries} searchable exportable />
            </motion.div>

            <style>{`
                .filter-bar { display: flex; gap: 24px; align-items: flex-start; margin-bottom: 24px; padding: 20px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
                .account-summary { flex: 1; display: flex; gap: 24px; padding: 16px 24px; background: var(--bg-tertiary); border-radius: 12px; }
                .summary-item { display: flex; flex-direction: column; gap: 4px; }
                .summary-item span:first-child { font-size: 0.8rem; color: var(--text-muted); }
                .summary-item span:last-child { font-size: 1.1rem; font-weight: 600; }
                .summary-item.total { padding-left: 24px; border-left: 1px solid var(--border-color); }
                .entry-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .reference { font-family: 'JetBrains Mono', monospace; font-weight: 500; color: var(--text-secondary); }
                .debit { font-weight: 600; color: var(--success); }
                .credit { font-weight: 600; color: var(--error); }
                .balance { font-weight: 700; }
                .balance.positive { color: var(--success); }
                .balance.negative { color: var(--error); }
            `}</style>
        </div>
    )
}

export default GeneralLedger