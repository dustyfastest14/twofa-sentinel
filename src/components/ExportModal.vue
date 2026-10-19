<script setup>
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useTokenStore } from '@/stores/tokenStore.js'
import QRCode from 'qrcode'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  // If singleToken is passed, modal enters Single Export mode; otherwise Batch Export mode.
  singleToken: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible'])

const store = useTokenStore()
const toast = useToast()

const selectedIds = ref([])
const singleQrDataUrl = ref('')
const isGeneratingQr = ref(false)

const isSingleMode = computed(() => !!props.singleToken)

// Computed single URI
const singleUri = computed(() => {
  if (!props.singleToken) return ''
  return store.getOtpauthUri(props.singleToken)
})

// Initialize/Reset selected tokens whenever batch modal opens
watch(
  () => props.visible,
  async (val) => {
    if (val) {
      if (props.singleToken) {
        // Generate QR code for single token
        generateSingleQr()
      } else {
        // Batch mode: select all tokens by default
        selectedIds.value = store.tokens.map((t) => t.id)
      }
    } else {
      singleQrDataUrl.value = ''
    }
  }
)

watch(
  () => props.singleToken,
  () => {
    if (props.visible && props.singleToken) {
      generateSingleQr()
    }
  }
)

async function generateSingleQr() {
  if (!props.singleToken) return
  isGeneratingQr.value = true
  try {
    const uri = store.getOtpauthUri(props.singleToken)
    singleQrDataUrl.value = await QRCode.toDataURL(uri, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#f8fafc'
      }
    })
  } catch (err) {
    console.error('Failed to generate QR code:', err)
  } finally {
    isGeneratingQr.value = false
  }
}

// Batch mode computed
const isAllSelected = computed(() => {
  return (
    store.tokens.length > 0 && selectedIds.value.length === store.tokens.length
  )
})

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = store.tokens.map((t) => t.id)
  }
}

