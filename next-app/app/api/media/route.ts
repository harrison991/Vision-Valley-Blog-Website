import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeMedia } from "@/lib/serializers";

export const runtime = "nodejs";

const allowedExtensions = new Set(["png", "jpg", "jpeg", "gif", "mp4", "webp"]);

const metadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

function sanitizeFileName(name: string): string {
  return name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
}

export async function GET() {
  const mediaItems = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  return ok(mediaItems.map(serializeMedia));
}

export async function POST(request: Request) {
  try {
    await requireAuthenticatedUser();
  } catch {
    return fail("Unauthorized", 401);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return fail("No file provided", 400);
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !allowedExtensions.has(extension)) {
    return fail("File type not allowed", 400);
  }

  const parsedMetadata = metadataSchema.safeParse({
    title: formData.get("title")?.toString(),
    description: formData.get("description")?.toString(),
  });

  if (!parsedMetadata.success) {
    return fail("Invalid media metadata", 400);
  }

  const fileName = `${randomUUID()}_${sanitizeFileName(file.name)}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const data = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, fileName), data);

  const latest = await prisma.media.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  const media = await prisma.media.create({
    data: {
      id: (latest?.id || 0) + 1,
      name: file.name,
      path: `/uploads/${fileName}`,
      type: file.type.split("/")[0] || "image",
      title: parsedMetadata.data.title || file.name,
      description: parsedMetadata.data.description,
      dateUploaded: new Date(),
    },
  });

  return ok(
    {
      success: true,
      message: "File uploaded successfully",
      media: serializeMedia(media),
    },
    201,
  );
}
