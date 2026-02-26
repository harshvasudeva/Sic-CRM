/**
 * C10: Image Optimization Service
 * Converts uploaded images to WebP format and provides optimized srcsets.
 * Uses canvas API for client-side compression.
 */

const QUALITY_PRESETS = {
  thumbnail: { maxWidth: 150, maxHeight: 150, quality: 0.7 },
  card: { maxWidth: 400, maxHeight: 400, quality: 0.8 },
  display: { maxWidth: 800, maxHeight: 800, quality: 0.85 },
  full: { maxWidth: 1920, maxHeight: 1920, quality: 0.9 }
}

/**
 * Compress an image file to WebP format
 * @param {File} file - The image File object
 * @param {object} opts - { maxWidth, maxHeight, quality }
 * @returns {Promise<Blob>} - Compressed WebP blob
 */
export async function compressImage(file, opts = {}) {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.85 } = opts

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img

      // Scale down if exceeds max dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Try WebP first, fallback to JPEG
      const format = supportsWebP() ? 'image/webp' : 'image/jpeg'
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Compression failed')),
        format,
        quality
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

/**
 * Generate multiple size variants for responsive images
 */
export async function generateSrcSet(file) {
  const variants = {}
  for (const [key, preset] of Object.entries(QUALITY_PRESETS)) {
    try {
      const blob = await compressImage(file, preset)
      variants[key] = {
        blob,
        url: URL.createObjectURL(blob),
        size: blob.size,
        width: preset.maxWidth
      }
    } catch {
      // Skip failed variants
    }
  }
  return variants
}

/**
 * Check WebP support
 */
let _webpSupport = null
export function supportsWebP() {
  if (_webpSupport !== null) return _webpSupport
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  _webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  return _webpSupport
}

/**
 * Calculate compression savings
 */
export function compressionStats(original, compressed) {
  const savings = original.size - compressed.size
  const percentage = ((savings / original.size) * 100).toFixed(1)
  return {
    originalSize: original.size,
    compressedSize: compressed.size,
    savings,
    percentage: `${percentage}%`
  }
}

/**
 * Optimized Image component helper - generates picture element attributes
 */
export function getOptimizedImageProps(src, alt, sizes = '100vw') {
  if (!src) return { src: '', alt }
  // If already a data URL or blob URL, return as-is
  if (src.startsWith('data:') || src.startsWith('blob:')) return { src, alt }

  return {
    src,
    alt,
    loading: 'lazy',
    decoding: 'async',
    sizes
  }
}
