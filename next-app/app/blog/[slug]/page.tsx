import { CommentStatus, ContentStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { CommentForm } from "@/components/comment-form";
import { SiteHeader } from "@/components/site-header";
import { formatLegacyDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || post.status !== ContentStatus.PUBLISHED) {
    notFound();
  }

  const comments = await prisma.comment.findMany({
    where: { postId: post.id, status: CommentStatus.APPROVED },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-sm text-slate-500">{formatLegacyDate(post.publishedAt || post.createdAt)}</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">{post.title}</h1>
        <p className="mt-2 text-sm text-slate-600">By {post.author || "Vision Valley Team"}</p>

        <article
          className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-800"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-900">Comments</h2>
          <div className="mt-4 space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-600">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <article key={comment.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">{comment.authorName}</p>
                  <p className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
                  <p className="mt-2 text-sm text-slate-700">{comment.content}</p>
                </article>
              ))
            )}
          </div>
        </section>

        {post.allowComments && (
          <section className="mt-8">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Leave a comment</h3>
            <CommentForm postId={post.id} />
          </section>
        )}
      </main>
    </div>
  );
}
