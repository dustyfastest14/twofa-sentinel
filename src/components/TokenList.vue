<script setup>
import { computed } from 'vue'
import TokenCard from './TokenCard.vue'
import Button from 'primevue/button'

const props = defineProps({
  tokens: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete', 'add-token', 'scan-qr'])

const hasTokens = computed(() => props.tokens.length > 0)
</script>

<template>
  <div class="token-list">
    <div v-if="hasTokens" class="token-grid">
      <TokenCard
        v-for="token in tokens"
        :key="token.id"
        :token="token"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
    
    <div v-else class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">
          <i class="pi pi-key"></i>
        </div>
        <h3 class="empty-title">No tokens yet</h3>
        <p class="empty-description">Add your first TOTP token to get started.</p>
        
        <div class="empty-actions mobile-only">
          <Button
            label="Add Token"
            icon="pi pi-plus"
            size="small"
            @click="emit('add-token')"
          />
          <Button
            label="Scan QR"
            icon="pi pi-camera"
            severity="secondary"
            outlined
            size="small"
            @click="emit('scan-qr')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.token-list {
  width: 100%;
}

.token-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
  padding: 0;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 3rem 1rem;
}

.empty-content {
  text-align: center;
  max-width: 320px;
}

.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 50%;
  margin-bottom: 1.5rem;
}

.empty-icon i {
  font-size: 2rem;
  color: #3b82f6;
}

.empty-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #18181b;
}

.empty-description {
  margin: 0 0 1.5rem;
  font-size: 0.875rem;
  color: #71717a;
}

.empty-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-actions :deep(.p-button) {
  justify-content: center;
}

/* Hide on desktop, show on mobile */
.mobile-only {
  display: none;
}

@media (max-width: 1024px) {
  .mobile-only {
    display: flex;
  }
}

@media (max-width: 768px) {
  .token-grid {
    grid-template-columns: 1fr;
  }
}
</style>

