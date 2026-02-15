// Content Compliance Checker - flags posts that violate brand guidelines

const PROFANITY_WORDS = [
    'damn', 'hell', 'crap', 'stupid', 'idiot', 'suck', 'wtf', 'stfu', 'lmao',
    'ass', 'shit', 'fuck', 'bitch', 'bastard', 'dick', 'piss',
]

const DEFAULT_COMPETITORS = {
    'Nykaa': ['Purplle', 'Myntra Beauty', 'Sephora', 'Tira'],
    'OnePlus': ['Samsung', 'Apple', 'iPhone', 'Pixel', 'Xiaomi', 'Realme', 'Vivo', 'Oppo'],
    'Swiggy': ['Zomato', 'Uber Eats', 'Dunzo'],
    'Cred': ['Paytm', 'PhonePe', 'GooglePay', 'GPay'],
    'Boat': ['JBL', 'Sony', 'Bose', 'Noise', 'Realme'],
    'Mamaearth': ['WOW', 'Plum', 'mCaffeine', 'The Derma Co'],
    'Zepto': ['Blinkit', 'Swiggy Instamart', 'BigBasket', 'JioMart'],
}

export function hasProfanity(text) {
    if (!text) return false
    const lower = text.toLowerCase()
    return PROFANITY_WORDS.some(w => {
        const regex = new RegExp(`\\b${w}\\b`, 'i')
        return regex.test(lower)
    })
}

export function getProfanityMatches(text) {
    if (!text) return []
    const lower = text.toLowerCase()
    return PROFANITY_WORDS.filter(w => {
        const regex = new RegExp(`\\b${w}\\b`, 'i')
        return regex.test(lower)
    })
}

export function hasCompetitorMention(text, brandName) {
    if (!text || !brandName) return false
    const competitors = DEFAULT_COMPETITORS[brandName] || []
    const lower = text.toLowerCase()
    return competitors.some(c => lower.includes(c.toLowerCase()))
}

export function getCompetitorMatches(text, brandName) {
    if (!text || !brandName) return []
    const competitors = DEFAULT_COMPETITORS[brandName] || []
    const lower = text.toLowerCase()
    return competitors.filter(c => lower.includes(c.toLowerCase()))
}

export function hasDuplicateHashtags(text) {
    if (!text) return false
    const hashtags = text.match(/#\w+/g) || []
    const lower = hashtags.map(h => h.toLowerCase())
    return new Set(lower).size < lower.length
}

export function getDuplicateHashtags(text) {
    if (!text) return []
    const hashtags = text.match(/#\w+/g) || []
    const lower = hashtags.map(h => h.toLowerCase())
    const seen = new Set()
    const dupes = new Set()
    lower.forEach(h => { if (seen.has(h)) dupes.add(h); seen.add(h) })
    return Array.from(dupes)
}

export function hasMissingDisclosure(text) {
    if (!text) return true
    const lower = text.toLowerCase()
    return !lower.includes('#ad') && !lower.includes('#sponsored') && !lower.includes('#paidpartnership') && !lower.includes('#collab')
}

export function hasExcessiveHashtags(text, max = 30) {
    if (!text) return false
    const hashtags = text.match(/#\w+/g) || []
    return hashtags.length > max
}

export function checkContentCompliance(post, brandName = '') {
    const fullText = `${post.caption || ''} ${post.hashtags || ''} ${post.notes || ''}`
    const issues = []

    // Profanity check
    const profanity = getProfanityMatches(fullText)
    if (profanity.length) {
        issues.push({ type: 'PROFANITY', severity: 'high', message: `Flagged words: ${profanity.join(', ')}`, icon: '🚫' })
    }

    // Competitor mention check
    const competitors = getCompetitorMatches(fullText, brandName)
    if (competitors.length) {
        issues.push({ type: 'COMPETITOR', severity: 'high', message: `Competitor mentions: ${competitors.join(', ')}`, icon: '⚠️' })
    }

    // Duplicate hashtags
    const dupeHashtags = getDuplicateHashtags(post.hashtags || '')
    if (dupeHashtags.length) {
        issues.push({ type: 'DUPLICATE_HASHTAG', severity: 'low', message: `Duplicate hashtags: ${dupeHashtags.join(', ')}`, icon: '🔄' })
    }

    // Missing disclosure
    if (hasMissingDisclosure(fullText)) {
        issues.push({ type: 'MISSING_DISCLOSURE', severity: 'medium', message: 'Missing #ad or #sponsored disclosure (FTC/ASCI)', icon: '📋' })
    }

    // Excessive hashtags
    if (hasExcessiveHashtags(post.hashtags || '')) {
        issues.push({ type: 'EXCESSIVE_HASHTAGS', severity: 'low', message: 'More than 30 hashtags (may reduce reach)', icon: '📊' })
    }

    // Empty caption
    if (!post.caption || post.caption.trim().length < 10) {
        issues.push({ type: 'SHORT_CAPTION', severity: 'low', message: 'Caption is too short or missing', icon: '📝' })
    }

    return {
        passed: issues.filter(i => i.severity === 'high').length === 0,
        score: Math.max(0, 100 - issues.reduce((s, i) => s + ({ high: 30, medium: 15, low: 5 }[i.severity] || 0), 0)),
        issues,
        totalIssues: issues.length,
        highSeverity: issues.filter(i => i.severity === 'high').length,
        mediumSeverity: issues.filter(i => i.severity === 'medium').length,
        lowSeverity: issues.filter(i => i.severity === 'low').length,
    }
}

export function getAvailableCompetitorBrands() {
    return Object.keys(DEFAULT_COMPETITORS)
}
