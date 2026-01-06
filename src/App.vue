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

const store = useTokenStore()
const confirm = useConfirm()
const toast = useToast()

// PWA Install prompt
const deferredPrompt = ref(null)
const showInstallBanner = ref(false)

// PWA Service Worker registration
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

// Check if device is mobile
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= 1024
}

// Handle PWA install prompt (desktop only)
function handleBeforeInstallPrompt(e) {
  // Prevent the mini-infobar from appearing
  e.preventDefault()
  
  // Only show install banner on desktop
  if (isMobileDevice()) {
    return
  }
  
  // Stash the event so it can be triggered later
  deferredPrompt.value = e
  // Show install banner
  showInstallBanner.value = true
}

async function installApp() {
  if (!deferredPrompt.value) return
  
  // Show the install prompt
  deferredPrompt.value.prompt()
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.value.userChoice
  
  if (outcome === 'accepted') {
    toast.add({
      severity: 'success',
      summary: 'App Installed',
      detail: 'twofa.dev has been installed',
      life: 3000
    })
  }
  
  // Clear the deferred prompt
  deferredPrompt.value = null
  showInstallBanner.value = false
}

function dismissInstallBanner() {
  showInstallBanner.value = false
}

function refreshApp() {
  updateServiceWorker(true)
}

// Offline status
const isOnline = ref(navigator.onLine)

// Mobile sidebar state
const sidebarVisible = ref(false)

// Mobile menu ref
const mobileMenuRef = ref(null)

function openSidebar() {
  sidebarVisible.value = true
}

function handleScanQr() {
  mobileMenuRef.value?.openQrScanner()
}

function updateOnlineStatus() {
  isOnline.value = navigator.onLine
}

// Initialize store from localStorage
onMounted(() => {
  store.loadFromStorage()
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  
  // Handle app installed event
  window.addEventListener('appinstalled', () => {
    showInstallBanner.value = false
    deferredPrompt.value = null
  })
  
  // Dispatch event for prerendering (signals app is ready)
  document.dispatchEvent(new Event('app-rendered'))
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})

// Save token (add from sidebar)
function handleSaveToken(tokenData) {
  store.addToken(tokenData)
  toast.add({
    severity: 'success',
    summary: 'Token Added',
    detail: `${tokenData.name} has been added`,
    life: 3000
  })
  sidebarVisible.value = false
}

// Delete single token
function handleDeleteToken({ token, event }) {
  confirm.require({
    target: event.currentTarget,
    message: `Delete "${token.name}"?`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      text: true,
      size: 'small'
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger',
      size: 'small'
    },
    accept: () => {
      store.deleteToken(token.id)
      toast.add({
        severity: 'success',
        summary: 'Token Deleted',
        detail: `${token.name} has been deleted`,
        life: 3000
      })
    }
  })
}

// Delete all tokens
function handleDeleteAll(event) {
  if (store.tokens.length === 0) {
    toast.add({
      severity: 'info',
      summary: 'No Tokens',
      detail: 'There are no tokens to delete',
      life: 3000
    })
    return
  }

  confirm.require({
    target: event.currentTarget,
    message: `Delete all ${store.tokens.length} tokens?`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      text: true,
      size: 'small'
    },
    acceptProps: {
      label: 'Delete All',
      severity: 'danger',
      size: 'small'
    },
    accept: () => {
      const count = store.tokens.length
      store.deleteAllTokens()
      toast.add({
        severity: 'success',
        summary: 'All Tokens Deleted',
        detail: `${count} tokens have been deleted`,
        life: 3000
      })
    }
  })
}

// Export tokens
function handleExport() {
  if (store.tokens.length === 0) {
    toast.add({
      severity: 'info',
      summary: 'No Tokens',
      detail: 'There are no tokens to export',
      life: 3000
    })
    return
  }

  store.downloadExport()
  toast.add({
    severity: 'success',
    summary: 'Export Complete',
    detail: `${store.tokens.length} tokens exported`,
    life: 3000
  })
}

