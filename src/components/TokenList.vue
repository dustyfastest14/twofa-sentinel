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

const emit = defineEmits(['edit', 'delete', 'export', 'add-token', 'scan-qr'])

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
        @export="emit('export', $event)"
      />
    </div>
    
    <div v-else class="empty-state">
      <div class="empty-content">
        <div class="empty-radar">
          <div class="radar-sweep"></div>
          <i class="pi pi-shield"></i>
        </div>
        <h3 class="empty-title">安全库就绪 · 暂无令牌</h3>
        <p class="empty-description">点击添加或扫描二维码，录入您的首个动态 2FA 令牌</p>
        
        <div class="empty-actions mobile-only">
          <Button
            label="手动录入令牌"
            icon="pi pi-plus"
            size="small"
            class="cyber-empty-btn"
            @click="emit('add-token')"
          />
          <Button
            label="扫描 2FA 二维码"
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
  min-height: 420px;
  padding: 3rem 1rem;
}

.empty-content {
  text-align: center;
  max-width: 360px;
}

.empty-radar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(15, 23, 42, 0.4) 100%);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 50%;
  margin-bottom: 1.75rem;
  box-shadow: 0 0 30px rgba(56, 189, 248, 0.15);
}

.empty-radar i {
  font-size: 2.25rem;
  color: #38bdf8;
  z-index: 1;
}

.empty-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.01em;
}

.empty-description {
  margin: 0 0 1.5rem;
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
}

.empty-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cyber-empty-btn {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%) !important;
  border-color: rgba(56, 189, 248, 0.4) !important;
  color: white !important;
}

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