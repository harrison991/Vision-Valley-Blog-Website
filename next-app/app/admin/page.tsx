import { ContentStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { AdminLogoutButton } from "@/components/admin-logout-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/admin/login");
  }

  const [totalPosts, publishedPosts, totalPages, totalMedia, totalDriveEmbeds] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: ContentStatus.PUBLISHED } }),
      prisma.page.count(),
      prisma.media.count(),
      prisma.driveEmbed.count(),
    ]);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-600">Signed in as {user.email}</p>
          </div>
          <AdminLogoutButton />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader>
              <CardDescription>Total Posts</CardDescription>
              <CardTitle>{totalPosts}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Published</CardDescription>
              <CardTitle>{publishedPosts}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Pages</CardDescription>
              <CardTitle>{totalPages}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Media</CardDescription>
              <CardTitle>{totalMedia}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Drive Embeds</CardDescription>
              <CardTitle>{totalDriveEmbeds}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Implementation Status</CardTitle>
            <CardDescription>
              API migration foundation is live. Next step is wiring full admin CRUD screens.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>SQLite schema and JSON importer created.</li>
              <li>Auth, posts, pages, media, drive embeds, settings, stats, and comments API routes added.</li>
              <li>Public pages and blog detail/comments views bootstrapped.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
