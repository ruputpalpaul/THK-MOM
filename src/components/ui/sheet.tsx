"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

function SheetContent({ className, side = "left", children, ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "left" | "right" | "top" | "bottom" }) {
	return (
		<SheetPrimitive.Portal>
			<SheetPrimitive.Overlay className="fixed inset-0 bg-black/60" />
			<SheetPrimitive.Content
				data-side={side}
				className={cn(
					"bg-background text-foreground fixed z-50 grid gap-4 p-6 shadow-lg transition-transform",
					side === "left" && "inset-y-0 left-0 w-3/4 sm:w-96",
					side === "right" && "inset-y-0 right-0 w-3/4 sm:w-96",
					side === "top" && "inset-x-0 top-0 h-1/2",
					side === "bottom" && "inset-x-0 bottom-0 h-1/2",
					className,
				)}
				{...props}
			>
				{children}
			</SheetPrimitive.Content>
		</SheetPrimitive.Portal>
	);
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
	return <div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
	return (
		<SheetPrimitive.Title
			className={cn("text-lg font-semibold leading-none tracking-tight", className)}
			{...props}
		/>
	);
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
	return (
		<SheetPrimitive.Description
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription };

