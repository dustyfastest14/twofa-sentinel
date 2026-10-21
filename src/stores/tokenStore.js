import { defineStore } from 'pinia'

const STORAGE_KEY = 'totp-tokens'

export const useTokenStore = defineStore('tokens', {
  state: () => ({
    tokens: []
  }),

  getters: {
    tokenCount: (state) => state.tokens.length,
    getTokenById: (state) => (id) => state.tokens.find(t => t.id === id)
  },

  actions: {
    /**
     * Load tokens from localStorage
     */
    loadFromStorage() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          this.tokens = JSON.parse(stored)
        }
      } catch (e) {
        console.error('Failed to load tokens from storage:', e)
        this.tokens = []
      }
    },

    /**
     * Save tokens to localStorage
     */
    saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tokens))
      } catch (e) {
        console.error('Failed to save tokens to storage:', e)
      }
    },

    /**
     * Add a new token
     */
    addToken(token) {
      const newToken = {
        id: crypto.randomUUID(),
        name: token.name || 'Unnamed',
        secret: token.secret.replace(/\s/g, '').toUpperCase(),
        algorithm: token.algorithm || 'SHA-1',
        digits: token.digits || 6,
        period: token.period || 30,
        createdAt: Date.now()
      }
      this.tokens.push(newToken)
      this.saveToStorage()
      return newToken
    },

    /**
     * Update an existing token
     */
    updateToken(id, updates) {
      const index = this.tokens.findIndex(t => t.id === id)
      if (index !== -1) {
        // Normalize secret if provided
        if (updates.secret) {
          updates.secret = updates.secret.replace(/\s/g, '').toUpperCase()
        }
        this.tokens[index] = { ...this.tokens[index], ...updates }
        this.saveToStorage()
        return this.tokens[index]
      }
      return null
    },

    /**
     * Delete a token by ID
     */
    deleteToken(id) {
      const index = this.tokens.findIndex(t => t.id === id)
      if (index !== -1) {
        this.tokens.splice(index, 1)
        this.saveToStorage()
        return true
      }
      return false
    },

    /**
     * Delete all tokens
     */
    deleteAllTokens() {
      this.tokens = []
      this.saveToStorage()
    },

    /**
     * Build an otpauth:// TOTP URI for a token
     */
    getOtpauthUri(token) {
      if (!token || !token.secret) return ''
      const name = token.name || 'Unnamed'
      const label = encodeURIComponent(name)
      // Clean secret (uppercase, strip whitespace and padding)
      const cleanSecret = token.secret.toUpperCase().replace(/\s+/g, '').replace(/=+$/, '')
      
      // Google Authenticator strictly requires 'SHA1', 'SHA256', 'SHA512' without hyphens
      let algo = (token.algorithm || 'SHA1').toUpperCase().replace('-', '')
      if (algo !== 'SHA1' && algo !== 'SHA256' && algo !== 'SHA512') {
        algo = 'SHA1'
      }

      const digits = parseInt(token.digits, 10) || 6
      const period = parseInt(token.period, 10) || 30

      const params = new URLSearchParams()
      params.set('secret', cleanSecret)
      
      // If name has a colon (Issuer: Account), or use issuer param
      if (name.includes(':')) {
        const parts = name.split(':')
        params.set('issuer', parts[0].trim())
      } else {
        params.set('issuer', name)
      }

      if (algo !== 'SHA1') {
        params.set('algorithm', algo)
      }
      if (digits !== 6) {
        params.set('digits', digits.toString())
      }
      if (period !== 30) {
        params.set('period', period.toString())
      }

      return `otpauth://totp/${label}?${params.toString()}`
    },

    /**
     * Export tokens as JSON string (all or specific array of tokens)
     */
    exportTokens(tokenList = null) {
      const list = tokenList || this.tokens
      const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        tokens: list.map(t => ({
          name: t.name,
          secret: t.secret,
          algorithm: t.algorithm,
          digits: t.digits,
          period: t.period
        }))
      }
      return JSON.stringify(exportData, null, 2)
    },

    /**
     * Download tokens as a JSON file
     */
    downloadExport(tokenList = null, filename = null) {
      const json = this.exportTokens(tokenList)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const defaultName = filename || `totp-backup-${new Date().toISOString().split('T')[0]}.json`
      const a = document.createElement('a')
      a.href = url
      a.download = defaultName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },

    /**
     * Import tokens from JSON string
     * @returns {number} Number of tokens imported
     */
    importTokens(jsonString, replace = false) {
      try {
        const data = JSON.parse(jsonString)
        
        let tokenList = null
        if (Array.isArray(data)) {
          tokenList = data
        } else if (data && Array.isArray(data.tokens)) {
          tokenList = data.tokens
        } else {
          throw new Error('Invalid import format: missing tokens array')
        }

        if (replace) {
          this.tokens = []
        }

        let imported = 0
        for (const token of tokenList) {
          if (token.secret) {
            this.addToken({
              name: token.name || 'Imported',
              secret: token.secret,
              algorithm: token.algorithm || 'SHA-1',
              digits: token.digits || 6,
              period: token.period || 30
            })
            imported++
          }
        }

        return imported
      } catch (e) {
        console.error('Failed to import tokens:', e)
        throw e
      }
    },

    /**
     * Download tokens as a JSON file
     */
    downloadExport() {
      const json = this.exportTokens()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `totp-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }
})

