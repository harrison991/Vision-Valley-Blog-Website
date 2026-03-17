"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CommentFormProps = {
  postId: number;
  onSuccess?: () => void;
};

export function CommentForm({ postId, onSuccess }: CommentFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        authorName,
        authorEmail,
        content,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    if (!response.ok) {
      setStatus(payload?.error || "Failed to submit comment.");
      setIsSubmitting(false);
      return;
    }

    setAuthorName("");
    setAuthorEmail("");
    setContent("");
    setStatus("Comment posted.");
    setIsSubmitting(false);
    onSuccess?.();
  }

  return (
    <form onSubmit={submitComment} className="space-y-3 rounded-lg border border-slate-200 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          required
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          placeholder="Your name"
        />
        <Input
          required
          type="email"
          value={authorEmail}
          onChange={(event) => setAuthorEmail(event.target.value)}
          placeholder="Your email"
        />
      </div>
      <Textarea
        required
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write your comment"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
        {status && <p className="text-sm text-slate-600">{status}</p>}
      </div>
    </form>
  );
}
