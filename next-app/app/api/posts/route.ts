import { ContentStatus, type Prisma } from "@prisma/client";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializePost, toPrismaStatus } from "@/lib/serializers";
import { generateSlug } from "@/lib/slug";

const postSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["published", "draft"]).optional(),
  image: z.string().optional(),
  slug: z.string().optional(),
  author: z.string().optional(),
  allowComments: z.boolean().optional(),
});

async function buildUniqueSlug(rawSlug: string) {
  const base = generateSlug(rawSlug) || `post-${Date.now()}`;
  let candidate = base;
  let suffix = 1;

  while (await prisma.post.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get("published") === "true";
  const category = searchParams.get("category");
  const query = searchParams.get("search");

  const where: Prisma.PostWhereInput = {};

  if (publishedOnly) {
    where.status = ContentStatus.PUBLISHED;
  }

  if (category) {
    where.category = category;
  }

  if (query) {
    where.OR = [
      { title: { contains: query } },
      { excerpt: { contains: query } },
      { content: { contains: query } },
    ];
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return ok(posts.map(serializePost));
}

export async function POST(request: Request) {
  try {
    await requireAuthenticatedUser();
  } catch {
    return fail("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid payload", 400);
  }

  const latestPost = await prisma.post.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  const slug = await buildUniqueSlug(parsed.data.slug || parsed.data.title);
  const status = toPrismaStatus(parsed.data.status);
  const now = new Date();

  const post = await prisma.post.create({
    data: {
      id: (latestPost?.id || 0) + 1,
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt,
      category: parsed.data.category,
      status,
      image: parsed.data.image,
      slug,
      author: parsed.data.author || "Vision Valley Team",
      allowComments: parsed.data.allowComments ?? true,
      publishedAt: status === ContentStatus.PUBLISHED ? now : null,
    },
  });

  return ok(serializePost(post), 201);
}
