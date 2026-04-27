import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-emerald-400 px-4 py-2 text-slate-950 hover:bg-emerald-300",
        secondary: "bg-white/8 px-4 py-2 text-white hover:bg-white/12",
        ghost: "px-4 py-2 text-slate-200 hover:bg-white/8",
      },
      size: {
        default: "h-10",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, ...props },
  ref
) {
  return <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
});
