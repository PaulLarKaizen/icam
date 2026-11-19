import type { H3Event } from "h3";
import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import type { AuthenticatedIcamUser } from "~~/shared/types/auth";

export async function requireUser(
  event: H3Event,
): Promise<AuthenticatedIcamUser> {
  const authUser = await serverSupabaseUser(event);
  const userId = authUser?.sub ?? (authUser as { id?: string } | null)?.id;

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required.",
    });
  }

  const adminClient = serverSupabaseServiceRole<any>(event);
  const { data: profile, error } = await adminClient
    .from("user_profiles")
    .select(
      "id, email, full_name, role, school_department, student_or_employee_id, is_active",
    )
    .eq("id", userId)
    .single();

  if (error || !profile) {
    throw createError({
      statusCode: 403,
      statusMessage: "ICAM user profile is not provisioned.",
    });
  }

  if (!profile.is_active) {
    throw createError({
      statusCode: 403,
      statusMessage: "ICAM account is inactive.",
    });
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    schoolDepartment: profile.school_department,
    studentOrEmployeeId: profile.student_or_employee_id,
    isActive: profile.is_active,
  };
}
