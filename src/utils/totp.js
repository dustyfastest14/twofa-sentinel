/**
 * TOTP (Time-based One-Time Password) generator
 * Uses Web Crypto API for HMAC - works fully offline
 */

import { decode as base32Decode } from './base32.js'

/**
 * Get the algorithm name for Web Crypto API
 */
function getHashAlgorithm(algo) {
  const algorithms = {
    'SHA-1': 'SHA-1',
    'SHA-256': 'SHA-256',
    'SHA-512': 'SHA-512'
  }
  return algorithms[algo] || 'SHA-1'
}

/**
 * Convert a number to an 8-byte big-endian buffer
 */
function intToBytes(num) {
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  // JavaScript numbers are 64-bit floats, but we need integer bytes
  // For TOTP, the counter fits in 32 bits for the foreseeable future
  view.setUint32(0, 0, false) // High 32 bits (0 for now)
  view.setUint32(4, num, false) // Low 32 bits
  return new Uint8Array(buffer)
}

/**
 * Generate HMAC using Web Crypto API
 */
async function hmac(algorithm, key, message) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message)
  return new Uint8Array(signature)
}

/**
 * Dynamic truncation as per RFC 4226
 */
function dynamicTruncate(hmacResult, digits) {
  // Get offset from last nibble
  const offset = hmacResult[hmacResult.length - 1] & 0x0f
  
  // Extract 4 bytes starting at offset
  const binary =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff)
  
  // Generate OTP with specified digits
  const otp = binary % Math.pow(10, digits)
  
  // Pad with leading zeros if necessary
  return otp.toString().padStart(digits, '0')
}

/**
 * Generate a TOTP code
 * @param {Object} options - Token configuration
 * @param {string} options.secret - Base32 encoded secret
 * @param {string} options.algorithm - Hash algorithm (SHA-1, SHA-256, SHA-512)
 * @param {number} options.digits - Number of digits (6 or 8)
 * @param {number} options.period - Time step in seconds (usually 30)
 * @param {number} [timestamp] - Optional timestamp (defaults to now)
 * @returns {Promise<string>} - The TOTP code
 */
export async function generateTOTP({ secret, algorithm = 'SHA-1', digits = 6, period = 30 }, timestamp = null) {
  // Decode the base32 secret
  const key = base32Decode(secret)
  
  // Calculate time counter
  const time = timestamp || Math.floor(Date.now() / 1000)
  const counter = Math.floor(time / period)
  
  // Convert counter to bytes
  const counterBytes = intToBytes(counter)
  
  // Generate HMAC
  const hashAlgo = getHashAlgorithm(algorithm)
  const hmacResult = await hmac(hashAlgo, key, counterBytes)
  
  // Truncate and return OTP
  return dynamicTruncate(hmacResult, digits)
}

/**
 * Get remaining seconds until next code change
 * @param {number} period - Time step in seconds
 * @returns {number} - Seconds remaining
 */
export function getRemainingSeconds(period = 30) {
  const now = Math.floor(Date.now() / 1000)
  return period - (now % period)
}

/**
 * Get the current time step
 * @param {number} period - Time step in seconds
 * @returns {number} - Current time step
 */
export function getCurrentTimeStep(period = 30) {
  return Math.floor(Date.now() / 1000 / period)
}

