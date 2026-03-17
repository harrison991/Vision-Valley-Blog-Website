import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializePost } from "@/lib/serializers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) {
    return fail("Post not found", 404);
  }

  return ok(serializePost(post));
}
