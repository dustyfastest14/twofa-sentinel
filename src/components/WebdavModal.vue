<script setup>
import { ref, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useTokenStore } from '@/stores/tokenStore.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible'])

const store = useTokenStore()
const toast = useToast()

const webdavConfig = ref({
  url: '',
  username: '',
  password: '',
  filePath: '/twofa_backup.json'
})

const isSyncing = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('twofa_webdav_config')
  if (saved) {
    try {
      webdavConfig.value = { ...webdavConfig.value, ...JSON.parse(saved) }
    } catch (e) {}
  }
})

function saveConfig() {
  localStorage.setItem('twofa_webdav_config', JSON.stringify(webdavConfig.value))
}

function getFullUrl() {
  let base = webdavConfig.value.url.trim().replace(/\/+$/, '')
  let path = webdavConfig.value.filePath.trim()
  if (!path.startsWith('/')) path = '/' + path
  return base + path
}

function getAuthHeader() {
  const { username, password } = webdavConfig.value
  if (!username && !password) return null
  return 'Basic ' + btoa(unescape(encodeURIComponent(`${username}:${password}`)))
}

async function uploadToWebdav() {
  if (!webdavConfig.value.url) {
    toast.add({ severity: 'warn', summary: '提示', detail: '请先填写 WebDAV 服务器地址', life: 3000 })
    return
  }
  saveConfig()
  isSyncing.value = true

  try {
    const fullUrl = getFullUrl()
    const authHeader = getAuthHeader()
    const content = JSON.stringify(store.tokens, null, 2)

    const headers = {
      'Content-Type': 'application/json',
      'X-Webdav-Url': fullUrl
    }
    if (authHeader) headers['Authorization'] = authHeader

    const resp = await fetch('/api/webdav', {
      method: 'PUT',
      headers,
      body: content
    })

    if (resp.status >= 200 && resp.status < 300) {
      toast.add({ severity: 'success', summary: '云备份成功', detail: `已将 ${store.tokens.length} 个令牌安全同步到 WebDAV`, life: 3000 })
    } else {
      const errText = await resp.text()
      throw new Error(`HTTP ${resp.status}: ${errText || '上传失败'}`)
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: '备份失败', detail: err.message || '网络或鉴权错误', life: 5000 })
  } finally {
    isSyncing.value = false
  }
}

async function downloadFromWebdav() {
  if (!webdavConfig.value.url) {
    toast.add({ severity: 'warn', summary: '提示', detail: '请先填写 WebDAV 服务器地址', life: 3000 })
    return
  }
  saveConfig()
  isSyncing.value = true

  try {
    const fullUrl = getFullUrl()
    const authHeader = getAuthHeader()

    const headers = {
      'X-Webdav-Url': fullUrl
    }
    if (authHeader) headers['Authorization'] = authHeader

    const resp = await fetch('/api/webdav', {
      method: 'GET',
      headers
    })

    if (resp.status >= 200 && resp.status < 300) {
      const text = await resp.text()
      const count = store.importTokens(text, false)
      toast.add({ severity: 'success', summary: '恢复成功', detail: `已从云端完整拉取 ${count} 个令牌`, life: 3000 })
      emit('update:visible', false)
    } else if (resp.status === 404) {
      throw new Error('云端暂无备份文件，请先点击【立即备份到云盘】')
    } else {
      const errText = await resp.text()
      throw new Error(`HTTP ${resp.status}: ${errText || '下载失败'}`)
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: '同步失败', detail: err.message || '网络或数据解析错误', life: 5000 })
  } finally {
    isSyncing.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    modal
    :style="{ width: '92vw', maxWidth: '480px' }"
  >
    <template #header>
      <div class="dialog-title">
        <i class="pi pi-cloud"></i>
        <span>WebDAV 跨端云备份</span>
      </div>
    </template>

    <div class="webdav-box">
      <div class="form-group">
        <label>WebDAV 服务器地址</label>
        <InputText
          v-model="webdavConfig.url"
          placeholder="例如：https://dav.jianguoyun.com/dav/"
          class="w-full"
          size="small"
        />
        <span class="sub-hint">支持坚果云、Alist、群晖、Nextcloud 等标准 WebDAV</span>
      </div>

      <div class="form-row">
        <div class="form-group flex-1">
          <label>账号 / 邮箱</label>
          <InputText
            v-model="webdavConfig.username"
            placeholder="账号 / 邮箱"
            class="w-full"
            size="small"
          />
        </div>
        <div class="form-group flex-1">
          <label>密码 / 应用密码</label>
          <Password
            v-model="webdavConfig.password"
            :feedback="false"
            toggleMask
            placeholder="WebDAV 密码"
            class="w-full"
            size="small"
          />
        </div>
      </div>

      <div class="form-group">
        <label>备份路径</label>
        <InputText
          v-model="webdavConfig.filePath"
          placeholder="/twofa_backup.json"
          class="w-full"
          size="small"
        />
      </div>

      <div class="btn-group">
        <Button
          label="立即备份至云盘 (上传)"
          icon="pi pi-cloud-upload"
          class="cyber-upload-btn"
          :loading="isSyncing"
          @click="uploadToWebdav"
          size="small"
        />
        <Button
          label="从云盘恢复数据 (下载)"
          icon="pi pi-cloud-download"
          class="cyber-download-btn"
          :loading="isSyncing"
          @click="downloadFromWebdav"
          size="small"
        />
      </div>

      <div class="security-card">
        <i class="pi pi-lock"></i>
        <p>配置仅保存在本地设备中。直连穿透由 Cloudflare Edge 安全代理，不落地存储任何密钥。</p>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.dialog-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: #38bdf8;
}

.webdav-box {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  padding-top: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #cbd5e1;
}

.sub-hint {
  font-size: 0.7rem;
  color: #64748b;
}

.form-row {
  display: flex;
  gap: 0.75rem;
}

.flex-1 {
  flex: 1;
}

.w-full {
  width: 100%;
}

.btn-group {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.cyber-upload-btn {
  flex: 1;
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%) !important;
  border: 1px solid rgba(56, 189, 248, 0.4) !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  padding: 0.6rem !important;
}

.cyber-download-btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: #e2e8f0 !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  padding: 0.6rem !important;
}

.cyber-download-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.security-card {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  padding: 0.85rem;
  background: rgba(14, 165, 233, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 10px;
}

.security-card i {
  color: #38bdf8;
  font-size: 0.9rem;
  margin-top: 0.15rem;
}

.security-card p {
  margin: 0;
  font-size: 0.75rem;
  color: #94a3b8;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .form-row, .btn-group {
    flex-direction: column;
  }
}
</style>