import { readFile } from "node:fs/promises";
import path from "node:path";

import bcrypt from "bcryptjs";
import { ContentStatus, PrismaClient } from "@prisma/client";

type LegacyPost = {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  status?: string;
  image?: string;
  slug: string;
  date?: string;
  author?: string;
  allowComments?: boolean;
};

type LegacyPage = {
  id: number;
  title: string;
  content: string;
  slug: string;
  status?: string;
};

type LegacyMedia = {
  id: number;
  name: string;
  path: string;
  type: string;
  title?: string;
  description?: string;
  dateUploaded?: string;
};

type LegacyDriveEmbed = {
  id: number;
  name: string;
  driveId: string;
  dateAdded?: string;
};

type LegacySettings = {
  siteName?: string;
  siteTagline?: string;
  siteDescription?: string;
  adminUsername?: string;
  adminEmail?: string;
  adminPassword?: string;
  postsPerPage?: number;
  showAuthor?: boolean;
  showDate?: boolean;
  allowComments?: boolean;
};

const prisma = new PrismaClient();

function parseDate(input?: string | null): Date | null {
  if (!input) {
    return null;
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function toStatus(input?: string): ContentStatus {
  return input?.toLowerCase() === "published"
    ? ContentStatus.PUBLISHED
    : ContentStatus.DRAFT;
}

async function loadJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

async function run() {
  const legacyDataDir = path.resolve(process.cwd(), "..", "server_data");

  const [posts, pages, media, driveEmbeds, settings] = await Promise.all([
    loadJson<LegacyPost[]>(path.join(legacyDataDir, "posts.json"), []),
    loadJson<LegacyPage[]>(path.join(legacyDataDir, "pages.json"), []),
    loadJson<LegacyMedia[]>(path.join(legacyDataDir, "media.json"), []),
    loadJson<LegacyDriveEmbed[]>(path.join(legacyDataDir, "drive_embeds.json"), []),
    loadJson<LegacySettings>(path.join(legacyDataDir, "settings.json"), {}),
  ]);

  const username = settings.adminUsername || "admin";
  const email = settings.adminEmail || "admin@visionvalley.com";
  const passwordHash = await bcrypt.hash(settings.adminPassword || "admin", 12);

  await prisma.$transaction(async (tx) => {
    await tx.comment.deleteMany();
    await tx.adminSession.deleteMany();
    await tx.post.deleteMany();
    await tx.page.deleteMany();
    await tx.media.deleteMany();
    await tx.driveEmbed.deleteMany();
    await tx.siteSetting.deleteMany();
    await tx.adminUser.deleteMany();

    await tx.adminUser.create({
      data: {
        id: 1,
        username,
        email,
        passwordHash,
      },
    });

    await tx.siteSetting.create({
      data: {
        id: 1,
        siteName: settings.siteName || "Vision Valley Residential Program",
        siteTagline: settings.siteTagline || "Pymble Ladies College",
        siteDescription:
          settings.siteDescription ||
          "The Vision Valley Residential Program at Pymble Ladies College.",
        postsPerPage: settings.postsPerPage ?? 6,
        showAuthor: settings.showAuthor ?? true,
        showDate: settings.showDate ?? true,
        allowComments: settings.allowComments ?? true,
      },
    });

    for (const post of posts) {
      const status = toStatus(post.status);
      const parsedDate = parseDate(post.date);

      await tx.post.create({
        data: {
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          category: post.category,
          status,
          image: post.image,
          slug: post.slug,
          author: post.author || "Vision Valley Team",
          allowComments: post.allowComments ?? true,
          publishedAt: status === ContentStatus.PUBLISHED ? parsedDate || new Date() : null,
          createdAt: parsedDate || new Date(),
        },
      });
    }

    for (const page of pages) {
      await tx.page.create({
        data: {
          id: page.id,
          title: page.title,
          content: page.content,
          slug: page.slug,
          status: toStatus(page.status),
        },
      });
    }

    for (const item of media) {
      await tx.media.create({
        data: {
          id: item.id,
          name: item.name,
          path: item.path,
          type: item.type,
          title: item.title,
          description: item.description,
          dateUploaded: parseDate(item.dateUploaded),
        },
      });
    }

    for (const embed of driveEmbeds) {
      await tx.driveEmbed.create({
        data: {
          id: embed.id,
          name: embed.name,
          driveId: embed.driveId,
          dateAdded: parseDate(embed.dateAdded),
        },
      });
    }
  });

  console.log("Legacy JSON import complete.");
  console.log(`Posts imported: ${posts.length}`);
  console.log(`Pages imported: ${pages.length}`);
  console.log(`Media imported: ${media.length}`);
  console.log(`Drive embeds imported: ${driveEmbeds.length}`);
}

run()
  .catch((error) => {
    console.error("Import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
