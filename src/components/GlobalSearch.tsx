import { useState, useEffect } from "react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, User, Building } from "lucide-react";
import { Lead } from "@/hooks/useLeads";

interface GlobalSearchProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

export function GlobalSearch({ leads, onSelectLead }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Buscar leads...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Digite para buscar leads..." />
        <CommandList>
          <CommandEmpty>Nenhum lead encontrado.</CommandEmpty>
          <CommandGroup heading="Leads">
            {leads.map((lead) => (
              <CommandItem
                key={lead.id}
                value={`${lead.first_name} ${lead.last_name} ${lead.company} ${lead.email}`}
                onSelect={() => {
                  onSelectLead(lead);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {lead.first_name} {lead.last_name}
                    </p>
                    {lead.company && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building className="h-3 w-3" />
                        {lead.company}
                      </div>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

