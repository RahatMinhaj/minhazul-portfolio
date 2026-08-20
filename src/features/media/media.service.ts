import "server-only";

import {
  getMediaAsset,
  upsertMediaAsset,
} from "@/features/media/media.repository";
import {
  LocalPreviewMediaProvider,
  UrlMediaProvider,
} from "@/features/media/providers/url-provider";
import type { MediaInput, MediaProvider } from "@/features/media/types";

type MediaProviderName = "url" | "local-preview";

const providers: Record<MediaProviderName, MediaProvider> = {
  url: new UrlMediaProvider(),
  "local-preview": new LocalPreviewMediaProvider(),
};

export async function registerMediaAsset(
  providerName: MediaProviderName,
  input: MediaInput,
) {
  const provider = providers[providerName];
  const normalized = provider.normalize(input);

  return upsertMediaAsset(normalized.url, {
    provider: provider.name,
    ...normalized,
  });
}

export function getMediaAssetById(id: string) {
  return getMediaAsset(id);
}
