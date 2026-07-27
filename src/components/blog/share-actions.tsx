"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ShareActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href });
      return;
    }
    await copy();
  }

  async function copy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={share} size="sm" variant="outline">
        <Share2 aria-hidden size={14} />
        Share
      </Button>
      <Button onClick={copy} size="sm" variant="ghost">
        {copied ? (
          <Check aria-hidden size={14} />
        ) : (
          <Copy aria-hidden size={14} />
        )}
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
