import type { ImgHTMLAttributes } from "react";
import { withBasePath } from "../lib/base-path";

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
  const source = withBasePath(src);
  const candidates = supportedSource.test(source)
    ? responsiveWidths.filter((candidateWidth) => candidateWidth < width)
    : [];
  const srcSet = candidates.length
    ? [
        ...candidates.map(
          (candidateWidth) => `${candidatePath(source, candidateWidth)} ${candidateWidth}w`,
        ),
        `${source} ${width}w`,
      ].join(", ")
    : undefined;

  return (
    // This component is the static-export image loader for GitHub Pages.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt}
      src={source}
      width={width}
      height={height}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
    />
  );
}
