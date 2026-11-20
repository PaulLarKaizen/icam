<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  title: 'ICAM account pending',
})

const signingOut = ref(false)
const signOutError = ref('')

async function signOut() {
  signingOut.value = true
  signOutError.value = ''

  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await navigateTo('/portal')
  } catch {
    signOutError.value = 'Unable to sign out. Please refresh the page and try again.'
  } finally {
    signingOut.value = false
  }
}
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-base-200 px-4 py-10">
    <section class="card w-full max-w-xl border border-base-300 bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <div class="mb-2 flex size-16 items-center justify-center rounded-full bg-warning/15 text-warning">
          <span class="text-3xl" aria-hidden="true">!</span>
        </div>
        <h1 class="card-title text-2xl">Your ICAM account is awaiting approval</h1>
        <p class="max-w-md text-base-content/70">
          Your Google identity was accepted, but your ICAM account is not active or does not yet have an assigned role.
          Contact the ICAM Application Administrator to have your account reviewed and provisioned.
        </p>
        <p v-if="signOutError" class="alert alert-error mt-2 text-sm">{{ signOutError }}</p>
        <div class="card-actions mt-4">
          <button class="btn btn-primary" :disabled="signingOut" @click="signOut">
            {{ signingOut ? 'Signing out…' : 'Sign out' }}
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
