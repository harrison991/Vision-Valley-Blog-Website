import { CommentStatus } from "@prisma/client";
import { z } from "zod";

import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeComment } from "@/lib/serializers";

const commentSchema = z.object({
  postId: z.number().int().positive(),
  authorName: z.string().min(1),
  authorEmail: z.string().email(),
  content: z.string().min(1).max(3000),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postIdParam = searchParams.get("postId");

  if (postIdParam && Number.isNaN(Number(postIdParam))) {
    return fail("Invalid postId", 400);
  }

  const comments = await prisma.comment.findMany({
    where: {
      status: CommentStatus.APPROVED,
      ...(postIdParam ? { postId: Number(postIdParam) } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return ok(comments.map(serializeComment));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = commentSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid payload", 400);
  }

  const post = await prisma.post.findUnique({ where: { id: parsed.data.postId } });
  if (!post) {
    return fail("Post not found", 404);
  }

  if (!post.allowComments) {
    return fail("Comments are disabled for this post", 400);
  }

  const comment = await prisma.comment.create({
    data: {
      postId: parsed.data.postId,
      authorName: parsed.data.authorName,
      authorEmail: parsed.data.authorEmail,
      content: parsed.data.content,
      status: CommentStatus.APPROVED,
    },
  });

  return ok(serializeComment(comment), 201);
}
