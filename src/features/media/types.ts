export type MediaInput = {
  url: string;
  altText: string;
  mimeType?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
};

export interface MediaProvider {
  readonly name: string;
  normalize(input: MediaInput): MediaInput;
}
