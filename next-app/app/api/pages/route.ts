import { ContentStatus } from "@prisma/client";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializePage, toPrismaStatus } from "@/lib/serializers";
import { generateSlug } from "@/lib/slug";

const pageSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  slug: z.string().optional(),
  status: z.enum(["published", "draft"]).optional(),
});

async function buildUniqueSlug(rawSlug: string) {
  const base = generateSlug(rawSlug) || `page-${Date.now()}`;
  let candidate = base;
  let suffix = 1;

  while (await prisma.page.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get("published") === "true";

  const pages = await prisma.page.findMany({
    where: publishedOnly ? { status: ContentStatus.PUBLISHED } : undefined,
    orderBy: { updatedAt: "desc" },
  });

  return ok(pages.map(serializePage));
}

export async function POST(request: Request) {
  try {
    await requireAuthenticatedUser();
  } catch {
    return fail("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = pageSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid payload", 400);
  }

  const latest = await prisma.page.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  const page = await prisma.page.create({
    data: {
      id: (latest?.id || 0) + 1,
      title: parsed.data.title,
      content: parsed.data.content,
      slug: await buildUniqueSlug(parsed.data.slug || parsed.data.title),
      status: toPrismaStatus(parsed.data.status),
    },
  });

  return ok(serializePage(page), 201);
}
