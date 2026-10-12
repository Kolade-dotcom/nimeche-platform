"use client";

import * as React from "react";
import { CheckIcon, Share2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Copies the certificate's verification link. The point of the link is that
 * the member can paste it anywhere — an employer needs no account to follow
 * it — so "share" means "copy", not a share sheet.
 */
export function ShareButton({ verifyPath }: { verifyPath: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    const url = `${window.location.origin}${verifyPath}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard permission refused — fall back to the older API.
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="outline" size="sm" onClick={() => void copy()}>
      {copied ? <CheckIcon /> : <Share2Icon />}
      {copied ? "Copied" : "Share"}
    </Button>
  );
}
