<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTokenStore } from '@/stores/tokenStore.js'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useRegisterSW } from 'virtual:pwa-register/vue'

// Components
import TopNav from '@/components/TopNav.vue'
import Sidenav from '@/components/Sidenav.vue'
import TokenList from '@/components/TokenList.vue'
import Toast from 'primevue/toast'
import ConfirmPopup from 'primevue/confirmpopup'
import Button from 'primevue/button'
import MobileMenu from '@/components/MobileMenu.vue'
import ExportModal from '@/components/ExportModal.vue'

const store = useTokenStore()
const confirm = useConfirm()
const toast = useToast()

const deferredPrompt = ref(null)
const showInstallBanner = ref(false)

const {
  needRefresh,
  updateServiceWorker
} = useRegisterSW({
  onRegistered(registration) {
    console.log('SW Registered:', registration)
  },
  onRegisterError(error) {
    console.error('SW registration error:', error)
  }
})

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= 1024
}

function handleBeforeInstallPrompt(e) {
  e.preventDefault()
  if (isMobileDevice()) return
  deferredPrompt.value = e
  showInstallBanner.value = true
}

async function installApp() {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  if (outcome === 'accepted') {
    toast.add({
      severity: 'success',
      summary: '安装成功',
      detail: '2FA Sentinel 已成功安装为本地独立应用',
      life: 3000
    })
  }
  deferredPrompt.value = null
  showInstallBanner.value = false
}

function dismissInstallBanner() {
  showInstallBanner.value = false
}

function refreshApp() {
  updateServiceWorker(true)
}

const isOnline = ref(navigator.onLine)
const sidebarVisible = ref(false)
const mobileMenuRef = ref(null)

// Export modal state
const showExportModal = ref(false)
const exportTargetToken = ref(null)

function handleSingleExport(token) {
  exportTargetToken.value = token
  showExportModal.value = true
}

function handleBatchExport() {
  if (store.tokens.length === 0) {
    toast.add({
      severity: 'info',
      summary: '提示',
      detail: '当前没有可以导出的令牌',
      life: 3000
    })
    return
  }
  exportTargetToken.value = null
  showExportModal.value = true
}

function openSidebar() {
  sidebarVisible.value = true
}

function handleScanQr() {
  mobileMenuRef.value?.openQrScanner()
}

function updateOnlineStatus() {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  store.loadFromStorage()
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  
  window.addEventListener('appinstalled', () => {
    showInstallBanner.value = false
    deferredPrompt.value = null
  })
  
  document.dispatchEvent(new Event('app-rendered'))
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})

function handleSaveToken(tokenData) {
  store.addToken(tokenData)
  toast.add({
    severity: 'success',
    summary: '添加成功',
    detail: `已成功录入 ${tokenData.name}`,
    life: 3000
  })
  sidebarVisible.value = false
}

function handleDeleteToken({ token, event }) {
  confirm.require({
    target: event.currentTarget,
    message: `确定要移除 "${token.name}" 吗？`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: '取消',
      severity: 'secondary',
      text: true,
      size: 'small'
    },
    acceptProps: {
      label: '确定移除',
      severity: 'danger',
      size: 'small'
    },
    accept: () => {
      store.deleteToken(token.id)
      toast.add({
        severity: 'success',
        summary: '删除成功',
        detail: `已移除 ${token.name}`,
        life: 3000
      })
    }
  })
}

function handleDeleteAll(event) {
  if (store.tokens.length === 0) {
    toast.add({
      severity: 'info',
      summary: '提示',
      detail: '暂无令牌可删除',
      life: 3000
    })
    return
  }

  confirm.require({
    target: event.currentTarget,
    message: `确定要彻底清空全部 ${store.tokens.length} 个令牌？此操作不可撤销！`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: '取消',
      severity: 'secondary',
      text: true,
      size: 'small'
    },
    acceptProps: {
      label: '彻底清空',
      severity: 'danger',
      size: 'small'
    },
    accept: () => {
      const count = store.tokens.length
      store.deleteAllTokens()
      toast.add({
        severity: 'success',
        summary: '清空成功',
        detail: `已清空 ${count} 个令牌`,
        life: 3000
      })
    }
  })
}

function handleExport() {
  if (store.tokens.length === 0) {
    toast.add({
      severity: 'info',
      summary: '提示',
      detail: '当前没有可以导出的令牌',
      life: 3000
    })
    return
  }

  store.downloadExport()
  toast.add({
    severity: 'success',
    summary: '导出成功',
    detail: `已导出 ${store.tokens.length} 个令牌备份`,
    life: 3000
  })
}
</script>

