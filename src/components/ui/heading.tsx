import { cn } from "@/lib/utils";

type HeadingLevel = "display" | "h1" | "h2" | "h3";

const levelStyles: Record<HeadingLevel, string> = {
  display: "text-display font-semibold tracking-display leading-[0.95]",
  h1: "text-h1 font-semibold tracking-display leading-[1.05]",
  h2: "text-h2 font-semibold leading-[1.1]",
  h3: "text-h3 font-medium leading-[1.2]",
};

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

const defaultTag: Record<HeadingLevel, HeadingTag> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
};

type HeadingProps = React.ComponentProps<"h1"> & {
  level?: HeadingLevel;
  /**
   * Narrowed to plain HTML tag names (not the full `React.ElementType`) —
   * with @react-three/fiber installed, `JSX.IntrinsicElements` balloons to
   * include every three.js primitive, and distributing `children` across
   * that union makes TypeScript infer `never` for a fully generic
   * `ElementType` prop here.
   */
  as?: HeadingTag;
};

export function Heading({
  level = "h2",
  as,
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = as ?? defaultTag[level];
  return (
    <Tag className={cn(levelStyles[level], className)} {...props}>
      {children}
    </Tag>
  );
}
