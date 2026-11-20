<script setup lang="ts">
import { ArrowLeft, Chrome } from 'lucide-vue-next'

definePageMeta({
  layout: 'auth',
  title: 'ICAM sign in',
})

const route = useRoute()
const authError = computed(() => {
  const code = String(route.query.error || '')
  const messages: Record<string, string> = {
    'domain-not-allowed': 'Only an eligible SDCA-managed Google account can access ICAM.',
    'oauth-cancelled': 'Google sign-in was cancelled.',
    'oauth-failed': 'Google sign-in could not be completed. Please try again.',
    'oauth-state-invalid': 'The sign-in request expired or could not be verified. Please try again.',
    'oauth-code-missing': 'Google did not return an authorization code. Please try again.',
    'oauth-not-configured': 'Google sign-in is not configured for this environment.',
    'google-token-exchange-failed': 'Google could not verify the sign-in request. Please try again.',
    'google-identity-invalid': 'Google did not return a valid, eligible SDCA identity. Please use your SDCA-managed account.',
    'supabase-google-sign-in-failed': 'ICAM could not establish your secure session. Please try again.',
    'icam-session-setup-failed': 'ICAM could not finish setting up your account session. Please contact the administrator.',
  }
  return messages[code] || ''
})

function handleGoogleSignIn() {
  window.location.assign('/api/auth/google')
}
</script>

<template>
  <main
    class="relative min-h-screen bg-cover bg-center bg-no-repeat"
    style="background-image: url('/images/Login/login-test2.png')"
  >
    <div class="absolute inset-0 bg-black/40"></div>

    <section class="relative z-10 container mx-auto flex min-h-screen items-center justify-center px-4 py-10">
      <div class="mx-auto w-full max-w-5xl">
        <div class="grid min-h-[560px] overflow-hidden rounded-2xl bg-base-100 shadow-xl md:grid-cols-2">
          <div class="flex flex-col items-center justify-center bg-[#650c21] p-8 text-center text-white">
            <h1 class="text-5xl font-bold tracking-wider">ICAM</h1>
            <img
              src="/images/Login/login-sdca.jpg"
              alt="St. Dominic College of Asia Logo"
              class="mt-6 mb-6 h-56 w-56 rounded-full object-contain shadow-md"
            />
            <p class="max-w-sm text-sm leading-relaxed">Institutional Campus Asset Management</p>
            <p class="mt-3 text-xs opacity-80">St. Dominic College of Asia</p>
          </div>

          <div class="flex flex-col justify-center p-8 sm:p-12">
            <NuxtLink
              to="/portal"
              class="mb-8 inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#650c21] transition-colors hover:bg-[#650c21]/5 hover:text-[#510918] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#650c21]"
            >
              <ArrowLeft :size="17" :stroke-width="2" aria-hidden="true" />
              <span>Back to Portal</span>
            </NuxtLink>

            <h2 class="text-3xl font-bold">Welcome to ICAM</h2>
            <p class="mt-2 text-sm text-base-content/60">
              Sign in using your eligible SDCA Google account.
            </p>

            <div v-if="authError" class="alert alert-error mt-6 text-sm" role="alert">
              {{ authError }}
            </div>

            <button
              type="button"
              class="btn btn-primary mt-8 w-full"
              @click="handleGoogleSignIn"
            >
              <Chrome :size="19" aria-hidden="true" />
              Continue with Google
            </button>

            <p class="mt-5 text-xs leading-relaxed text-base-content/55">
              Signing in does not automatically activate an ICAM account or grant a role. The ICAM Application Administrator
              must approve your account and assign the appropriate role(s).
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
