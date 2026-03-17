import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializePage, toPrismaStatus } from "@/lib/serializers";
import { generateSlug } from "@/lib/slug";

const updatePageSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  slug: z.string().optional(),
  status: z.enum(["published", "draft"]).optional(),
});

async function resolveUniqueSlug(rawSlug: string, pageId: number) {
  const base = generateSlug(rawSlug) || `page-${pageId}`;
  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await prisma.page.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === pageId) {
      return candidate;
    }
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return fail("Invalid page id", 400);
  }

  const page = await prisma.page.findUnique({ where: { id: numericId } });
  if (!page) {
    return fail("Page not found", 404);
  }

  return ok(serializePage(page));
}

export async function PUT(
  request: Request,
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
    return fail("Invalid page id", 400);
  }

  const existing = await prisma.page.findUnique({ where: { id: numericId } });
  if (!existing) {
    return fail("Page not found", 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = updatePageSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid payload", 400);
  }

  const page = await prisma.page.update({
    where: { id: numericId },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      slug: parsed.data.slug
        ? await resolveUniqueSlug(parsed.data.slug, numericId)
        : parsed.data.title
          ? await resolveUniqueSlug(parsed.data.title, numericId)
          : undefined,
      status: parsed.data.status ? toPrismaStatus(parsed.data.status) : undefined,
    },
  });

  return ok(serializePage(page));
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
    return fail("Invalid page id", 400);
  }

  const existing = await prisma.page.findUnique({ where: { id: numericId } });
  if (!existing) {
    return fail("Page not found", 404);
  }

  await prisma.page.delete({ where: { id: numericId } });
  return ok({ success: true });
}
