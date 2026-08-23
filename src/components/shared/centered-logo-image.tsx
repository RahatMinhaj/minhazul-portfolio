import { cn } from "@/lib/utils/cn";

export function CenteredLogoImage({
  alt,
  className,
  onError,
  src,
}: {
  alt: string;
  className?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  src: string;
}) {
  return (
    // Admin-provided root-relative or HTTPS image URL.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={cn(
        "block max-h-full max-w-full object-contain object-center",
        className,
      )}
      onError={onError}
      src={src}
    />
  );
}
