import { requireAuthenticatedUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeDriveEmbed } from "@/lib/serializers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return fail("Invalid drive embed id", 400);
  }

  const item = await prisma.driveEmbed.findUnique({ where: { id: numericId } });
  if (!item) {
    return fail("Drive embed not found", 404);
  }

  return ok(serializeDriveEmbed(item));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuthenticatedUser();
  } catch {
    return fail("Unauthorized", 401);
  }

  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return fail("Invalid drive embed id", 400);
  }

  const item = await prisma.driveEmbed.findUnique({ where: { id: numericId } });
  if (!item) {
    return fail("Drive embed not found", 404);
  }

  await prisma.driveEmbed.delete({ where: { id: numericId } });
  return ok({ success: true });
}
