import type { AuthenticatedIcamUser, IcamRole } from "~~/shared/types/auth";

export function requireRole(
  user: AuthenticatedIcamUser,
  allowedRoles: readonly IcamRole[],
  customMessage = "You do not have permission to perform this action.",
): void {
  if (!allowedRoles.includes(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: customMessage,
    });
  }
}
