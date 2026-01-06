<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTokenStore } from '@/stores/tokenStore.js'
import { useToast } from 'primevue/usetoast'
import { eventBus } from '@/utils/eventBus.js'
import Button from 'primevue/button'

defineProps({
  showButton: {
    type: Boolean,
    default: true
  }
})

const store = useTokenStore()
const toast = useToast()

// Native file input ref - most reliable way to trigger file picker
const fileInputRef = ref(null)

// Handle file selection
function onFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const count = store.importTokens(e.target.result, false)
      toast.add({
        severity: 'success',
        summary: 'Import Complete',
        detail: `${count} tokens imported`,
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Import Failed',
        detail: error.message || 'Invalid file format',
        life: 5000
      })
    }
  }
  reader.readAsText(file)
  
  // Reset input so same file can be selected again
  event.target.value = ''
}

// Trigger file picker programmatically
function openFilePicker() {
  fileInputRef.value?.click()
}

// Listen for import trigger events from the event bus
onMounted(() => {
  eventBus.on('trigger-import', openFilePicker)
})

onUnmounted(() => {
  eventBus.off('trigger-import', openFilePicker)
})

defineExpose({
  openFilePicker
})
</script>

<template>
  <!-- Hidden native file input - reliable cross-browser -->
  <input
    ref="fileInputRef"
    type="file"
    accept=".json"
    class="hidden-input"
    @change="onFileSelect"
  />
  
  <!-- Styled button matching PrimeVue secondary style -->
  <Button
    v-if="showButton"
    label="Import"
    icon="pi pi-upload"
    size="small"
    text
    class="import-btn"
    @click="openFilePicker"
  />
</template>

<style scoped>
.hidden-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.import-btn {
  font-size: 0.8125rem;
  padding: 0.5rem 0.75rem;
  transition: all 0.15s ease;
}
</style>
