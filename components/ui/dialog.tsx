"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm data-[state=open]:animate-in">
      <DialogPrimitive.Content ref={ref} className={cn("relative flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-sm border border-white/15 bg-[#111214] p-7 shadow-2xl sm:p-9", className)} {...props}>
        <div className="min-h-0 min-w-0 overflow-y-auto overscroll-contain [overflow-wrap:anywhere]">{children}</div>
        <DialogPrimitive.Close className="absolute right-2 top-2 rounded-sm p-2 text-white/50 transition-colors hover:text-white focus-visible:outline-2"><X size={18} /><span className="sr-only">Close</span></DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Overlay>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";
const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={cn("pr-8 font-display text-4xl font-semibold uppercase", className)} {...props} />);
DialogTitle.displayName = "DialogTitle";
const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={cn("mt-3 text-sm leading-7 text-muted-foreground", className)} {...props} />);
DialogDescription.displayName = "DialogDescription";
export { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose };
