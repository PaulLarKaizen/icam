export function useCurrentUser() {
  const { data, pending, error, refresh } = useFetch('/api/auth/session', {
    key: 'icam-auth-session',
  })

  const currentUser = computed(() => data.value?.user ?? null)
  const profile = computed(() => data.value?.profile ?? null)
  const roleCodes = computed(() => data.value?.roles ?? [])

  return {
    currentUser,
    profile,
    roleCodes,
    pending,
    error,
    refresh,
  }
}
