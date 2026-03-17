import Image from "next/image";
import Link from "next/link";
import { ContentStatus } from "@prisma/client";

import { SiteHeader } from "@/components/site-header";
import { formatLegacyDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [featuredPosts, galleryItems] = await Promise.all([
    prisma.post.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-slate-100 to-sky-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Vision Valley Residential Program
            </p>
            <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
              Learning in the wild, leading with purpose.
            </h1>
            <p className="mt-5 text-base text-slate-700 md:text-lg">
              The platform is now being migrated to a modern Next.js + SQLite architecture for a
              faster editorial workflow and better long-term maintainability.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Explore Blog
              </Link>
              <Link
                href="/admin/login"
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
              >
                Open Admin
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <section>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Featured Posts</h2>
            <Link href="/blog" className="text-sm font-medium text-slate-700 hover:text-slate-900">
              View all
            </Link>
          </div>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            {featuredPosts.map((post) => (
              <article key={post.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-slate-500">{post.category || "General"}</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{post.title}</h3>
                <p className="mt-1 text-xs text-slate-600">
                  {formatLegacyDate(post.publishedAt || post.createdAt)}
                </p>
                <p className="mt-3 text-sm text-slate-700">{post.excerpt || post.content}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 inline-flex text-sm font-semibold text-slate-900 hover:text-slate-700"
                >
                  Read post
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Gallery Snapshot</h2>
            <Link href="/gallery" className="text-sm font-medium text-slate-700 hover:text-slate-900">
              Open gallery
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {galleryItems.map((item) => (
              <figure key={item.id} className="relative h-44 overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
                <Image
                  src={item.path.startsWith("/") ? item.path : `/${item.path}`}
                  alt={item.title || item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </figure>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
