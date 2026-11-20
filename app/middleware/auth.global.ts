const PUBLIC_ROUTES = new Set([
  '/portal',
  '/login',
  '/auth/student',
  '/auth/faculty',
  '/auth/lab-custodian',
  '/auth/admin',
  '/auth/pending',
])

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_ROUTES.has(to.path)) {
    return
  }

  try {
    await useRequestFetch()('/api/auth/session')
  } catch (error: any) {
    const statusCode = error?.statusCode || error?.status
    if (statusCode === 401) {
      return navigateTo('/portal')
    }
    if (statusCode === 403) {
      return navigateTo('/auth/pending')
    }
    throw error
  }
})
