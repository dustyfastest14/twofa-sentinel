<script setup>
import { ref } from 'vue'
import { useTokenStore } from '@/stores/tokenStore.js'
import { useToast } from 'primevue/usetoast'
import { eventBus } from '@/utils/eventBus.js'
import SpeedDial from 'primevue/speeddial'
import Dialog from 'primevue/dialog'
import { QrcodeStream } from 'vue-qrcode-reader'
import WebdavModal from './WebdavModal.vue'

const emit = defineEmits(['open-sidebar', 'export', 'clear-all'])

const store = useTokenStore()
const toast = useToast()

// QR Scanner state
const showQrScanner = ref(false)
const qrScannerError = ref('')

// WebDAV modal state for mobile
const showWebdavModal = ref(false)

// SpeedDial menu items
const speedDialItems = [
  {
    label: 'WebDAV 云备份',
    icon: 'pi pi-cloud',
    command: () => {
      showWebdavModal.value = true
    }
  },
  {
    label: '清空所有',
    icon: 'pi pi-trash',
    command: (e) => {
      emit('clear-all', e.originalEvent)
    }
  },
  {
    label: '批量导出',
    icon: 'pi pi-download',
    command: () => {
      emit('export')
    }
  },
  {
    label: '导入 JSON',
    icon: 'pi pi-upload',
    command: () => {
      eventBus.emit('trigger-import')
    }
  },
  {
    label: '扫描二维码',
    icon: 'pi pi-camera',
    command: () => {
      openQrScanner()
    }
  },
  {
    label: '添加令牌',
    icon: 'pi pi-plus',
    command: () => {
      emit('open-sidebar')
    }
  }
]

// QR Scanner functions
function openQrScanner() {
  qrScannerError.value = ''
  showQrScanner.value = true
}

function closeQrScanner() {
  showQrScanner.value = false
}

// Expose methods to parent
defineExpose({
  openQrScanner
})

function onQrDecode(detectedCodes) {
  try {
    if (!detectedCodes || !Array.isArray(detectedCodes) || detectedCodes.length === 0) {
      throw new Error('未检测到有效的二维码')
    }
    
    const qrCodeString = detectedCodes[0].rawValue
    if (!qrCodeString || typeof qrCodeString !== 'string') {
      throw new Error('二维码格式不正确')
    }
    
    const url = new URL(qrCodeString)
    
    if (url.protocol !== 'otpauth:') {
      throw new Error('无效的二维码：必须是 2FA 身份验证器二维码 (otpauth://)')
    }
    
    const type = url.hostname
    if (type !== 'totp') {
      throw new Error('当前仅支持 TOTP 算法。')
    }
    
    const label = decodeURIComponent(url.pathname.slice(1))
    const params = url.searchParams
    
    const secret = params.get('secret')
    if (!secret) {
      throw new Error('二维码中未包含密钥 (Secret)。')
    }
    
    const issuer = params.get('issuer')
    const algorithm = params.get('algorithm') || 'SHA-1'
    const digits = parseInt(params.get('digits') || '6', 10)
    const period = parseInt(params.get('period') || '30', 10)
    
    const name = issuer ? `${issuer} (${label.replace(issuer + ':', '')})` : label
    
    store.addToken({
      name: name.trim(),
      secret: secret.toUpperCase(),
      algorithm: algorithm.toUpperCase(),
      digits,
      period
    })
    
    toast.add({
      severity: 'success',
      summary: '添加成功',
      detail: `已通过二维码成功添加 ${name}`,
      life: 3000
    })
    
    closeQrScanner()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '无效二维码',
      detail: error.message || '无法解析此二维码',
      life: 5000
    })
  }
}

function onQrError(error) {
  qrScannerError.value = error.message || '相机权限被拒绝或不可用'
}
</script>

