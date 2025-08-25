"use client";
// Minimal shadcn-style Sheet component (bottom sheet default)
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { clsx } from "clsx";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  children?: React.ReactNode;
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = "bottom", ...props }, ref) => {
  const sideClasses: Record<string, string> = {
    bottom: "inset-x-0 bottom-0 border-t rounded-t-2xl", // default
    top: "inset-x-0 top-0 border-b rounded-b-2xl",
    left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r rounded-r-2xl",
    right: "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l rounded-l-2xl",
  };
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm opacity-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-300 ease-out" />
      <DialogPrimitive.Content
        ref={ref}
        className={clsx(
          // Base styles
          "fixed z-50 md:z-50 flex flex-col gap-4 bg-[#0F0B24]/95 text-white p-6 shadow-xl border border-white/10 will-change-transform",
          // Transition (custom instead of shadcn animate utilities not present in config)
          "translate-y-full opacity-0 data-[state=open]:translate-y-0 data-[state=open]:opacity-100 data-[state=closed]:translate-y-full data-[state=closed]:opacity-0 transition-all duration-300 ease-out",
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
SheetContent.displayName = "SheetContent";

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col space-y-1 text-center sm:text-left">
      {children}
    </div>
  );
}
export function SheetTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold leading-none tracking-tight">
      {children}
    </h2>
  );
}
export function SheetDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-400">{children}</p>;
}
export function SheetFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
      {children}
    </div>
  );
}
