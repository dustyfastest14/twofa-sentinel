/**
 * Base32 decoder for TOTP secrets
 * RFC 4648 compliant
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

/**
 * Decode a base32 encoded string to Uint8Array
 * @param {string} input - Base32 encoded string
 * @returns {Uint8Array} - Decoded bytes
 */
export function decode(input) {
  // Normalize: uppercase and remove padding/spaces
  const normalized = input.toUpperCase().replace(/[=\s]/g, '')
  
  if (normalized.length === 0) {
    return new Uint8Array(0)
  }

  // Validate characters
  for (const char of normalized) {
    if (!ALPHABET.includes(char)) {
      throw new Error(`Invalid base32 character: ${char}`)
    }
  }

  // Each base32 char represents 5 bits
  // 8 chars = 40 bits = 5 bytes
  const outputLength = Math.floor((normalized.length * 5) / 8)
  const output = new Uint8Array(outputLength)

  let buffer = 0
  let bitsInBuffer = 0
  let outputIndex = 0

  for (const char of normalized) {
    const value = ALPHABET.indexOf(char)
    buffer = (buffer << 5) | value
    bitsInBuffer += 5

    if (bitsInBuffer >= 8) {
      bitsInBuffer -= 8
      output[outputIndex++] = (buffer >> bitsInBuffer) & 0xff
    }
  }

  return output
}

