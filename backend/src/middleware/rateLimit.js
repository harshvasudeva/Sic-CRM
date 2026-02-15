/**
 * Simple in-memory rate limiter middleware.
 * For production, replace with Redis-backed rate limiting.
 */

const requestCounts = new Map()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of requestCounts) {
    if (now - data.windowStart > 60000) {
      requestCounts.delete(key)
    }
  }
}, 5 * 60 * 1000)

function rateLimit(options = {}) {
  const {
    windowMs = 60 * 1000,   // 1 minute window
    max = 100,               // max requests per window
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
  } = options

  return (req, res, next) => {
    const key = keyGenerator(req)
    const now = Date.now()

    if (!requestCounts.has(key)) {
      requestCounts.set(key, { count: 1, windowStart: now })
      return next()
    }

    const data = requestCounts.get(key)

    // Reset window if expired
    if (now - data.windowStart > windowMs) {
      requestCounts.set(key, { count: 1, windowStart: now })
      return next()
    }

    data.count++

    if (data.count > max) {
      const retryAfter = Math.ceil((data.windowStart + windowMs - now) / 1000)
      res.set('Retry-After', retryAfter)
      return res.status(429).json({
        error: message,
        retryAfter,
      })
    }

    next()
  }
}

// Presets
const apiLimiter = rateLimit({ windowMs: 60000, max: 100 })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts.' })
const strictLimiter = rateLimit({ windowMs: 60000, max: 20 })

module.exports = { rateLimit, apiLimiter, authLimiter, strictLimiter }
