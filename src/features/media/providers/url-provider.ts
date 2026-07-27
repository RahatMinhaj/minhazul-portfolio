import { z } from "zod";

import type { MediaInput, MediaProvider } from "@/features/media/types";

const absoluteImageUrl = z.url({
  protocol: /^https?$/,
  hostname: z.regexes.domain,
});

export class UrlMediaProvider implements MediaProvider {
  readonly name = "url";

  normalize(input: MediaInput): MediaInput {
    const parsed = absoluteImageUrl.parse(input.url);
    return {
      ...input,
      url: parsed,
      altText: input.altText.trim(),
    };
  }
}

export class LocalPreviewMediaProvider implements MediaProvider {
  readonly name = "local-preview";

  normalize(input: MediaInput): MediaInput {
    if (!input.url.startsWith("/") || input.url.startsWith("//")) {
      throw new Error("Local previews must use a root-relative public path.");
    }
    return {
      ...input,
      url: input.url,
      altText: input.altText.trim(),
    };
  }
}
