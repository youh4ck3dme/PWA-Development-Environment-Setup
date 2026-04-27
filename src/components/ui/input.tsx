import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400",
          className
        )}
        {...props}
      />
    );
  }
);
