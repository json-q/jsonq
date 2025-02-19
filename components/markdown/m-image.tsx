import Image, { ImageProps } from 'next/image';

export default function MImg({ src, alt, width, height, ...props }: ImageProps) {
  return (
    <Image
      {...props}
      alt={alt}
      src={src}
      width={width || 0}
      height={height || 0}
      sizes="100vw"
      style={{ width: '100%', height: 'auto' }}
    />
  );
}
