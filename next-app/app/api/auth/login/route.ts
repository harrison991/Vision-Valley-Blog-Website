import bcrypt from "bcryptjs";
import { z } from "zod";

import { createSession } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid login payload", 400);
  }

  const { username, password } = parsed.data;

  const adminUser = await prisma.adminUser.findFirst({
    where: {
      OR: [{ username }, { email: username }],
    },
  });

  if (!adminUser) {
    return fail("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(password, adminUser.passwordHash);
  if (!passwordMatches) {
    return fail("Invalid email or password", 401);
  }

  await createSession(adminUser.id);

  return ok({
    success: true,
    user: {
      username: adminUser.username,
      email: adminUser.email,
      loginTime: new Date().toISOString(),
    },
  });
}
