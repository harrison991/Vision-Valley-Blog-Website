import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializePage } from "@/lib/serializers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) {
    return fail("Page not found", 404);
  }

  return ok(serializePage(page));
}
