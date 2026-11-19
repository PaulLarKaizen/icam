import { requireUser } from "~~/server/utils/auth/require-user";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { BORROWING_VIEW_ROLES } from "~~/server/policies/borrowing.policy";
import { listBorrowingTransactions } from "~~/server/repositories/borrowing.repository";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(user, BORROWING_VIEW_ROLES);

  const transactions = await listBorrowingTransactions(event, user);
  return { transactions };
});
