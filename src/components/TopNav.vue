<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import ImportUpload from './ImportUpload.vue'
import AboutDrawer from './AboutDrawer.vue'

const emit = defineEmits(['clear-all', 'export'])

// About drawer state
const showAboutDrawer = ref(false)
</script>

<template>
  <nav class="top-nav">
    <div class="nav-content">
      <div class="nav-brand">
        <i class="pi pi-lock"></i>
        <span class="brand-name">twofa.dev</span>
        <a
          href="https://twitter.com/maurohouseless"
          target="_blank"
          rel="noopener noreferrer"
          class="twitter-link"
          aria-label="Follow on Twitter"
        >
          <i class="pi pi-twitter"></i>
        </a>
      </div>

      <div class="nav-actions desktop-only">
        <Button
          label="Clear All"
          icon="pi pi-trash"
          text
          size="small"
          @click="(e) => emit('clear-all', e)"
        />
        <Button
          label="Export"
          icon="pi pi-download"
          text
          size="small"
          @click="emit('export')"
        />
        <ImportUpload />
      </div>

      <!-- About button - always visible -->
      <Button
        icon="pi pi-info-circle"
        label="About"
        text
        size="small"
        class="about-btn"
        @click="showAboutDrawer = true"
      />
    </div>
  </nav>

  <!-- About Drawer -->
  <AboutDrawer v-model:visible="showAboutDrawer" />
</template>

<style scoped>
.top-nav {
  background: #18181b;
  border-bottom: 1px solid #27272a;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 64px;
  gap: 1rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.nav-brand i {
  font-size: 1.125rem;
  color: #a1a1aa;
}

.brand-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #fafafa;
  letter-spacing: -0.01em;
}

.twitter-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: #71717a;
  text-decoration: none;
  transition: all 0.15s ease;
  margin-left: 0.5rem;
}

.twitter-link:hover {
  background: #27272a;
  color: #1da1f2;
}

.twitter-link i {
  font-size: 1rem;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Small button sizing */
.nav-actions :deep(.p-button) {
  color: #d4d4d8;
  font-size: 0.8125rem;
  padding: 0.5rem 0.75rem;
}

.nav-actions :deep(.p-button:hover) {
  background: #27272a;
  color: #fafafa;
}

/* About button - always visible, pushed to right */
.about-btn {
  flex-shrink: 0;
  color: #a1a1aa !important;
}

.about-btn:hover {
  background: #27272a !important;
  color: #fafafa !important;
}

@media (max-width: 1024px) {
  .desktop-only {
    display: none;
  }
}

@media (max-width: 768px) {
  .nav-content {
    padding: 0 1rem;
  }

  .brand-name {
    font-size: 0.875rem;
  }
}
</style>
