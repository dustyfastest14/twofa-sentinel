<script setup>
import { computed, toRef } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useTOTP } from '@/composables/useTOTP.js'

const props = defineProps({
  token: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])
const toast = useToast()

// Use the TOTP composable with a ref to the token
const tokenRef = toRef(props, 'token')
const { code, remainingSeconds, progress, error } = useTOTP(tokenRef)

// Format code with spaces for readability (e.g., "123 456")
const formattedCode = computed(() => {
  if (!code.value || code.value === 'ERROR' || code.value === '------') {
    return code.value
  }
  const mid = Math.ceil(code.value.length / 2)
  return code.value.slice(0, mid) + ' ' + code.value.slice(mid)
})

// Algorithm badge color
const algoBadgeClass = computed(() => {
  const algo = props.token.algorithm || 'SHA-1'
  if (algo === 'SHA-256') return 'bg-blue-100 text-blue-800'
  if (algo === 'SHA-512') return 'bg-purple-100 text-purple-800'
  return 'bg-gray-100 text-gray-800'
})

function copyCode() {
  navigator.clipboard.writeText(code.value)
  toast.add({
    severity: 'success',
    summary: 'Copied!',
    detail: `Code for ${props.token.name} copied to clipboard`,
    life: 2000
  })
}
</script>

<template>
  <div class="token-card">
    <!-- Delete button - floating X -->
    <button
      class="delete-btn"
      @click="(e) => emit('delete', { token, event: e })"
      title="Delete token"
      aria-label="Delete token"
    >
      <i class="pi pi-times"></i>
    </button>

    <!-- Card Header -->
    <div class="card-header">
      <h3 class="token-name">{{ token.name }}</h3>
      <div class="token-badges">
        <span class="badge badge-algo" :class="algoBadgeClass">{{ token.algorithm || 'SHA-1' }}</span>
        <span class="badge badge-period">{{ token.period || 30 }}s</span>
      </div>
    </div>

    <!-- Card Body -->
    <div class="card-body">
      <div class="code-display" @click="copyCode">
        <span v-if="error" class="code-error">{{ error }}</span>
        <span v-else class="code-value">{{ formattedCode }}</span>
        <span class="code-hint">Click to copy</span>
      </div>
    </div>

    <!-- Card Footer -->
    <div class="card-footer" :class="{ 'footer-warning': remainingSeconds <= 5 }">
      <div class="timer-bar">
        <div class="timer-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="timer-text">{{ remainingSeconds }}s</span>
      <Button
        icon="pi pi-copy"
        label="Copy"
        size="small"
        text
        @click="copyCode"
        class="copy-btn"
      />
    </div>
  </div>
</template>

<style scoped>
.token-card {
  position: relative;
  background: white;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.token-card:hover {
  border-color: #d4d4d8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.token-card:hover .delete-btn {
  opacity: 1;
}

/* Delete Button - Floating X */
.delete-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #a1a1aa;
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s ease;
  z-index: 1;
}

.delete-btn:hover {
  background: #fef2f2;
  color: #ef4444;
}

.delete-btn i {
  font-size: 0.875rem;
}

/* Card Header */
.card-header {
  padding: 1rem 1.25rem 0.75rem;
}

.token-name {
  margin: 0 0 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #18181b;
  padding-right: 2rem;
}

.token-badges {
  display: flex;
  gap: 0.375rem;
}

.badge {
  padding: 0.1875rem 0.5rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.bg-gray-100 { background-color: #f4f4f5; }
.text-gray-800 { color: #52525b; }
.bg-blue-100 { background-color: #eff6ff; }
.text-blue-800 { color: #1d4ed8; }
.bg-purple-100 { background-color: #faf5ff; }
.text-purple-800 { color: #7e22ce; }

.badge-period {
  background-color: #f0fdf4;
  color: #15803d;
}

/* Card Body */
.card-body {
  padding: 0 1.25rem 1rem;
}

.code-display {
  width: 100%;
  cursor: pointer;
  padding: 1rem;
  border-radius: 8px;
  background: #fafafa;
  border: 1px solid #e4e4e7;
  transition: all 0.15s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.code-display:hover {
  background: #f4f4f5;
  border-color: #d4d4d8;
}

.code-display:active {
  transform: scale(0.99);
}

.code-value {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #18181b;
}

.code-hint {
  font-size: 0.6875rem;
  color: #a1a1aa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.code-error {
  color: #ef4444;
  font-size: 0.8125rem;
  font-weight: 500;
}

/* Card Footer */
.card-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem 0.5rem 1.25rem;
  background: #fafafa;
  border-top: 1px solid #f4f4f5;
}

.timer-bar {
  flex: 1;
  height: 4px;
  background: #e4e4e7;
  border-radius: 2px;
  overflow: hidden;
}

.timer-fill {
  height: 100%;
  background: #18181b;
  border-radius: 2px;
  transition: width 1s linear;
}

.footer-warning .timer-fill {
  background: #ef4444;
}

.timer-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #71717a;
  min-width: 24px;
  text-align: right;
}

.footer-warning .timer-text {
  color: #ef4444;
}

.copy-btn {
  flex-shrink: 0;
  color: #71717a;
}

.copy-btn:hover {
  color: #18181b;
  background: #e4e4e7;
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .delete-btn {
    opacity: 1;
  }
  
  .code-value {
    font-size: 1.75rem;
  }
}
</style>

