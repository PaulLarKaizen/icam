import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw createError({ statusCode: 503, statusMessage: 'Unable to end the ICAM session.' })
  }

  return { success: true }
})
