import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-(--container-max) px-6 md:px-10", className)}
      {...props}
    >
      {children}
    </div>
  );
}
