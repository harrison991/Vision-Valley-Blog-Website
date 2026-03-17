import Link from "next/link";
import { ContentStatus } from "@prisma/client";

import { SiteHeader } from "@/components/site-header";
import { formatLegacyDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: ContentStatus.PUBLISHED },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Blog</h1>
        <p className="mt-2 text-slate-700">Published posts from Vision Valley.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {post.category || "General"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{post.title}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {formatLegacyDate(post.publishedAt || post.createdAt)}
              </p>
              <p className="mt-4 text-sm text-slate-700">{post.excerpt || post.content}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-5 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Read post
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
