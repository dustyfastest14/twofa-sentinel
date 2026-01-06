import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import Lara from '@primeuix/themes/lara'
import { definePreset } from '@primeuix/themes'

import App from './App.vue'

// Custom preset with blue primary colors
const BluePreset = definePreset(Lara, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    }
})

// PrimeVue component styles
import 'primeicons/primeicons.css'

const app = createApp(App)

// Pinia
const pinia = createPinia()
app.use(pinia)

// PrimeVue with Lara theme (styled mode) + blue primary + ripple effect
app.use(PrimeVue, {
    ripple: true,
    theme: {
        preset: BluePreset,
        options: {
            darkModeSelector: '.dark-mode'
        }
    }
})

// PrimeVue services
app.use(ConfirmationService)
app.use(ToastService)

app.mount('#app')
