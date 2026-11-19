import type { H3Event } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { AuthenticatedIcamUser } from "~~/shared/types/auth";

export interface ActivityLogEntryInput {
  actor: AuthenticatedIcamUser;
  moduleCode: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

export async function recordActivityLog(
  event: H3Event,
  input: ActivityLogEntryInput,
): Promise<void> {
  const adminClient = serverSupabaseServiceRole<any>(event);
  const { error } = await adminClient.from("activity_logs").insert({
    actor_id: input.actor.id,
    actor_role: input.actor.role,
    module_code: input.moduleCode,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    summary: input.summary,
    metadata: input.metadata ?? {},
  });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to record activity log: ${error.message}`,
    });
  }
}
