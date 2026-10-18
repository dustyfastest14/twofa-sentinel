<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import ImportUpload from './ImportUpload.vue'
import AboutDrawer from './AboutDrawer.vue'
import WebdavModal from './WebdavModal.vue'

const emit = defineEmits(['clear-all', 'export'])

const showAboutDrawer = ref(false)
const showWebdavModal = ref(false)
</script>

<template>
  <nav class="top-nav">
    <div class="nav-content">
      <div class="nav-brand">
        <div class="brand-badge">
          <i class="pi pi-shield"></i>
        </div>
        <div class="brand-text">
          <span class="brand-name">2FA SENTINEL</span>
          <span class="brand-tag">LOCAL // E2EE</span>
        </div>
      </div>

      <div class="nav-actions desktop-only">
        <Button
          label="WebDAV 云同步"
          icon="pi pi-cloud"
          class="cyber-btn cyber-btn-primary"
          size="small"
          @click="showWebdavModal = true"
        />
        <Button
          label="导出备份"
          icon="pi pi-download"
          class="cyber-btn"
          size="small"
          @click="emit('export')"
        />
        <ImportUpload />
        <Button
          label="清空"
          icon="pi pi-trash"
          class="cyber-btn cyber-btn-danger"
          size="small"
          @click="(e) => emit('clear-all', e)"
        />
      </div>

      <!-- About button -->
      <Button
        icon="pi pi-info-circle"
        label="关于"
        text
        size="small"
        class="about-btn"
        @click="showAboutDrawer = true"
      />
    </div>
  </nav>

  <!-- About Drawer -->
  <AboutDrawer v-model:visible="showAboutDrawer" />

  <!-- WebDAV Modal -->
  <WebdavModal v-model:visible="showWebdavModal" />
</template>

<style scoped>
.top-nav {
  background: rgba(10, 12, 18, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(59, 130, 246, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.75rem;
  height: 64px;
  gap: 1rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-badge {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
  border: 1px solid rgba(56, 189, 248, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  font-size: 1rem;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: 0.08em;
  background: linear-gradient(90deg, #ffffff, #93c5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-tag {
  font-size: 0.55rem;
  font-family: 'JetBrains Mono', monospace;
  color: #38bdf8;
  letter-spacing: 0.12em;
  font-weight: 700;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.cyber-btn {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #cbd5e1 !important;
  font-size: 0.8125rem !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  padding: 0.45rem 0.85rem !important;
  transition: all 0.2s ease !important;
}

.cyber-btn:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

.cyber-btn-primary {
  background: rgba(14, 165, 233, 0.15) !important;
  border-color: rgba(56, 189, 248, 0.35) !important;
  color: #38bdf8 !important;
}

.cyber-btn-primary:hover {
  background: rgba(14, 165, 233, 0.25) !important;
  border-color: rgba(56, 189, 248, 0.6) !important;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.3) !important;
}

.cyber-btn-danger:hover {
  background: rgba(239, 68, 68, 0.15) !important;
  border-color: rgba(239, 68, 68, 0.4) !important;
  color: #f87171 !important;
}

.about-btn {
  color: #94a3b8 !important;
}

.about-btn:hover {
  background: rgba(255, 255, 255, 0.06) !important;
  color: #ffffff !important;
}

@media (max-width: 1024px) {
  .desktop-only {
    display: none;
  }
}
</style>