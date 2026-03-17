import { requireAuthenticatedUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export async function POST() {
  try {
    await requireAuthenticatedUser();
  } catch {
    return fail("Unauthorized", 401);
  }

  return ok({
    success: true,
    regenerated: 0,
    failed: 0,
    message: "Static HTML regeneration is not required in the Next.js architecture.",
  });
}
