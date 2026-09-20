import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText, FolderPlus, MessageSquare, Search, Upload, History } from "lucide-react";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (to: string) => {
    onOpenChange(false);
    void navigate({ to: to as never });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search commands, documents, collections..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/app/ask")}>
            <MessageSquare /> Ask Knowra
          </CommandItem>
          <CommandItem onSelect={() => go("/app/documents")}>
            <Search /> Search documents
          </CommandItem>
          <CommandItem onSelect={() => go("/app/documents")}>
            <Upload /> Upload document
          </CommandItem>
          <CommandItem onSelect={() => go("/app")}>
            <FolderPlus /> Create collection
          </CommandItem>
          <CommandItem onSelect={() => go("/app/history")}>
            <History /> Search history
          </CommandItem>
          <CommandItem onSelect={() => go("/app/settings")}>
            <FileText /> Settings & AI status
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