function toggleItem(id) {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

// Copy single URI
function copySingleUri() {
  if (!singleUri.value) return
  navigator.clipboard.writeText(singleUri.value)
  toast.add({
    severity: 'success',
    summary: '已复制链接',
    detail: 'otpauth:// 协议 URI 已复制到剪贴板',
    life: 2500
  })
}

// Download single JSON
function downloadSingleJson() {
  if (!props.singleToken) return
  const safeName = (props.singleToken.name || 'token')
    .replace(/[\\/:*?"<>|]/g, '_')
    .slice(0, 30)
  store.downloadExport(
    [props.singleToken],
    `totp-${safeName}-${new Date().toISOString().split('T')[0]}.json`
  )
  toast.add({
    severity: 'success',
    summary: '导出成功',
    detail: `已导出令牌「${props.singleToken.name}」`,
    life: 2500
  })
}

// Download batch JSON
function downloadBatchJson() {
  if (selectedIds.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: '提示',
      detail: '请至少选择一个要导出的令牌',
      life: 2500
    })
    return
  }

  const selectedTokens = store.tokens.filter((t) =>
    selectedIds.value.includes(t.id)
  )
  store.downloadExport(
    selectedTokens,
    `totp-batch-${selectedTokens.length}-${new Date().toISOString().split('T')[0]}.json`
  )
  toast.add({
    severity: 'success',
    summary: '批量导出成功',
    detail: `已导出 ${selectedTokens.length} 个令牌备份`,
    life: 3000
  })
  emit('update:visible', false)
}

// Copy batch URIs
function copyBatchUris() {
  if (selectedIds.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: '提示',
      detail: '请至少选择一个令牌',
      life: 2500
    })
    return
  }

  const selectedTokens = store.tokens.filter((t) =>
    selectedIds.value.includes(t.id)
  )
  const uris = selectedTokens.map((t) => store.getOtpauthUri(t)).join('\n')
  navigator.clipboard.writeText(uris)
  toast.add({
    severity: 'success',
    summary: '复制成功',
    detail: `已复制 ${selectedTokens.length} 条 otpauth:// 协议链接至剪贴板`,
    life: 3000
  })
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    modal
    :dismissableMask="true"
    :header="false"
    class="cyber-export-modal"
  >
    <div class="modal-box">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-title-group">
          <div class="title-icon">
            <i :class="isSingleMode ? 'pi pi-share-alt' : 'pi pi-download'"></i>
          </div>
          <div class="title-text">
            <h3>{{ isSingleMode ? '导出单条令牌' : '批量导出令牌' }}</h3>
            <span class="subtitle">
              {{
                isSingleMode
                  ? '支持二维码扫码迁移、协议链接与 JSON 备份'
                  : '自由选择令牌批量导出为 JSON 或纯文本协议列表'
              }}
            </span>
          </div>
        </div>
        <button
          class="close-btn"
          @click="emit('update:visible', false)"
          title="关闭"
        >
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- ================= SINGLE EXPORT MODE ================= -->
      <div v-if="isSingleMode" class="single-export-body">
        <div class="single-token-badge">
          <span class="token-name-label">{{ singleToken.name }}</span>
          <span class="badge algo-badge">{{ singleToken.algorithm || 'SHA-1' }}</span>
          <span class="badge period-badge">{{ singleToken.period || 30 }}s</span>
        </div>

        <!-- QR Code Area -->
        <div class="qr-preview-box">
          <div v-if="singleQrDataUrl" class="qr-wrapper">
            <img :src="singleQrDataUrl" alt="2FA 二维码" class="qr-img" />
            <div class="qr-glow"></div>
          </div>
          <div v-else class="qr-loading">
            <i class="pi pi-spin pi-spinner"></i>
            <span>正在生成高精度二维码...</span>
          </div>
          <p class="qr-hint">
            <i class="pi pi-camera"></i>
            使用手机身份验证器直接扫码录入
          </p>
        </div>

        <!-- URI string preview -->
        <div class="uri-box">
          <span class="uri-label">OTPAUTH 协议 URI：</span>
          <div class="uri-text-wrapper" @click="copySingleUri">
            <span class="uri-text">{{ singleUri }}</span>
            <button class="uri-copy-btn" title="复制链接">
              <i class="pi pi-copy"></i>
            </button>
          </div>
        </div>

        <!-- Single Actions -->
        <div class="modal-actions">
          <Button
            label="复制协议链接"
            icon="pi pi-clone"
            class="cyber-action-btn secondary-action"
            @click="copySingleUri"
          />
          <Button
            label="下载单条 JSON"
            icon="pi pi-download"
            class="cyber-action-btn primary-action"
            @click="downloadSingleJson"
          />
        </div>
      </div>

      <!-- ================= BATCH EXPORT MODE ================= -->
      <div v-else class="batch-export-body">
        <div class="batch-toolbar">
          <div class="batch-select-stats" @click="toggleSelectAll">
            <div class="cyber-checkbox" :class="{ checked: isAllSelected }">
              <i v-if="isAllSelected" class="pi pi-check"></i>
            </div>
            <span>全选所有 (已选 {{ selectedIds.length }}/{{ store.tokens.length }})</span>
          </div>
          <span class="batch-hint">点击项目进行单选或取消</span>
        </div>

        <!-- Tokens Checkbox List -->
        <div class="token-selection-list">
          <div
            v-for="t in store.tokens"
            :key="t.id"
            class="token-select-item"
            :class="{ active: selectedIds.includes(t.id) }"
            @click="toggleItem(t.id)"
          >
            <div
              class="cyber-checkbox"
              :class="{ checked: selectedIds.includes(t.id) }"
            >
              <i v-if="selectedIds.includes(t.id)" class="pi pi-check"></i>
            </div>
            <div class="item-info">
              <span class="item-name">{{ t.name }}</span>
              <span class="item-meta">{{ t.algorithm || 'SHA-1' }} · {{ t.period || 30 }}s</span>
            </div>
          </div>
        </div>

        <!-- Batch Actions -->
        <div class="modal-actions">
          <Button
            label="复制所选协议链接"
            icon="pi pi-clone"
            class="cyber-action-btn secondary-action"
            :disabled="selectedIds.length === 0"
            @click="copyBatchUris"
          />
          <Button
            :label="`导出所选 JSON (${selectedIds.length})`"
            icon="pi pi-download"
            class="cyber-action-btn primary-action"
            :disabled="selectedIds.length === 0"
            @click="downloadBatchJson"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style>
