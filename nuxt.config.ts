import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/supabase'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  supabase: {
    // ICAM will use its own route and permission guards.
    redirect: false,

    // Keep auth sessions accessible to server-side routes.
    useSsrCookies: true,
  },
})