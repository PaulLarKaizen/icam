import type { AuthenticatedIcamUser } from "~~/shared/types/auth";

export function useIcamUser() {
  const user = useState<AuthenticatedIcamUser | null>("icam-user", () => null);
  const loading = useState<boolean>("icam-user-loading", () => false);
  const errorMessage = useState<string | null>("icam-user-error", () => null);

  async function fetchCurrentUser() {
    loading.value = true;
    errorMessage.value = null;
    try {
      const res = await $fetch<{ user: AuthenticatedIcamUser }>(
        "/api/v1/auth/me",
      );
      user.value = res.user;
    } catch (err: any) {
      user.value = null;
      errorMessage.value =
        err?.data?.statusMessage || err?.statusMessage || "Not signed in.";
    } finally {
      loading.value = false;
    }
  }

  const canManageInventory = computed(
    () =>
      user.value?.role === "custodian" || user.value?.role === "coordinator",
  );

  const canSubmitRequisition = computed(
    () => user.value?.role === "faculty" || user.value?.role === "coordinator",
  );

  const canReviewRequisition = computed(
    () =>
      user.value?.role === "custodian" || user.value?.role === "coordinator",
  );

  const canOperateCounter = computed(
    () =>
      user.value?.role === "custodian" || user.value?.role === "coordinator",
  );

  const canViewResilience = computed(
    () =>
      user.value?.role === "custodian" ||
      user.value?.role === "coordinator" ||
      user.value?.role === "admin",
  );

  const canManageOutageRecovery = computed(
    () =>
      user.value?.role === "custodian" || user.value?.role === "coordinator",
  );

  const canManageBackups = computed(() => user.value?.role === "admin");

  return {
    user,
    loading,
    errorMessage,
    fetchCurrentUser,
    canManageInventory,
    canSubmitRequisition,
    canReviewRequisition,
    canOperateCounter,
    canViewResilience,
    canManageOutageRecovery,
    canManageBackups,
  };
}
