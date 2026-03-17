import Image from "next/image";

import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";

export default async function GalleryPage() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Gallery</h1>
        <p className="mt-2 text-slate-700">Recent media from the program archive.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="relative h-56 w-full bg-slate-200">
                <Image
                  src={item.path.startsWith("/") ? item.path : `/${item.path}`}
                  alt={item.title || item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h2 className="text-sm font-semibold text-slate-900">{item.title || item.name}</h2>
                <p className="mt-1 text-xs text-slate-600">{item.description || "No description"}</p>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
