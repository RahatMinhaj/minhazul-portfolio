import { readUploadedImage } from "@/features/media/image-storage";
import { getMediaAssetById } from "@/features/media/media.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) {
    return new Response("Image not found.", { status: 404 });
  }

  const asset = await getMediaAssetById(id);
  if (!asset || asset.provider !== "server-upload" || !asset.mimeType) {
    return new Response("Image not found.", { status: 404 });
  }

  const image = await readUploadedImage(id);
  if (!image) return new Response("Image not found.", { status: 404 });

  return new Response(image, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(image.length),
      "Content-Type": asset.mimeType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
