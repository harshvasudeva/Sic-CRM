/**
 * Barcode / QR Code Generator Utility
 * Generates simple Code128 barcodes and QR-like identifiers as SVG.
 */

// Code128 encoding for digits and ASCII
const CODE128_START = 104 // Start Code B
const CODE128_STOP = 106

// Simplified Code128B patterns (bars/spaces)
const CODE128_PATTERNS = [
  '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
  '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
  '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
  '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
  '11001001110', '11011100100', '11001110100', '11101101110', '11101001100',
  '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
  '11011011000', '11011000110', '11000110110', '10100011000', '10001011000',
  '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
  '11000101000', '11000100010', '10110111000', '10110001110', '10001101110',
  '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
  '11000101110', '11011101000', '11011100010', '11011101110', '11101011000',
  '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
  '11101111010', '11001000010', '11110001010', '10100110000', '10100001100',
  '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
  '10110000100', '10011010000', '10011000010', '10000110100', '10000110010',
  '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
  '10100111100', '10010111100', '10010011110', '10111100100', '10011110100',
  '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
  '11011110110', '11110110110', '10101111000', '10100011110', '10001011110',
  '10111101000', '10111100010', '11110101000', '11110100010', '10111011110',
  '10111101110', '11101011110', '11110101110', '11010000100', '11010010000',
  '11010011100', '1100011101011',
]

/**
 * Generate barcode SVG string for a given value.
 */
export function generateBarcodeSVG(value, options = {}) {
  const { width = 200, height = 60, showText = true } = options
  const text = String(value)

  // Encode
  let checksum = CODE128_START
  let pattern = CODE128_PATTERNS[CODE128_START] || ''

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32
    if (code >= 0 && code < CODE128_PATTERNS.length) {
      pattern += CODE128_PATTERNS[code]
      checksum += code * (i + 1)
    }
  }

  // Checksum
  pattern += CODE128_PATTERNS[checksum % 103] || ''
  // Stop
  pattern += CODE128_PATTERNS[CODE128_STOP] || ''

  // Generate SVG
  const barWidth = width / pattern.length
  let bars = ''
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '1') {
      bars += `<rect x="${i * barWidth}" y="0" width="${barWidth}" height="${showText ? height - 16 : height}" fill="currentColor"/>`
    }
  }

  const textEl = showText
    ? `<text x="${width / 2}" y="${height - 2}" text-anchor="middle" font-family="monospace" font-size="11" fill="currentColor">${text}</text>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${bars}${textEl}</svg>`
}

/**
 * Generate a product SKU barcode ID.
 */
export function generateSKU(prefix = 'SKU', sequence = 1) {
  const padded = String(sequence).padStart(6, '0')
  return `${prefix}-${padded}`
}

/**
 * Generate a batch of barcodes.
 */
export function generateBatch(prefix, startNum, count, options) {
  const barcodes = []
  for (let i = 0; i < count; i++) {
    const sku = generateSKU(prefix, startNum + i)
    barcodes.push({
      sku,
      svg: generateBarcodeSVG(sku, options),
    })
  }
  return barcodes
}

/**
 * Print barcodes (opens print dialog with barcode grid).
 */
export function printBarcodes(barcodes, title = 'Barcodes') {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: sans-serif; margin: 0; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .barcode { text-align: center; padding: 12px; border: 1px solid #ddd; border-radius: 4px; }
        .barcode svg { max-width: 100%; }
        @media print { body { padding: 10px; } .barcode { border: 1px solid #ccc; page-break-inside: avoid; } }
      </style>
    </head>
    <body>
      <h2 style="margin-bottom:16px">${title}</h2>
      <div class="grid">
        ${barcodes.map(b => `<div class="barcode">${b.svg}<div style="font-size:10px;margin-top:4px">${b.sku}</div></div>`).join('')}
      </div>
    </body>
    </html>
  `
  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
  setTimeout(() => win.print(), 500)
}
