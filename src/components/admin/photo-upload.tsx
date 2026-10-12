"use client";

import * as React from "react";
import { UploadIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type FileEntry = {
  file: File;
  preview: string;
  altText: string;
  status: "idle" | "uploading" | "done" | "error";
  errorMessage?: string;
};

export function PhotoUpload({
  albumId,
  onSuccess,
}: {
  albumId: string;
  onSuccess?: () => void;
}) {
  const [entries, setEntries] = React.useState<FileEntry[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function addFiles(files: FileList | File[]) {
    const list = Array.from(files);
    const valid = list.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) return false;
      if (f.size > MAX_FILE_SIZE) return false;
      return true;
    });

    const newEntries: FileEntry[] = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      altText: "",
      status: "idle",
    }));

    setEntries((prev) => [...prev, ...newEntries]);
  }

  function updateAlt(index: number, altText: string) {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, altText } : e))
    );
  }

  function removeEntry(index: number) {
    setEntries((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (removed) URL.revokeObjectURL(removed.preview);
      return next;
    });
  }

  async function uploadEntry(index: number) {
    const entry = entries[index];
    if (!entry || entry.status === "uploading" || entry.status === "done") return;
    if (!entry.altText.trim()) {
      setEntries((prev) =>
        prev.map((e, i) =>
          i === index ? { ...e, status: "error", errorMessage: "Alt text is required." } : e
        )
      );
      return;
    }

    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, status: "uploading" } : e))
    );

    const formData = new FormData();
    formData.append("file", entry.file);
    formData.append("albumId", albumId);
    formData.append("altText", entry.altText.trim());

    try {
      const response = await fetch("/api/gallery/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? `Upload failed (${response.status})`);
      }

      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, status: "done" } : e))
      );
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setEntries((prev) =>
        prev.map((e, i) =>
          i === index ? { ...e, status: "error", errorMessage: message } : e
        )
      );
    }
  }

  async function uploadAll() {
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (e && e.status === "idle") {
        await uploadEntry(i);
      }
    }
  }

  const pendingCount = entries.filter((e) => e.status === "idle").length;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop photos here or click to select"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors",
          isDragging
            ? "border-primary bg-primary-subtle"
            : "border-border hover:border-border-strong hover:bg-muted"
        )}
      >
        <UploadIcon className="text-muted-foreground size-8" />
        <p className="text-muted-foreground text-sm">
          Drop photos here, or{" "}
          <span className="text-primary-text font-medium">click to select</span>
        </p>
        <p className="text-muted-foreground text-xs">JPEG, PNG, WebP — max 10 MB each</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(e) => {
          if (e.target.files) {
            addFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />

      {/* File list */}
      {entries.length > 0 && (
        <ul className="space-y-3">
          {entries.map((entry, i) => (
            <li
              key={entry.preview}
              className="bg-surface border-border flex items-start gap-3 rounded-lg border p-3"
            >
              {/* Preview */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.preview}
                alt=""
                className="size-16 shrink-0 rounded-md object-cover"
              />

              <div className="min-w-0 flex-1 space-y-2">
                <p className="truncate text-sm font-medium">{entry.file.name}</p>

                <input
                  type="text"
                  placeholder="Alt text (required for accessibility)"
                  value={entry.altText}
                  onChange={(e) => updateAlt(i, e.target.value)}
                  className="border-input bg-surface h-9 w-full rounded-sm border px-3 text-sm"
                  aria-label={`Alt text for ${entry.file.name}`}
                  disabled={entry.status === "uploading" || entry.status === "done"}
                />

                {entry.status === "error" && (
                  <p className="text-danger text-xs">{entry.errorMessage}</p>
                )}
                {entry.status === "done" && (
                  <p className="text-primary-text text-xs font-medium">✓ Uploaded</p>
                )}
                {entry.status === "uploading" && (
                  <p className="text-muted-foreground text-xs">Uploading…</p>
                )}
              </div>

              <div className="flex shrink-0 gap-1">
                {entry.status === "idle" || entry.status === "error" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void uploadEntry(i)}
                  >
                    Upload
                  </Button>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeEntry(i)}
                  className="text-muted-foreground hover:text-foreground flex size-9 items-center justify-center rounded-md transition-colors"
                  aria-label={`Remove ${entry.file.name}`}
                  disabled={entry.status === "uploading"}
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pendingCount > 1 && (
        <Button type="button" onClick={() => void uploadAll()}>
          Upload all {pendingCount} photos
        </Button>
      )}
    </div>
  );
}
