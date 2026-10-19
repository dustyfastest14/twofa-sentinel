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

const emit = defineEmits(['edit', 'delete', 'export'])
const toast = useToast()

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

// Circular progress calculation
const strokeDashoffset = computed(() => {
  const circumference = 2 * Math.PI * 14 // r=14 => ~87.96
  return circumference - (progress.value / 100) * circumference
})

function copyCode() {
  if (!code.value || code.value === 'ERROR' || code.value === '------') return
  navigator.clipboard.writeText(code.value)
  toast.add({
    severity: 'success',
    summary: '已复制！',
    detail: `${props.token.name} 的验证码已存入剪贴板`,
    life: 2000
  })
}
</script>

<template>
  <div class="tech-card" :class="{ 'warning-mode': remainingSeconds <= 5 }">
    <!-- Cyber corner accents -->
    <div class="corner-accent corner-tl"></div>
    <div class="corner-accent corner-br"></div>

    <!-- Action buttons (Export & Delete) -->
    <div class="card-action-group">
      <button
        class="card-action-btn export-btn"
        @click="(e) => emit('export', token)"
        title="导出 / 二维码"
        aria-label="导出 / 二维码"
      >
        <i class="pi pi-share-alt"></i>
      </button>
      <button
        class="card-action-btn delete-btn"
        @click="(e) => emit('delete', { token, event: e })"
        title="删除令牌"
        aria-label="删除令牌"
      >
        <i class="pi pi-times"></i>
      </button>
    </div>

    <!-- Card Header -->
    <div class="card-header">
      <div class="token-title-group">
        <span class="status-dot"></span>
        <h3 class="token-name" :title="token.name">{{ token.name }}</h3>
      </div>
      <div class="token-badges">
        <span class="badge algo-badge">{{ token.algorithm || 'SHA-1' }}</span>
        <span class="badge period-badge">{{ token.period || 30 }}s</span>
      </div>
    </div>

    <!-- Card Body -->
    <div class="card-body">
      <div class="code-box" @click="copyCode" title="点击立即复制">
        <div class="code-glow"></div>
        <span v-if="error" class="code-error">{{ error }}</span>
        <span v-else class="code-value">{{ formattedCode }}</span>
        <div class="copy-hint">
          <i class="pi pi-copy"></i>
          <span>点击复制</span>
        </div>
      </div>
    </div>

    <!-- Card Footer with Neon Circular Timer -->
    <div class="card-footer">
      <div class="timer-wrapper">
        <div class="circular-timer">
          <svg width="34" height="34" viewBox="0 0 34 34">
            <circle class="timer-bg" cx="17" cy="17" r="14"></circle>
            <circle
              class="timer-progress"
              cx="17"
              cy="17"
              r="14"
              :style="{ strokeDashoffset: strokeDashoffset }"
            ></circle>
          </svg>
          <span class="timer-num">{{ remainingSeconds }}</span>
        </div>
        <div class="timer-meta">
          <span class="timer-label">实时刷新</span>
          <span class="timer-status">{{ remainingSeconds <= 5 ? '即将轮换' : '安全有效期' }}</span>
        </div>
      </div>

      <button class="quick-copy-btn" @click="copyCode">
        <i class="pi pi-clone"></i>
        <span>复制</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tech-card {
  position: relative;
  background: rgba(18, 20, 29, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.tech-card:hover {
  transform: translateY(-3px);
  border-color: rgba(96, 165, 250, 0.45);
  box-shadow: 0 12px 40px rgba(14, 165, 233, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Cyber corner accents */
.corner-accent {
  position: absolute;
  width: 8px;
  height: 8px;
  pointer-events: none;
}
.corner-tl {
  top: 0;
  left: 0;
  border-top: 2px solid #38bdf8;
  border-left: 2px solid #38bdf8;
  border-top-left-radius: 4px;
}
.corner-br {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid #38bdf8;
  border-right: 2px solid #38bdf8;
  border-top-right-radius: 4px;
}

/* Floating action buttons */
.card-action-group {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  z-index: 2;
}

.card-action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.2s ease;
}

.tech-card:hover .card-action-btn {
  opacity: 1;
}

.export-btn:hover {
  background: rgba(56, 189, 248, 0.2);
  border-color: rgba(56, 189, 248, 0.4);
  color: #38bdf8;
  transform: scale(1.05);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
  transform: scale(1.05);
}

/* Card Header */
.card-header {
  padding: 1.25rem 1.25rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.token-title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 2.2rem;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  flex-shrink: 0;
}

.warning-mode .status-dot {
  background: #ef4444;
  box-shadow: 0 0 10px #ef4444;
}

.token-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.token-badges {
  display: flex;
  gap: 0.4rem;
}

.badge {
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.algo-badge {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.25);
}

.period-badge {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

/* Card Body / Code Box */
.card-body {
  padding: 0.5rem 1.25rem 1rem;
}

.code-box {
  position: relative;
  width: 100%;
  cursor: pointer;
  padding: 1.15rem 1rem;
  border-radius: 12px;
  background: rgba(10, 12, 18, 0.85);
  border: 1px solid rgba(59, 130, 246, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.code-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.12), transparent 70%);
  pointer-events: none;
}

.code-box:hover {
  background: rgba(15, 23, 42, 0.95);
  border-color: #38bdf8;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);
  transform: scale(1.01);
}

.code-box:active {
  transform: scale(0.98);
}

.code-value {
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: #f8fafc;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.4), 0 0 24px rgba(56, 189, 248, 0.3);
  z-index: 1;
}

.warning-mode .code-value {
  color: #fca5a5;
  text-shadow: 0 0 12px rgba(239, 68, 68, 0.5);
}

.copy-hint {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.65rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  z-index: 1;
  transition: color 0.2s ease;
}

.code-box:hover .copy-hint {
  color: #38bdf8;
}

.code-error {
  color: #f87171;
  font-size: 0.85rem;
}

/* Card Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: rgba(10, 12, 18, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.timer-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.circular-timer {
  position: relative;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circular-timer svg {
  transform: rotate(-90deg);
}

.timer-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.08);
  stroke-width: 3;
}

.timer-progress {
  fill: none;
  stroke: #38bdf8;
  stroke-width: 3;
  stroke-dasharray: 88;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}

.warning-mode .timer-progress {
  stroke: #ef4444;
}

.timer-num {
  position: absolute;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
}

.warning-mode .timer-num {
  color: #ef4444;
}

.timer-meta {
  display: flex;
  flex-direction: column;
}

.timer-label {
  font-size: 0.65rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.timer-status {
  font-size: 0.75rem;
  font-weight: 600;
  color: #cbd5e1;
}

.warning-mode .timer-status {
  color: #f87171;
}

.quick-copy-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-copy-btn:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}

@media (max-width: 640px) {
  .code-value {
    font-size: 1.85rem;
  }
}
</style>