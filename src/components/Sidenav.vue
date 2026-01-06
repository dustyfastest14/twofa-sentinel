<script setup>
import { ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'update:visible'])

// Form data
const tokenForm = ref({
  name: '',
  secret: '',
  algorithm: 'SHA-1',
  digits: 6,
  period: 30
})

// Dropdown options
const algorithms = [
  { label: 'SHA-1', value: 'SHA-1' },
  { label: 'SHA-256', value: 'SHA-256' },
  { label: 'SHA-512', value: 'SHA-512' }
]

const digitsOptions = [
  { label: '6 digits', value: 6 },
  { label: '8 digits', value: 8 }
]

const periodOptions = [
  { label: '30 seconds', value: 30 },
  { label: '60 seconds', value: 60 }
]

// Form validation
const isValid = ref(false)

watch(tokenForm, () => {
  isValid.value = tokenForm.value.name.trim() !== '' && tokenForm.value.secret.trim() !== ''
}, { deep: true })

function handleSubmit() {
  if (!isValid.value) return

  // Normalize secret
  const normalizedSecret = tokenForm.value.secret.toUpperCase().replace(/\s/g, '')

  emit('save', {
    ...tokenForm.value,
    secret: normalizedSecret
  })

  // Reset form
  tokenForm.value = {
    name: '',
    secret: '',
    algorithm: 'SHA-1',
    digits: 6,
    period: 30
  }

  // Close sidebar on mobile after adding
  if (window.innerWidth <= 1024) {
    emit('update:visible', false)
  }
}

function closeSidebar() {
  emit('update:visible', false)
}
</script>

<template>
  <aside class="sidenav" :class="{ open: visible }">
    <div class="sidenav-header-mobile">
      <span class="header-title">Add Token</span>
      <Button
        icon="pi pi-times"
        text
        rounded
        size="small"
        @click="closeSidebar"
        class="close-btn"
      />
    </div>

    <form @submit.prevent="handleSubmit" class="token-form">
      <div class="form-section">
        <label for="token-name" class="form-label">Token Name</label>
        <InputText
          id="token-name"
          v-model="tokenForm.name"
          class="w-full"
          size="small"
          autocomplete="off"
          placeholder="e.g. GitHub, Google"
        />
      </div>

      <div class="form-section">
        <label for="token-secret" class="form-label">Secret Key</label>
        <InputText
          id="token-secret"
          v-model="tokenForm.secret"
          class="w-full"
          size="small"
          autocomplete="off"
          placeholder="e.g. JBSWY3DPEHPK3PXP"
        />
      </div>

      <div class="form-section">
        <label for="algorithm" class="form-label">Algorithm</label>
        <Select
          id="algorithm"
          v-model="tokenForm.algorithm"
          :options="algorithms"
          optionLabel="label"
          optionValue="value"
          class="w-full"
          size="small"
        />
      </div>

      <div class="form-section">
        <label for="digits" class="form-label">Code Length</label>
        <Select
          id="digits"
          v-model="tokenForm.digits"
          :options="digitsOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
          size="small"
        />
      </div>

      <div class="form-section">
        <label for="period" class="form-label">Time Period</label>
        <Select
          id="period"
          v-model="tokenForm.period"
          :options="periodOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
          size="small"
        />
      </div>

      <Button
        type="submit"
        label="Add Token"
        icon="pi pi-plus"
        class="w-full add-btn"
        size="small"
        :disabled="!isValid"
      />

      <div class="warning-alert">
        <i class="pi pi-exclamation-triangle"></i>
        <p><strong>Warning:</strong> Do not use production or real-world tokens for testing. This is a demo/development tool.</p>
      </div>
    </form>

    <div class="sidenav-footer">
      <div class="footer-info">
        <i class="pi pi-info-circle"></i>
        <p>All tokens are stored securely in your browser. Nothing is sent to any server.</p>
      </div>
      <div class="footer-credit">
        Made by <a href="https://twitter.com/maurohouseless" target="_blank" rel="noopener noreferrer">@maurohouseless</a>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidenav {
  width: 320px;
  background: white;
  border-right: 1px solid #e4e4e7;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  position: sticky;
  top: 64px;
  overflow-y: auto;
}

.sidenav-header-mobile {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e4e4e7;
}

.header-title {
  font-weight: 600;
  font-size: 1rem;
  color: #18181b;
}

.close-btn {
  color: #71717a;
}

.token-form {
  padding: 1.5rem;
  flex: 1;
}

.warning-alert {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.875rem;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  margin-top: 1rem;
}

.warning-alert i {
  color: #f59e0b;
  margin-top: 0.125rem;
  flex-shrink: 0;
  font-size: 1rem;
}

.warning-alert p {
  margin: 0;
  font-size: 0.8125rem;
  color: #92400e;
  line-height: 1.5;
}

.warning-alert p strong {
  font-weight: 600;
}

.form-section {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #3f3f46;
}

.w-full {
  width: 100%;
}

.add-btn {
  background: #18181b;
  border-color: #18181b;
  color: white;
  font-weight: 500;
}

.add-btn:hover:not(:disabled) {
  background: #27272a;
  border-color: #27272a;
}

.add-btn:disabled {
  background: #e4e4e7;
  border-color: #e4e4e7;
  color: #a1a1aa;
}

.sidenav-footer {
  padding: 1.25rem 1.5rem;
  background: #fafafa;
  border-top: 1px solid #e4e4e7;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-info {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.footer-info i {
  color: #71717a;
  margin-top: 0.125rem;
  flex-shrink: 0;
  font-size: 0.875rem;
}

.footer-info p {
  margin: 0;
  font-size: 0.75rem;
  color: #71717a;
  line-height: 1.5;
}

.footer-credit {
  font-size: 0.6875rem;
  color: #a1a1aa;
  text-align: center;
  padding-top: 0.5rem;
  border-top: 1px solid #e4e4e7;
}

.footer-credit a {
  color: #71717a;
  text-decoration: none;
  font-weight: 500;
}

.footer-credit a:hover {
  color: #1da1f2;
}

@media (max-width: 1024px) {
  .sidenav {
    position: fixed;
    left: 0;
    top: 64px;
    height: calc(100vh - 64px);
    z-index: 999;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidenav.open {
    transform: translateX(0);
  }

  .sidenav-header-mobile {
    display: flex;
  }

  .token-form {
    padding-top: 1rem;
  }
}
</style>
