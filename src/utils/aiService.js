import { getSettings } from '../stores/settingsStore'

// Helper to simulate a delay or timeout
const timeoutPromise = (ms, promise) => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error("AI Request Timeout"))
        }, ms)
        promise.then(
            (res) => {
                clearTimeout(timeoutId)
                resolve(res)
            },
            (err) => {
                clearTimeout(timeoutId)
                reject(err)
            }
        )
    })
}

export async function analyzeTransactionsAI(transactions) {
    const config = getSettings().aiConfig
    if (!config || !config.enabled) return []

    // 1. Prepare Prompt
    const prompt = `
        You are an accounting auditor. Analyze these transaction summaries for anomalies (duplicates, outliers, unusual times, suspicion).
        Respond ONLY with a JSON array of objects: [{ "id": "transaction_id", "reason": "short explanation", "severity": "high/medium/low" }].
        If no anomalies, return [].

        Transactions:
        ${JSON.stringify(transactions.slice(0, 10).map(t => ({
        id: t.id,
        date: t.date || t.entryDate,
        amount: t.totalAmount || t.balance,
        desc: t.name || t.description || 'N/A'
    })))}
    `

    try {
        let responseText = ''

        if (config.provider === 'ollama') {
            const res = await timeoutPromise(5000, fetch(`${config.endpoint}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: config.model || 'llama3',
                    prompt: prompt,
                    stream: false,
                    format: 'json'
                })
            }))

            if (!res.ok) throw new Error('Ollama connection failed')
            const data = await res.json()
            responseText = data.response

        } else if (config.provider === 'openai' && config.apiKey) {
            // Placeholder for OpenAI Implementation
            // const res = await fetch('https://api.openai.com/v1/chat/completions', ...)
            throw new Error('OpenAI not yet fully implemented')
        } else {
            throw new Error('Invalid AI Provider or Missing Key')
        }

        // Parse Response
        try {
            return JSON.parse(responseText)
        } catch (e) {
            console.warn('AI Response Parsing Failed', responseText)
            return []
        }

    } catch (error) {
        console.warn('AI Service Failed:', error.message)
        return [] // Fail gracefully
    }
}

export function detectAnomaliesRuleBased(transactions) {
    const anomalies = []
    const seenAmounts = {}

    transactions.forEach(t => {
        const amount = t.amount || t.totalAmount || t.balance || 0
        const date = t.date || t.entryDate
        const id = t.id

        // Rule 1: Duplicate Amounts on Same Day
        const key = `${amount}-${date}`
        if (seenAmounts[key]) {
            anomalies.push({
                id,
                reason: `Potential duplicate: Matches amount ${amount} on ${date}`,
                severity: 'medium'
            })
        }
        seenAmounts[key] = true

        // Rule 2: High Value Outliers (Simplified threshold)
        if (amount > 100000) {
            anomalies.push({
                id,
                reason: `High value transaction: ${amount}`,
                severity: 'low' // Just a warning
            })
        }

        // Rule 3: Weekend Transaction
        if (date) {
            const day = new Date(date).getDay()
            if (day === 0 || day === 6) {
                anomalies.push({
                    id,
                    reason: `Weekend transaction detected`,
                    severity: 'low'
                })
            }
        }
    })

    return anomalies
}
