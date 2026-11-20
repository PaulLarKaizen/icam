import { requireIcamUser } from '../../utils/auth/require-user'

export default defineEventHandler(async (event) => {
  const { user, profile, roleCodes } = await requireIcamUser(event)

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    roles: roleCodes,
  }
})
