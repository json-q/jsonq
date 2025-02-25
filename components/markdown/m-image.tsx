import Image, { ImageProps } from 'next/image';

export default function MImg({ src, alt, width, height, ...props }: ImageProps) {
  const isGif = (src as string).endsWith('.gif');
  return (
    <Image
      {...props}
      alt={alt}
      src={src}
      width={width || 0}
      height={height || 0}
      sizes="100vw"
      className="h-auto w-full"
      unoptimized={isGif}
    />
  );
}
