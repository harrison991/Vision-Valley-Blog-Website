import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeDriveEmbed } from "@/lib/serializers";

const driveEmbedSchema = z.object({
  name: z.string().min(1),
  driveId: z.string().min(1),
});

export async function GET() {
  const items = await prisma.driveEmbed.findMany({ orderBy: { createdAt: "desc" } });
  return ok(items.map(serializeDriveEmbed));
}

export async function POST(request: Request) {
  try {
    await requireAuthenticatedUser();
  } catch {
    return fail("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = driveEmbedSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid payload", 400);
  }

  const latest = await prisma.driveEmbed.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  const item = await prisma.driveEmbed.create({
    data: {
      id: (latest?.id || 0) + 1,
      name: parsed.data.name,
      driveId: parsed.data.driveId,
      dateAdded: new Date(),
    },
  });

  return ok(serializeDriveEmbed(item), 201);
}