</script>

<template>
  <div class="app">
    <Toast />
    <ConfirmPopup />

    <!-- PWA Install Banner -->
    <Transition name="slide-down">
      <div v-if="showInstallBanner" class="pwa-banner install-banner">
        <div class="pwa-banner-content">
          <i class="pi pi-download"></i>
          <div class="pwa-banner-text">
            <strong>Install twofa.dev</strong>
            <span>Use this app offline on your device</span>
          </div>
        </div>
        <div class="pwa-banner-actions">
          <Button
            label="Install"
            size="small"
            @click="installApp"
          />
          <Button
            icon="pi pi-times"
            text
            rounded
            size="small"
            @click="dismissInstallBanner"
            aria-label="Dismiss"
          />
        </div>
      </div>
    </Transition>

    <!-- PWA Update Available Banner -->
    <Transition name="slide-down">
      <div v-if="needRefresh" class="pwa-banner update-banner">
        <div class="pwa-banner-content">
          <i class="pi pi-refresh"></i>
          <div class="pwa-banner-text">
            <strong>Update Available</strong>
            <span>A new version is ready to install</span>
          </div>
        </div>
        <div class="pwa-banner-actions">
          <Button
            label="Update Now"
            size="small"
            @click="refreshApp"
          />
        </div>
      </div>
    </Transition>

    <TopNav
      :is-online="isOnline"
      @clear-all="handleDeleteAll"
      @export="handleExport"
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
            <h2 class="page-title">Your Tokens</h2>
            <p class="page-subtitle">Manage and view your TOTP authentication codes</p>
          </div>

          <TokenList
            :tokens="store.tokens"
            @delete="handleDeleteToken"
            @add-token="openSidebar"
            @scan-qr="handleScanQr"
          />
        </div>
      </main>

      <!-- Mobile Menu -->
      <MobileMenu
        ref="mobileMenuRef"
        @open-sidebar="openSidebar"
        @export="handleExport"
        @clear-all="handleDeleteAll"
      />
    </div>
  </div>
</template>

<style>
/* Global styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #fafafa;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Toast styling - constrain width */
.p-toast {
  max-width: calc(100vw - 2rem);
  width: auto;
}

.p-toast .p-toast-message {
  max-width: 320px;
  width: 100%;
}

@media (max-width: 480px) {
  .p-toast {
    left: 1rem !important;
    right: 1rem !important;
    width: auto !important;
  }
  
  .p-toast .p-toast-message {
    max-width: 100%;
  }
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* PWA Banners */
.pwa-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.5rem;
  gap: 1rem;
  z-index: 1001;
}

.install-banner {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.update-banner {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.pwa-banner-content {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.pwa-banner-content > i {
  font-size: 1.25rem;
}

.pwa-banner-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.pwa-banner-text strong {
  font-size: 0.875rem;
  font-weight: 600;
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

.pwa-banner-actions :deep(.p-button) {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.pwa-banner-actions :deep(.p-button:hover) {
  background: rgba(255, 255, 255, 0.3);
}

.pwa-banner-actions :deep(.p-button.p-button-text) {
  background: transparent;
  border: none;
  color: white;
}

.pwa-banner-actions :deep(.p-button.p-button-text:hover) {
  background: rgba(255, 255, 255, 0.15);
}

/* Banner transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

@media (max-width: 640px) {
  .pwa-banner {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
    gap: 0.75rem;
  }

  .pwa-banner-actions {
    justify-content: flex-end;
  }
}

.app-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.sidebar-overlay {
  display: none;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  background: #fafafa;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.content-header {
  margin-bottom: 2rem;
}

.page-title {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #18181b;
}

.page-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #71717a;
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
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }

  .main-content {
    padding: 1.5rem;
  }
}


@media (max-width: 640px) {
  .main-content {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
