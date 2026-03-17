import { unlink } from "node:fs/promises";
import path from "node:path";

import { requireAuthenticatedUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeMedia } from "@/lib/serializers";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return fail("Invalid media id", 400);
  }

  const media = await prisma.media.findUnique({ where: { id: numericId } });
  if (!media) {
    return fail("Media item not found", 404);
  }

  return ok(serializeMedia(media));
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
    return fail("Invalid media id", 400);
  }

  const media = await prisma.media.findUnique({ where: { id: numericId } });
  if (!media) {
    return fail("Media item not found", 404);
  }

  await prisma.media.delete({ where: { id: numericId } });

  if (media.path.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", media.path.replace(/^\//, ""));
    await unlink(filePath).catch(() => {
      // Ignore missing file errors to keep metadata delete idempotent.
    });
  }

  return ok({ success: true });
}
