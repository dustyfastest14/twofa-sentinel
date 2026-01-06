import { ref, onMounted, onUnmounted, watch } from 'vue'
import { generateTOTP, getRemainingSeconds, getCurrentTimeStep } from '@/utils/totp.js'

/**
 * Composable for generating and auto-refreshing TOTP codes
 * @param {Object} tokenRef - Reactive token object or ref
 * @returns {Object} - { code, remainingSeconds, progress, error }
 */
export function useTOTP(tokenRef) {
  const code = ref('------')
  const remainingSeconds = ref(30)
  const progress = ref(100)
  const error = ref(null)
  const loading = ref(true)

  let intervalId = null
  let lastTimeStep = null

  /**
   * Generate the TOTP code
   */
  async function generateCode() {
    const token = tokenRef.value || tokenRef
    
    if (!token || !token.secret) {
      code.value = '------'
      error.value = 'No secret'
      loading.value = false
      return
    }

    try {
      const newCode = await generateTOTP({
        secret: token.secret,
        algorithm: token.algorithm || 'SHA-1',
        digits: token.digits || 6,
        period: token.period || 30
      })
      
      code.value = newCode
      error.value = null
    } catch (e) {
      console.error('TOTP generation error:', e)
      code.value = 'ERROR'
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Update the countdown and progress
   */
  function updateCountdown() {
    const token = tokenRef.value || tokenRef
    const period = token?.period || 30

    remainingSeconds.value = getRemainingSeconds(period)
    progress.value = (remainingSeconds.value / period) * 100

    // Check if we need to generate a new code
    const currentStep = getCurrentTimeStep(period)
    if (lastTimeStep !== null && currentStep !== lastTimeStep) {
      generateCode()
    }
    lastTimeStep = currentStep
  }

  /**
   * Start the refresh interval
   */
  function startInterval() {
    stopInterval()
    
    // Initial generation
    generateCode()
    updateCountdown()

    // Update every second
    intervalId = setInterval(() => {
      updateCountdown()
    }, 1000)
  }

  /**
   * Stop the refresh interval
   */
  function stopInterval() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // Watch for token changes
  if (tokenRef.value !== undefined) {
    watch(tokenRef, () => {
      lastTimeStep = null
      startInterval()
    }, { deep: true })
  }

  onMounted(() => {
    startInterval()
  })

  onUnmounted(() => {
    stopInterval()
  })

  return {
    code,
    remainingSeconds,
    progress,
    error,
    loading,
    refresh: generateCode
  }
}

