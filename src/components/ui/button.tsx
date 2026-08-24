"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { duration, ease } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type Variant = "primary" | "secondary" | "ghost";

const variantStyles: Record<Variant, string> = {
  primary: "bg-signal text-void border border-signal hover:bg-signal/90",
  secondary: "bg-transparent text-fg border border-border hover:border-fg-subtle",
  ghost: "bg-transparent text-fg-muted border border-transparent hover:text-fg",
};

type ButtonProps = React.ComponentProps<typeof motion.button> & {
  variant?: Variant;
};

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5",
        "text-body font-medium transition-colors",
        variantStyles[variant],
        className,
      )}
      whileHover={reduced ? undefined : { y: -1 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={{ duration: duration.fast, ease: ease.signal }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
