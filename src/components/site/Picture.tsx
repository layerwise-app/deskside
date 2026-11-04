import type { CSSProperties } from 'react';
import type { ImageAsset } from '~/content/types';

type Props = {
  image: ImageAsset;
  alt: string;
  /** The rendered width, for the browser to pick a file: `(min-width: 1024px) 50vw, 100vw`. */
  sizes: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
};

/**
 * An image from `pnpm add-images`: responsive WebP sources, a reserved
 * aspect ratio so the page never shifts, and a blurred preview underneath.
 */
export function Picture({ image, alt, sizes, className, style, priority }: Props) {
  const srcSet = image.sources.map((s) => `${s.src} ${s.width}w`).join(', ');
  const fallback = image.sources.find((s) => s.width >= 1200) ?? image.sources.at(-1)!;
  return (
    <img
      src={fallback.src}
      srcSet={image.sources.length > 1 ? srcSet : undefined}
      sizes={image.sources.length > 1 ? sizes : undefined}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding='async'
      className={className}
      style={{
        aspectRatio: `${image.width} / ${image.height}`,
        backgroundImage: `url("${image.blur}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: 'auto',
        width: '100%',
        ...style
      }}
    />
  );
}

/** The file to draw on a canvas at about this many pixels wide. */
export function sourceFor(image: ImageAsset, width: number) {
  return (image.sources.find((s) => s.width >= width) ?? image.sources.at(-1)!).src;
}