/* Global Dialog overrides for cyber-export-modal */
.cyber-export-modal.p-dialog {
  background: rgba(13, 16, 25, 0.96) !important;
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border-radius: 20px !important;
  color: #f8fafc !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.15) !important;
  width: 90vw;
  max-width: 520px;
  overflow: hidden;
}

.cyber-export-modal .p-dialog-content {
  padding: 0 !important;
  background: transparent !important;
}
</style>

<style scoped>
.modal-box {
  display: flex;
  flex-direction: column;
}

/* Header */
.modal-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(59, 130, 246, 0.15);
  background: rgba(10, 12, 18, 0.6);
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.title-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%);
  border: 1px solid rgba(56, 189, 248, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  font-size: 1.15rem;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
}

.title-text h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.01em;
}

.title-text .subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
  display: block;
  margin-top: 2px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}

/* Single Mode Body */
.single-export-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.single-token-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.7);
  padding: 0.4rem 0.85rem;
  border-radius: 100px;
  border: 1px solid rgba(56, 189, 248, 0.25);
}

.token-name-label {
  font-weight: 700;
  color: #f1f5f9;
  font-size: 0.9rem;
}

.badge {
  font-size: 0.65rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
  text-transform: uppercase;
}

.algo-badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.period-badge {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.qr-preview-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.qr-wrapper {
  position: relative;
  background: #ffffff;
  padding: 12px;
  border-radius: 16px;
  box-shadow: 0 0 35px rgba(56, 189, 248, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-img {
  width: 190px;
  height: 190px;
  display: block;
}

.qr-loading {
  width: 214px;
  height: 214px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #94a3b8;
  font-size: 0.85rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 16px;
  border: 1px dashed rgba(56, 189, 248, 0.3);
}

.qr-loading i {
  font-size: 1.75rem;
  color: #38bdf8;
}

.qr-hint {
  margin: 0;
  font-size: 0.8rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.uri-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.uri-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.uri-text-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(10, 12, 18, 0.85);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.uri-text-wrapper:hover {
  border-color: #38bdf8;
  background: rgba(15, 23, 42, 0.95);
}

.uri-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 0.5rem;
}

.uri-copy-btn {
  background: transparent;
  border: none;
  color: #38bdf8;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

/* Batch Mode Body */
.batch-export-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.batch-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.batch-select-stats {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e2e8f0;
  user-select: none;
}

.batch-hint {
  font-size: 0.75rem;
  color: #64748b;
}

.token-selection-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

.token-selection-list::-webkit-scrollbar {
  width: 5px;
}
.token-selection-list::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.25);
  border-radius: 4px;
}

.token-select-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.token-select-item:hover {
  background: rgba(15, 23, 42, 0.85);
  border-color: rgba(56, 189, 248, 0.3);
}

.token-select-item.active {
  background: rgba(14, 165, 233, 0.1);
  border-color: rgba(56, 189, 248, 0.4);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #f8fafc;
}

.item-meta {
  font-size: 0.72rem;
  color: #64748b;
  font-family: 'JetBrains Mono', monospace;
}

/* Custom Cyber Checkbox */
.cyber-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.cyber-checkbox.checked {
  background: #0284c7;
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
}

.cyber-checkbox i {
  font-size: 0.65rem;
  color: #ffffff;
  font-weight: 800;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.5rem;
}

.cyber-action-btn {
  flex: 1;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  padding: 0.65rem 1rem !important;
  transition: all 0.2s ease !important;
}

.primary-action {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%) !important;
  border: 1px solid #38bdf8 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 15px rgba(2, 132, 199, 0.3) !important;
}

.primary-action:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(56, 189, 248, 0.45) !important;
  transform: translateY(-1px);
}

.secondary-action {
  background: rgba(30, 41, 59, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: #cbd5e1 !important;
}

.secondary-action:hover:not(:disabled) {
  background: rgba(51, 65, 85, 0.8) !important;
  color: #ffffff !important;
  border-color: rgba(56, 189, 248, 0.3) !important;
}
</style>
