# twofa.dev

A free, open-source, offline TOTP (Time-based One-Time Password) authenticator that runs entirely in your browser. Generate secure 2FA codes without internet connection, no account required, and no data sent to servers.

## What It Does

twofa.dev is a Progressive Web App (PWA) that generates TOTP authentication codes for two-factor authentication. It works completely offline after the initial load, making it perfect for:

- Generating 2FA codes when you don't have internet access
- Using as an alternative to Google Authenticator or Authy
- Managing multiple TOTP tokens in one place
- Privacy-conscious users who want their secrets to never leave their device

### Features

- 🔒 **100% Offline** - Works without internet connection after first load
- 📱 **Progressive Web App** - Install on your device for native app experience
- 📷 **QR Code Scanner** - Scan QR codes to quickly add tokens
- ✏️ **Manual Entry** - Add tokens manually with custom settings
- 📤 **Export/Import** - Backup and restore your tokens as JSON
- 🔄 **Auto-refresh** - TOTP codes automatically update every 30 seconds
- 🎨 **Modern UI** - Clean, responsive interface built with Vue 3 and PrimeVue
- 🔐 **No Account Required** - No registration, no servers, no tracking

## Security Considerations

### ✅ What Makes It Secure

- **No Server Communication**: All TOTP generation happens client-side using the Web Crypto API. Your secrets never leave your device.
- **Offline-First**: Once loaded, the app works completely offline, reducing attack surface.
- **Open Source**: The code is open for security audits and verification.
- **Standard TOTP Algorithm**: Implements RFC 6238 TOTP standard, compatible with all major services.

### ⚠️ Important Security Notes

- **Browser Storage**: Tokens are stored in your browser's `localStorage`. This means:
  - Secrets are stored in **plain text** in localStorage (browser storage)
  - Anyone with access to your device and browser can view your tokens
  - Clearing browser data will delete all tokens (unless you have a backup)
  - Browser extensions with storage access could potentially read your tokens

- **Best Practices**:
  - Use this app on a **trusted device** only
  - Keep your browser updated and secure
  - Regularly export your tokens as backup
  - Consider using browser profiles or private browsing for additional isolation
  - Be cautious of browser extensions that request storage permissions

- **Not Recommended For**:
  - Shared or public computers
  - Devices with untrusted software or malware
  - High-security environments requiring hardware security modules (HSM)

### Privacy

- No analytics or tracking by default (optional Plausible analytics can be enabled via environment variable)
- No data collection
- No external API calls
- All processing happens locally in your browser

## Project Setup

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- npm (comes with Node.js)

### Installation

```sh
npm install
```

## Development

### Run Locally

Start the development server with hot-reload:

```sh
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

### Development Features

- Hot Module Replacement (HMR) for instant updates
- Vue DevTools integration
- PWA enabled in development mode for testing
- Service worker registration for offline testing

## Building for Production

### Build

Create an optimized production build:

```sh
npm run build
```

The built files will be in the `dist/` directory, ready to be deployed to any static hosting service.

### Preview Production Build

Preview the production build locally:

```sh
npm run preview
```

### Build Configuration

- **Prerendering**: The build process includes prerendering for SEO (disabled in CI environments)
- **PWA**: Service worker and manifest are automatically generated
- **Optimization**: Assets are minified and optimized for production

## Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next-generation frontend build tool
- **Pinia** - State management
- **PrimeVue** - UI component library
- **Web Crypto API** - Cryptography for TOTP generation
- **PWA Plugin** - Progressive Web App support

## Browser Support

- Modern browsers with Web Crypto API support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

The app can be deployed to any static hosting service:

- Cloudflare Pages
- Netlify
- Vercel
- GitHub Pages
- Any static file server

Simply build the project and upload the `dist/` directory contents.

## Credits

Created by [@maurohouseless](https://twitter.com/maurohouseless)
