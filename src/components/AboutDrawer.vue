<script setup>
import { toRef } from 'vue'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible'])

function closeDrawer() {
  emit('update:visible', false)
}
</script>

<template>
  <Drawer 
    :visible="props.visible" 
    @update:visible="emit('update:visible', $event)"
    position="right" 
    class="about-drawer"
    :showHeader="false"
  >
    <div class="about-content">
      <!-- Close button -->
      <Button
        icon="pi pi-times"
        text
        rounded
        class="close-btn"
        @click="closeDrawer"
        aria-label="Close"
      />

      <div class="about-logo">
        <img src="/icon.svg" alt="twofa.dev" class="app-icon" />
        <h2>twofa.dev</h2>
      </div>
      
      <p class="about-description">
        A secure, privacy-focused authenticator app that generates Time-based One-Time Passwords (TOTP) 
        completely offline in your browser.
      </p>
      
      <div class="about-features">
        <h3>Features</h3>
        <ul>
          <li><i class="pi pi-lock"></i> 100% offline &amp; private</li>
          <li><i class="pi pi-mobile"></i> Works on any device</li>
          <li><i class="pi pi-camera"></i> QR code scanning</li>
          <li><i class="pi pi-download"></i> Import/Export tokens</li>
          <li><i class="pi pi-shield"></i> Local storage only</li>
        </ul>
      </div>
      
      <div class="about-security">
        <i class="pi pi-verified"></i>
        <p>
          All your tokens are stored securely in your browser's local storage. 
          No data is ever sent to any server.
        </p>
      </div>
      
      <div class="about-credits">
        <a 
          href="https://twitter.com/maurohouseless" 
          target="_blank" 
          rel="noopener noreferrer"
          class="credit-link"
        >
          Made by @maurohouseless
        </a>
      </div>
    </div>
  </Drawer>
</template>

<style>
/* About Drawer styles */
.about-drawer.p-drawer {
  width: 360px !important;
}

.about-drawer .p-drawer-header {
  display: none;
}

.about-drawer .p-drawer-content {
  padding: 0;
  position: relative;
}

.about-content {
  padding: 1.5rem;
}

.about-drawer .close-btn {
  position: absolute !important;
  top: 0.75rem !important;
  right: 0.75rem !important;
  left: auto !important;
  color: #71717a !important;
  width: 2rem !important;
  height: 2rem !important;
  z-index: 1;
}

.close-btn:hover {
  background: #f4f4f5 !important;
  color: #18181b !important;
}

.about-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  margin-top: 1rem;
}

.about-logo .app-icon {
  width: 64px;
  height: 64px;
}

.about-logo h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #18181b;
}

.about-description {
  text-align: center;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #3f3f46;
  margin: 0 0 1.5rem;
}

.about-features {
  margin-bottom: 1.5rem;
}

.about-features h3 {
  margin: 0 0 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #71717a;
}

.about-features ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.about-features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #3f3f46;
}

.about-features li i {
  font-size: 0.875rem;
  color: #3b82f6;
}

.about-security {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.about-security i {
  font-size: 1.25rem;
  color: #22c55e;
  flex-shrink: 0;
}

.about-security p {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: #166534;
}

.about-credits {
  text-align: center;
}

.credit-link {
  font-size: 0.875rem;
  color: #71717a;
  text-decoration: none;
  transition: color 0.2s ease;
}

.credit-link:hover {
  color: #3b82f6;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .about-drawer.p-drawer {
    width: 100% !important;
  }
}
</style>

