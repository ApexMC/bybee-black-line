import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-sm text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-white",
      outline: "border border-white/20 bg-transparent text-foreground hover:border-white/50 hover:bg-white/5",
      ghost: "text-foreground hover:bg-white/5",
    },
    size: { default: "h-12 px-6", sm: "h-10 px-4 text-xs", lg: "h-14 px-7", icon: "size-11" },
  },
  defaultVariants: { variant: "default", size: "default" },
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
export { Button, buttonVariants };
