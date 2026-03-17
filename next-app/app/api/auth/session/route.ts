import { getAuthenticatedUser } from "@/lib/auth";
import { ok } from "@/lib/http";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return ok({ authenticated: false });
  }

  return ok({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
}
