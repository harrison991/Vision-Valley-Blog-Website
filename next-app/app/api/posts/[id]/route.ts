import { ContentStatus } from "@prisma/client";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializePost, toPrismaStatus } from "@/lib/serializers";
import { generateSlug } from "@/lib/slug";

const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["published", "draft"]).optional(),
  image: z.string().optional(),
  slug: z.string().optional(),
  author: z.string().optional(),
  allowComments: z.boolean().optional(),
});

async function resolveUniqueSlug(rawSlug: string, postId: number) {
  const base = generateSlug(rawSlug) || `post-${postId}`;
  let candidate = base;
  let suffix = 1;

  // Ensure slug uniqueness except for this post.
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === postId) {
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
    return fail("Invalid post id", 400);
  }

  const post = await prisma.post.findUnique({ where: { id: numericId } });

  if (!post) {
    return fail("Post not found", 404);
  }

  return ok(serializePost(post));
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
    return fail("Invalid post id", 400);
  }

  const existing = await prisma.post.findUnique({ where: { id: numericId } });
  if (!existing) {
    return fail("Post not found", 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = updatePostSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid payload", 400);
  }

  const status = parsed.data.status ? toPrismaStatus(parsed.data.status) : existing.status;
  const slugSource = parsed.data.slug || parsed.data.title || existing.slug;
  const slug = await resolveUniqueSlug(slugSource, numericId);

  const post = await prisma.post.update({
    where: { id: numericId },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt,
      category: parsed.data.category,
      status,
      image: parsed.data.image,
      slug,
      author: parsed.data.author,
      allowComments: parsed.data.allowComments,
      publishedAt:
        status === ContentStatus.PUBLISHED
          ? existing.publishedAt || new Date()
          : null,
    },
  });

  return ok(serializePost(post));
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
    return fail("Invalid post id", 400);
  }

  const existing = await prisma.post.findUnique({ where: { id: numericId } });
  if (!existing) {
    return fail("Post not found", 404);
  }

  await prisma.post.delete({ where: { id: numericId } });

  return ok({ success: true });
}