<template>
  <!-- QR Scanner Dialog -->
  <Dialog
    v-model:visible="showQrScanner"
    modal
    :style="{ width: '90vw', maxWidth: '400px' }"
    :closable="true"
    class="qr-scanner-dialog"
  >
    <template #header>
      <div class="qr-dialog-header">
        <i class="pi pi-camera"></i>
        <span>扫描 2FA 二维码</span>
      </div>
    </template>
    
    <div class="qr-scanner-container">
      <div class="qr-camera-wrapper">
        <QrcodeStream
          @detect="onQrDecode"
          @error="onQrError"
          class="qr-stream"
        />
        <div class="qr-overlay">
          <div class="qr-corner qr-corner-tl"></div>
          <div class="qr-corner qr-corner-tr"></div>
          <div class="qr-corner qr-corner-bl"></div>
          <div class="qr-corner qr-corner-br"></div>
        </div>
      </div>
      
      <p v-if="qrScannerError" class="qr-error">
        <i class="pi pi-exclamation-circle"></i>
        {{ qrScannerError }}
      </p>
      
      <div class="qr-disclaimer">
        <p class="qr-hint">将摄像头对准身份验证器二维码</p>
        <p class="qr-privacy">
          <i class="pi pi-lock"></i>
          图像仅在本地浏览器解析，绝不上报服务器。
        </p>
      </div>
    </div>
  </Dialog>

  <!-- Mobile WebDAV Modal -->
  <WebdavModal v-model:visible="showWebdavModal" />

  <!-- Mobile SpeedDial -->
  <SpeedDial
    :model="speedDialItems"
    type="semi-circle"
    direction="up"
    :radius="70"
    mask
    class="mobile-speed-dial"
  />
</template>

<style>
/* QR Scanner Dialog styles */
.qr-scanner-dialog .p-dialog-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e4e4e7;
}

.qr-scanner-dialog .p-dialog-content {
  padding: 1rem;
}

.qr-dialog-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: #18181b;
}

.qr-dialog-header i {
  color: #3b82f6;
}

.qr-scanner-container {
  display: flex;
  flex-direction: column;
}

.qr-camera-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #18181b;
}

.qr-stream {
  width: 100%;
  aspect-ratio: 1;
  display: block;
}

.qr-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.qr-corner {
  position: absolute;
  width: 40px;
  height: 40px;
  border-color: #3b82f6;
  border-style: solid;
  border-width: 0;
}

.qr-corner-tl {
  top: 20px;
  left: 20px;
  border-top-width: 3px;
  border-left-width: 3px;
  border-top-left-radius: 8px;
}

.qr-corner-tr {
  top: 20px;
  right: 20px;
  border-top-width: 3px;
  border-right-width: 3px;
  border-top-right-radius: 8px;
}

.qr-corner-bl {
  bottom: 20px;
  left: 20px;
  border-bottom-width: 3px;
  border-left-width: 3px;
  border-bottom-left-radius: 8px;
}

.qr-corner-br {
  bottom: 20px;
  right: 20px;
  border-bottom-width: 3px;
  border-right-width: 3px;
  border-bottom-right-radius: 8px;
}

.qr-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #ef4444;
}

.qr-disclaimer {
  margin-top: 1rem;
  text-align: center;
}

.qr-hint {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #3f3f46;
}

.qr-privacy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin: 0;
  font-size: 0.75rem;
  color: #71717a;
}

.qr-privacy i {
  font-size: 0.75rem;
  color: #22c55e;
}
</style>

<style>
/* Hide SpeedDial on desktop */
.mobile-speed-dial {
  display: none !important;
}

@media (max-width: 1024px) {
  /* Show mobile SpeedDial */
  .mobile-speed-dial {
    display: flex !important;
    z-index: 10000 !important;
    position: fixed !important;
    bottom: 1rem !important;
    right: calc(50% - 2rem) !important;
  }

  .mobile-speed-dial .p-speeddial-button {
    background: #18181b !important;
    border: none !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
  }

  .mobile-speed-dial .p-speeddial-button:hover {
    background: #27272a !important;
  }

  .mobile-speed-dial .p-speeddial-button .p-button-icon {
    font-size: 1.25rem;
  }

  .mobile-speed-dial .p-speeddial-action {
    width: 48px;
    height: 48px;
    background: #3b82f6;
    color: white;
    z-index: 1001;
  }

  .mobile-speed-dial .p-speeddial-action:hover {
    background: #2563eb;
  }

  .mobile-speed-dial .p-speeddial-mask {
    z-index: 996;
  }

  .mobile-speed-dial .p-speeddial-list {
    z-index: 1001;
  }
}
</style>