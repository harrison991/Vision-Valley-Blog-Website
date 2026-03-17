import bcrypt from "bcryptjs";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  siteName: z.string().min(1).optional(),
  siteTagline: z.string().optional(),
  siteDescription: z.string().optional(),
  postsPerPage: z.number().int().min(1).max(100).optional(),
  showAuthor: z.boolean().optional(),
  showDate: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  adminEmail: z.string().email().optional(),
  currentPassword: z.string().optional(),
  adminPassword: z.string().min(4).optional(),
});

async function getPublicSettings() {
  const [settings, admin] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: 1 } }),
    prisma.adminUser.findFirst({ orderBy: { id: "asc" } }),
  ]);

  if (!settings) {
    return null;
  }

  return {
    siteName: settings.siteName,
    siteTagline: settings.siteTagline,
    siteDescription: settings.siteDescription,
    postsPerPage: settings.postsPerPage,
    showAuthor: settings.showAuthor,
    showDate: settings.showDate,
    allowComments: settings.allowComments,
    adminEmail: admin?.email,
  };
}

export async function GET() {
  const payload = await getPublicSettings();
  if (!payload) {
    return fail("Settings not found", 404);
  }

  return ok(payload);
}

export async function PUT(request: Request) {
  let user;
  try {
    user = await requireAuthenticatedUser();
  } catch {
    return fail("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid payload", 400);
  }

  const payload = parsed.data;

  if (payload.adminPassword) {
    if (!payload.currentPassword) {
      return fail("Current password is required", 400);
    }

    const fullUser = await prisma.adminUser.findUnique({ where: { id: user.id } });
    if (!fullUser) {
      return fail("Admin user not found", 404);
    }

    const passwordMatches = await bcrypt.compare(payload.currentPassword, fullUser.passwordHash);
    if (!passwordMatches) {
      return fail("Current password is incorrect", 400);
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(payload.adminPassword, 12) },
    });
  }

  if (payload.adminEmail) {
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { email: payload.adminEmail },
    });
  }

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {
      siteName: payload.siteName,
      siteTagline: payload.siteTagline,
      siteDescription: payload.siteDescription,
      postsPerPage: payload.postsPerPage,
      showAuthor: payload.showAuthor,
      showDate: payload.showDate,
      allowComments: payload.allowComments,
    },
    create: {
      id: 1,
      siteName: payload.siteName || "Vision Valley Residential Program",
      siteTagline: payload.siteTagline,
      siteDescription: payload.siteDescription,
      postsPerPage: payload.postsPerPage ?? 6,
      showAuthor: payload.showAuthor ?? true,
      showDate: payload.showDate ?? true,
      allowComments: payload.allowComments ?? true,
    },
  });

  const updated = await getPublicSettings();
  return ok(updated);
}
