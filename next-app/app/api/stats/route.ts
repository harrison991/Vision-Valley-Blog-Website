import { ContentStatus } from "@prisma/client";

import { requireAuthenticatedUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { formatLegacyDate } from "@/lib/date";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const detailed = searchParams.get("detailed") === "true";

  if (detailed) {
    try {
      await requireAuthenticatedUser();
    } catch {
      return fail("Unauthorized", 401);
    }
  }

  const [totalPosts, publishedPosts, totalPages, totalMedia, totalDriveEmbeds] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: ContentStatus.PUBLISHED } }),
      prisma.page.count(),
      prisma.media.count(),
      prisma.driveEmbed.count(),
    ]);

  const stats: Record<string, unknown> = {
    totalPosts,
    publishedPosts,
    totalPages,
    totalMedia,
    totalDriveEmbeds,
  };

  if (detailed) {
    const [posts, recentPosts] = await Promise.all([
      prisma.post.findMany({ select: { category: true } }),
      prisma.post.findMany({
        take: 5,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      }),
    ]);

    const categories: Record<string, number> = {};
    for (const post of posts) {
      if (post.category) {
        categories[post.category] = (categories[post.category] || 0) + 1;
      }
    }

    stats.categories = categories;
    stats.recentActivity = recentPosts.map((post) => ({
      type: "post",
      action: "create",
      title: post.title,
      date: formatLegacyDate(post.publishedAt ?? post.createdAt),
    }));
  }

  return ok(stats);
}
