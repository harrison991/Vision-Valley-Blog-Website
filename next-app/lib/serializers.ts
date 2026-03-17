import { ContentStatus, type Comment, type DriveEmbed, type Media, type Page, type Post } from "@prisma/client";

import { formatLegacyDate } from "@/lib/date";

export function toPrismaStatus(value?: string | null): ContentStatus {
  return value?.toLowerCase() === "published" ? ContentStatus.PUBLISHED : ContentStatus.DRAFT;
}

export function toLegacyStatus(value: ContentStatus): "published" | "draft" {
  return value === ContentStatus.PUBLISHED ? "published" : "draft";
}

export function serializePost(post: Post) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    category: post.category,
    status: toLegacyStatus(post.status),
    image: post.image,
    slug: post.slug,
    date: formatLegacyDate(post.publishedAt ?? post.createdAt),
    author: post.author,
    allowComments: post.allowComments,
  };
}

export function serializePage(page: Page) {
  return {
    id: page.id,
    title: page.title,
    content: page.content,
    slug: page.slug,
    status: toLegacyStatus(page.status),
  };
}

export function serializeMedia(media: Media) {
  return {
    id: media.id,
    name: media.name,
    path: media.path,
    type: media.type,
    title: media.title,
    description: media.description,
    dateUploaded: media.dateUploaded ? media.dateUploaded.toISOString().slice(0, 10) : null,
  };
}

export function serializeDriveEmbed(embed: DriveEmbed) {
  return {
    id: embed.id,
    name: embed.name,
    driveId: embed.driveId,
    dateAdded: embed.dateAdded ? embed.dateAdded.toISOString().slice(0, 10) : null,
  };
}

export function serializeComment(comment: Comment) {
  return {
    id: comment.id,
    postId: comment.postId,
    authorName: comment.authorName,
    authorEmail: comment.authorEmail,
    content: comment.content,
    status: comment.status.toLowerCase(),
    createdAt: comment.createdAt.toISOString(),
  };
}
