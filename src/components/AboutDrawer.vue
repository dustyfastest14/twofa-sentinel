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
        aria-label="关闭"
      />

      <div class="about-logo">
        <div class="logo-shield">
          <i class="pi pi-shield"></i>
        </div>
        <h2>2FA SENTINEL</h2>
        <span class="version-tag">v2.0 // WebDAV Edition</span>
      </div>
      
      <p class="about-description">
        一个现代极客风、高安全隐私的 2FA 身份验证器，完全在您的浏览器本地离线生成基于时间的一次性密码 (TOTP)，并支持 WebDAV 云端一键备份。
      </p>
      
      <div class="about-features">
        <h3>核心特性</h3>
        <ul>
          <li><i class="pi pi-lock"></i> 100% 离线计算</li>
          <li><i class="pi pi-cloud"></i> WebDAV 跨端同步</li>
          <li><i class="pi pi-camera"></i> 二维码极速扫码</li>
          <li><i class="pi pi-share-alt"></i> 单条导出 (二维码/URI)</li>
          <li><i class="pi pi-download"></i> 批量多选自由导出</li>
          <li><i class="pi pi-shield"></i> 本地持久化储存</li>
          <li><i class="pi pi-mobile"></i> 支持全平台 PWA</li>
        </ul>
      </div>
      
      <div class="about-security">
        <i class="pi pi-verified"></i>
        <p>
          零知识架构：所有密钥与令牌均安全留存于本地设备，绝不向任何第三方服务上报私密数据。
        </p>
      </div>
    </div>
  </Drawer>
</template>

<style>
/* About Drawer dark styles */
.about-drawer.p-drawer {
  width: 360px !important;
  background: rgba(13, 16, 25, 0.98) !important;
  border-left: 1px solid rgba(59, 130, 246, 0.2) !important;
  backdrop-filter: blur(20px) !important;
  color: #f8fafc !important;
}

.about-drawer .p-drawer-header {
  display: none;
}

.about-drawer .p-drawer-content {
  padding: 0;
  position: relative;
}

.about-content {
  padding: 2rem 1.5rem;
}

.about-drawer .close-btn {
  position: absolute !important;
  top: 1rem !important;
  right: 1rem !important;
  color: #64748b !important;
}

.about-drawer .close-btn:hover {
  color: #f8fafc !important;
  background: rgba(255, 255, 255, 0.05) !important;
}

.about-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  margin-top: 1rem;
}

.logo-shield {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(59, 130, 246, 0.2));
  border: 1px solid rgba(56, 189, 248, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  font-size: 1.75rem;
  box-shadow: 0 0 24px rgba(56, 189, 248, 0.3);
}

.about-logo h2 {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #f8fafc;
}

.version-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: #38bdf8;
  letter-spacing: 0.1em;
}

.about-description {
  text-align: center;
  font-size: 0.85rem;
  line-height: 1.6;
  color: #94a3b8;
  margin: 0 0 1.5rem;
}

.about-features {
  margin-bottom: 1.5rem;
}

.about-features h3 {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #cbd5e1;
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
  padding: 0.5rem 0.65rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  font-size: 0.75rem;
  color: #cbd5e1;
}

.about-features li i {
  font-size: 0.8rem;
  color: #38bdf8;
}

.about-security {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
}

.about-security i {
  font-size: 1.25rem;
  color: #10b981;
  flex-shrink: 0;
}

.about-security p {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.5;
  color: #a7f3d0;
}

@media (max-width: 768px) {
  .about-drawer.p-drawer {
    width: 100% !important;
  }
}
</style>