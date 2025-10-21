"use client";
import Image, { type ImageProps } from "next/image";
import { cloneElement, useCallback, useState } from "react";
import { Sheet, SheetMaskContent, SheetTitle } from "@/components/ui/sheet";

export default function MImg({ src, alt, width, height, ...props }: ImageProps) {
  const isGif = (src as string).endsWith(".gif");
  const [preview, setPreview] = useState(false);

  const baseImage = (
    <Image
      {...props}
      alt={alt}
      src={src}
      width={width || 0}
      height={height || 0}
      sizes="100vw"
      className="h-auto w-full cursor-pointer md:w-1/2"
      unoptimized={isGif}
    />
  );

  const onOpenPreview = useCallback(() => setPreview(true), []);
  const onClosePreview = useCallback(() => setPreview(false), []);

  return (
    <>
      {cloneElement(baseImage, { onClick: onOpenPreview })}

      {/* 动画的销毁过程会导致视觉卡顿，因此 SheetMaskContent 移除了 animation 效果 */}
      <Sheet open={preview} onOpenChange={setPreview}>
        <SheetMaskContent className="size-full items-center justify-center overflow-auto" onClick={onClosePreview}>
          <SheetTitle className="sr-only" />
          <Image
            {...props}
            alt={alt}
            src={src}
            width={width || 0}
            height={height || 0}
            className="h-auto w-full md:w-1/2"
            unoptimized={isGif}
          />
        </SheetMaskContent>
      </Sheet>
    </>
  );
}
