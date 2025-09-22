import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// /utils/copyToClipboardWithToast.ts
import { toast } from "sonner";

export async function copyToClipboard(text: string) {
  if (!navigator.clipboard) {
     toast.error("Failed to copy.");
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied!", {
      description: "Text has been copied to clipboard",
      duration: 2000, // optional
    });
    return true;
  } catch (err) {
     toast.error("Failed to copy." + err);
    return false;
  }
}
