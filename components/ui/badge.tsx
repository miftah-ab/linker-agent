import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-blue-500/10 text-blue-400 border-blue-500/20",
        secondary:
          "bg-white/5 text-white/60 border-white/10",
        success:
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        warning:
          "bg-amber-500/10 text-amber-400 border-amber-500/20",
        destructive:
          "bg-red-500/10 text-red-400 border-red-500/20",
        outline:
          "border-white/10 text-white/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
