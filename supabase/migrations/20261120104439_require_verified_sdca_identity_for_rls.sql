-- Require a server-verified SDCA Google identity for ICAM activity and permissions.
-- `icam_*` app_metadata is written only by the trusted Google OAuth callback
-- after Google ID-token signature, issuer, audience, expiry, nonce, email_verified,
-- and hosted-domain checks succeed. User-editable user_metadata is never trusted.

create or replace function private.has_verified_sdca_google_identity()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'icam_google_hd') = 'sdca.edu.ph'
    and nullif((select auth.jwt() -> 'app_metadata' ->> 'icam_google_sub'), '') is not null
    and nullif((select auth.jwt() -> 'app_metadata' ->> 'icam_identity_verified_at'), '') is not null,
    false
  );
$$;

revoke all on function private.has_verified_sdca_google_identity() from public, anon;
grant execute on function private.has_verified_sdca_google_identity() to authenticated;

create or replace function private.is_active_icam_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_verified_sdca_google_identity()
    and exists (
      select 1
      from public.icam_profiles p
      where p.user_id = (select auth.uid())
        and p.account_status = 'active'
    );
$$;

create or replace function private.has_icam_permission(p_permission_code text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_verified_sdca_google_identity()
    and exists (
      select 1
      from public.icam_profiles p
      join public.icam_user_roles ur
        on ur.user_id = p.user_id
       and ur.revoked_at is null
      join public.icam_role_permissions rp
        on rp.role_code = ur.role_code
      where p.user_id = (select auth.uid())
        and p.account_status = 'active'
        and rp.permission_code = p_permission_code
    );
$$;

-- Preserve the original least-privilege execution grants after replacing the functions.
revoke all on function private.is_active_icam_user() from public, anon;
revoke all on function private.has_icam_permission(text) from public, anon;
grant execute on function private.is_active_icam_user() to authenticated;
grant execute on function private.has_icam_permission(text) to authenticated;
