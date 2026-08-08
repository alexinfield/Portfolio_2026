import type { ImgHTMLAttributes } from "react";

const responsiveWidths = [768, 960, 1600, 2600] as const;
const supportedSource = /\.(?:avif|jpe?g|png|webp)$/i;

type ResponsiveImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "width" | "height" | "srcSet" | "sizes" | "alt"
> & {
  alt: string;
  src: string;
  width: number;
  height: number;
  sizes: string;
};

function candidatePath(source: string, width: number) {
  return source.replace(/\.[^.]+$/, `-w${width}.webp`);
}

export default function ResponsiveImage({
  src,
  width,
  height,
  sizes,
  alt,
  ...props
}: ResponsiveImageProps) {
  const candidates = supportedSource.test(src)
    ? responsiveWidths.filter((candidateWidth) => candidateWidth < width)
    : [];
  const srcSet = candidates.length
    ? [
        ...candidates.map(
          (candidateWidth) => `${candidatePath(src, candidateWidth)} ${candidateWidth}w`,
        ),
        `${src} ${width}w`,
      ].join(", ")
    : undefined;

  return (
    // This component is the static-export image loader for GitHub Pages.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt}
      src={src}
      width={width}
      height={height}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
    />
  );
}