<template>
  <div class="app-root">
    <!-- Cyber Background glow grids -->
    <div class="cyber-grid"></div>
    <div class="cyber-glow-orb orb-1"></div>
    <div class="cyber-glow-orb orb-2"></div>

    <Toast />
    <ConfirmPopup />

    <!-- PWA Install Banner -->
    <Transition name="slide-down">
      <div v-if="showInstallBanner" class="pwa-banner install-banner">
        <div class="pwa-banner-content">
          <i class="pi pi-download"></i>
          <div class="pwa-banner-text">
            <strong>安装 2FA Sentinel PWA 独立应用</strong>
            <span>支持完全离线在本地安全运行</span>
          </div>
        </div>
        <div class="pwa-banner-actions">
          <Button label="立即安装" size="small" @click="installApp" />
          <Button icon="pi pi-times" text rounded size="small" @click="dismissInstallBanner" />
        </div>
      </div>
    </Transition>

    <TopNav
      :is-online="isOnline"
      @clear-all="handleDeleteAll"
      @export="handleBatchExport"
    />

    <div class="app-layout">
      <div
        v-if="sidebarVisible"
        class="sidebar-overlay"
        @click="sidebarVisible = false"
      ></div>

      <Sidenav
        v-model:visible="sidebarVisible"
        @save="handleSaveToken"
      />

      <main class="app-main">
        <div class="main-content">
          <div class="content-header">
            <div class="header-badge">
              <span class="live-dot"></span>
              <span>ZERO-KNOWLEDGE AUTH ENGINE</span>
            </div>
            <h2 class="page-title">动态身份令牌</h2>
            <p class="page-subtitle">RFC 6238 TOTP 纯本地高安全计算引擎 · 支持 WebDAV 云备份</p>
          </div>

          <TokenList
            :tokens="store.tokens"
            @delete="handleDeleteToken"
            @export="handleSingleExport"
            @add-token="openSidebar"
            @scan-qr="handleScanQr"
          />
        </div>
      </main>

      <!-- Mobile Menu -->
      <MobileMenu
        ref="mobileMenuRef"
        @open-sidebar="openSidebar"
        @export="handleBatchExport"
        @clear-all="handleDeleteAll"
      />

      <!-- Single & Batch Export Modal -->
      <ExportModal
        v-model:visible="showExportModal"
        :single-token="exportTargetToken"
      />
    </div>
  </div>
</template>

<style>
/* Global Cyber Dark Theme */
* {
  box-sizing: border-box;
}

:root {
  color-scheme: dark;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #090a0f;
  color: #f1f5f9;
  min-height: 100vh;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Toast dark styling */
.p-toast {
  max-width: calc(100vw - 2rem);
  width: auto;
}

.p-toast .p-toast-message {
  background: rgba(15, 23, 42, 0.95) !important;
  border: 1px solid rgba(56, 189, 248, 0.3) !important;
  backdrop-filter: blur(12px) !important;
  color: #f8fafc !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6) !important;
}

.p-confirmpopup {
  background: rgba(15, 23, 42, 0.95) !important;
  border: 1px solid rgba(56, 189, 248, 0.25) !important;
  backdrop-filter: blur(16px) !important;
  color: #f8fafc !important;
  border-radius: 12px !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7) !important;
}

.p-confirmpopup .p-confirmpopup-content {
  color: #cbd5e1 !important;
  padding: 1rem !important;
}

/* PrimeVue dark input text styling */
.p-inputtext {
  background: rgba(15, 23, 42, 0.8) !important;
  border: 1px solid rgba(59, 130, 246, 0.25) !important;
  color: #f8fafc !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.p-inputtext:focus {
  border-color: #38bdf8 !important;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.25) !important;
}

.p-select {
  background: rgba(15, 23, 42, 0.8) !important;
  border: 1px solid rgba(59, 130, 246, 0.25) !important;
  color: #f8fafc !important;
  border-radius: 8px !important;
}

.p-dialog {
  background: rgba(15, 23, 42, 0.95) !important;
  border: 1px solid rgba(56, 189, 248, 0.25) !important;
  backdrop-filter: blur(20px) !important;
  color: #f8fafc !important;
  border-radius: 16px !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8) !important;
}

.p-dialog-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #f8fafc !important;
}
</style>

<style scoped>
.app-root {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #090a0f;
  z-index: 1;
}

/* Cyber background elements */
.cyber-grid {
  position: fixed;
  inset: 0;
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
  z-index: 0;
}

.cyber-glow-orb {
  position: fixed;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  filter: blur(140px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.25;
}

.orb-1 {
  top: -100px;
  right: -100px;
  background: radial-gradient(circle, #0284c7, transparent 70%);
}

.orb-2 {
  bottom: -150px;
  left: -150px;
  background: radial-gradient(circle, #6366f1, transparent 70%);
}

.app-layout {
  display: flex;
  flex: 1;
  position: relative;
  z-index: 1;
}

.app-main {
  flex: 1;
  overflow-y: auto;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
}

.content-header {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.65rem;
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 20px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 700;
  color: #38bdf8;
  letter-spacing: 0.08em;
  width: fit-content;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
}

.page-title {
  margin: 0.25rem 0 0;
  font-size: 1.85rem;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #94a3b8;
}

/* PWA Banner */
.pwa-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(90deg, rgba(14, 165, 233, 0.9), rgba(59, 130, 246, 0.9));
  color: white;
  z-index: 1001;
}

.pwa-banner-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pwa-banner-text {
  display: flex;
  flex-direction: column;
}

.pwa-banner-text strong {
  font-size: 0.85rem;
}

.pwa-banner-text span {
  font-size: 0.75rem;
  opacity: 0.9;
}

.pwa-banner-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 1024px) {
  .app-layout {
    flex-direction: column;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 998;
  }

  .main-content {
    padding: 1.5rem 1rem;
  }
}
</style>