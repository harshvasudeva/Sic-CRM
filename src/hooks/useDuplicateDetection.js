import { useMemo, useCallback } from 'react'

/**
 * Hook for detecting duplicate records based on field matching.
 *
 * @param {Array} existingRecords - Array of existing records to check against
 * @param {Array} matchFields - Fields to check for duplicates, e.g. ['email', 'phone', 'name']
 * @param {Object} options - { threshold: 0.8 } for fuzzy matching sensitivity
 */
export function useDuplicateDetection(existingRecords = [], matchFields = [], options = {}) {
    const { threshold = 0.8 } = options

    // Simple string similarity (Dice coefficient)
    const similarity = useCallback((s1, s2) => {
        if (!s1 || !s2) return 0
        s1 = s1.toLowerCase().trim()
        s2 = s2.toLowerCase().trim()
        if (s1 === s2) return 1

        const bigrams1 = new Set()
        for (let i = 0; i < s1.length - 1; i++) bigrams1.add(s1.substring(i, i + 2))
        const bigrams2 = new Set()
        for (let i = 0; i < s2.length - 1; i++) bigrams2.add(s2.substring(i, i + 2))

        let intersection = 0
        for (const bg of bigrams1) if (bigrams2.has(bg)) intersection++
        return (2 * intersection) / (bigrams1.size + bigrams2.size)
    }, [])

    const checkDuplicates = useCallback((newRecord) => {
        const duplicates = []

        for (const existing of existingRecords) {
            for (const field of matchFields) {
                const newVal = String(newRecord[field] || '')
                const existingVal = String(existing[field] || '')

                if (!newVal || !existingVal) continue

                // Exact match
                if (newVal.toLowerCase().trim() === existingVal.toLowerCase().trim()) {
                    duplicates.push({
                        record: existing,
                        field,
                        matchType: 'exact',
                        similarity: 1,
                        message: `This ${field} already exists on ${existing.name || existing.title || `record #${existing.id}`}`
                    })
                    break
                }

                // Fuzzy match
                const sim = similarity(newVal, existingVal)
                if (sim >= threshold) {
                    duplicates.push({
                        record: existing,
                        field,
                        matchType: 'similar',
                        similarity: sim,
                        message: `Similar ${field} found on ${existing.name || existing.title || `record #${existing.id}`} (${Math.round(sim * 100)}% match)`
                    })
                }
            }
        }

        return duplicates
    }, [existingRecords, matchFields, threshold, similarity])

    return { checkDuplicates }
}
