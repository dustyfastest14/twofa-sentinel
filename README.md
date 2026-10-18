# 2FA Sentinel 🛡️

现代暗黑科技风 TOTP 2FA 离线验证器，支持 WebDAV 云端一键备份。

基于开源项目 [twofa.dev](https://github.com/maurocasas/twofa.dev) 深度二次开发重构。

---

## ✨ 核心特性

- 🔒 **100% 离线计算**：基于原生 Web Crypto API，断网依然秒级生成 TOTP 动态验证码。
- ☁️ **WebDAV 云端同步**：支持坚果云、Alist、Nextcloud、群晖等任意标准 WebDAV 服务，一键安全上传与恢复。
- ⚡ **无跨域阻碍**：基于 Cloudflare Pages Functions 代理穿透，解决纯前端 WebDAV 跨域 (CORS) 限制。
- 🎨 **极客暗黑科技视觉**：全套 Cyberpunk 深色毛玻璃 UI、动态环形霓虹雷达倒计时、JetBrains Mono 专属字体。
- 📱 **PWA 桌面/移动双端支持**：可直接“添加到主屏幕”作为独立无边框 App 使用。
- 📷 **二维码极速扫码**：手机或自带摄像头设备支持一键扫描添加 2FA 密钥。
- 📤 **自由导入/导出**：支持标准 JSON 备份文件迁移，不被任何平台锁定。

---

## 🛠️ 本地开发与构建

### 环境要求
- Node.js `>= 20`
- npm

### 安装运行
```bash
git clone https://github.com/dustyfastest14/twofa-sentinel.git
cd twofa-sentinel

# 安装依赖
npm install

# 本地调试
npm run dev

# 生产环境打包
npm run build
```

---

## 🚀 部署至 Cloudflare Pages

本项目天然支持部署到 Cloudflare Pages：
1. 在 Cloudflare 控制台选择 **Workers 和 Pages** -> **创建应用程序** -> **Pages** -> **连接到 Git**。
2. 选择本仓库：`dustyfastest14/twofa-sentinel`。
3. 构建配置：
   - **构建命令**：`npm run build`
   - **输出目录**：`dist`
4. 点击部署即可完成上线！
