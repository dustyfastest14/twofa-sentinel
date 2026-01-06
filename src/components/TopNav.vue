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
        <a
          href="https://github.com/maurocasas/twofa.dev"
          target="_blank"
          rel="noopener noreferrer"
          class="github-link"
          aria-label="View on GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
          </svg>
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

.twitter-link,
.github-link {
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

.github-link:hover {
  background: #27272a;
  color: #fafafa;
}

.twitter-link i {
  font-size: 1rem;
}

.github-link svg {
  width: 1rem;
  height: 1rem;
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
