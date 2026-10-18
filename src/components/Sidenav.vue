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
  { label: 'SHA-1 (推荐/默认)', value: 'SHA-1' },
  { label: 'SHA-256', value: 'SHA-256' },
  { label: 'SHA-512', value: 'SHA-512' }
]

const digitsOptions = [
  { label: '6 位数字 (标准)', value: 6 },
  { label: '8 位数字', value: 8 }
]

const periodOptions = [
  { label: '30 秒 (标准)', value: 30 },
  { label: '60 秒', value: 60 }
]

const isValid = ref(false)

watch(tokenForm, () => {
  isValid.value = tokenForm.value.name.trim() !== '' && tokenForm.value.secret.trim() !== ''
}, { deep: true })

function handleSubmit() {
  if (!isValid.value) return

  const normalizedSecret = tokenForm.value.secret.toUpperCase().replace(/\s/g, '')

  emit('save', {
    ...tokenForm.value,
    secret: normalizedSecret
  })

  tokenForm.value = {
    name: '',
    secret: '',
    algorithm: 'SHA-1',
    digits: 6,
    period: 30
  }

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
    <div class="sidenav-header">
      <div class="header-title-box">
        <span class="cyber-dot"></span>
        <span class="header-title">添加新身份令牌</span>
      </div>
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
        <label for="token-name" class="form-label">
          <i class="pi pi-tag"></i> 令牌名称
        </label>
        <InputText
          id="token-name"
          v-model="tokenForm.name"
          class="w-full"
          size="small"
          autocomplete="off"
          placeholder="例如：GitHub (work), Google"
        />
      </div>

      <div class="form-section">
        <label for="token-secret" class="form-label">
          <i class="pi pi-key"></i> 密钥 (Secret Key)
        </label>
        <InputText
          id="token-secret"
          v-model="tokenForm.secret"
          class="w-full secret-input"
          size="small"
          autocomplete="off"
          placeholder="例如：JBSWY3DPEHPK3PXP"
        />
      </div>

      <div class="form-section">
        <label for="algorithm" class="form-label">
          <i class="pi pi-cog"></i> 加密算法
        </label>
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

      <div class="form-row">
        <div class="form-section flex-1">
          <label for="digits" class="form-label">位数</label>
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

        <div class="form-section flex-1">
          <label for="period" class="form-label">周期</label>
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
      </div>

      <Button
        type="submit"
        label="确认添加令牌"
        icon="pi pi-plus"
        class="w-full submit-btn"
        size="small"
        :disabled="!isValid"
      />

      <div class="security-banner">
        <i class="pi pi-shield"></i>
        <p><strong>隐私声明：</strong>全部密钥经由本地 Web Crypto API 独立处理，绝不上报云端，安全可靠。</p>
      </div>
    </form>
  </aside>
</template>

<style scoped>
.sidenav {
  width: 340px;
  background: rgba(13, 16, 25, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(59, 130, 246, 0.15);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  position: sticky;
  top: 64px;
  overflow-y: auto;
  z-index: 10;
}

.sidenav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-title-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cyber-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
}

.header-title {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  color: #f8fafc;
  letter-spacing: -0.01em;
}

.close-btn {
  color: #64748b !important;
}
.close-btn:hover {
  color: #f8fafc !important;
}

.token-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
}

.form-label i {
  font-size: 0.75rem;
  color: #38bdf8;
}

.form-row {
  display: flex;
  gap: 0.75rem;
}

.flex-1 {
  flex: 1;
}

.w-full {
  width: 100%;
}

.secret-input {
  font-family: 'JetBrains Mono', monospace !important;
  letter-spacing: 0.05em;
}

.submit-btn {
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%) !important;
  border: 1px solid rgba(56, 189, 248, 0.4) !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  padding: 0.6rem !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(2, 132, 199, 0.3) !important;
  transition: all 0.2s ease !important;
}

.submit-btn:hover:not(:disabled) {
  box-shadow: 0 6px 24px rgba(2, 132, 199, 0.5) !important;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: #475569 !important;
  box-shadow: none !important;
}

.security-banner {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  padding: 0.85rem;
  background: rgba(14, 165, 233, 0.06);
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 10px;
}

.security-banner i {
  color: #38bdf8;
  font-size: 0.9rem;
  margin-top: 0.15rem;
  flex-shrink: 0;
}

.security-banner p {
  margin: 0;
  font-size: 0.75rem;
  color: #94a3b8;
  line-height: 1.5;
}

.security-banner p strong {
  color: #e2e8f0;
}

@media (max-width: 1024px) {
  .sidenav {
    position: fixed;
    left: 0;
    top: 64px;
    height: calc(100vh - 64px);
    z-index: 999;
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.7);
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .sidenav.open {
    transform: translateX(0);
  }
}
</style>