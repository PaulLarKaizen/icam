import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/supabase'],

  runtimeConfig: {
    // These values are private server runtime configuration.
    googleClientId: '',
    googleClientSecret: '',
    googleRedirectUri: '',
    authStateSecret: '',
    public: {
      siteUrl: 'http://localhost:3000',
    },
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  supabase: {
    // Keep ICAM's route and permission handling explicit.
    redirect: false,

    // Share the Supabase session with Nitro through SSR cookies.
    useSsrCookies: true,

    // Private. Loaded from NUXT_SUPABASE_SECRET_KEY at runtime.
    secretKey: '',
  },
})
