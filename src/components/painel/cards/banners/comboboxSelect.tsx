"use client"

import {  useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandEmpty,
  CommandList,
  CommandGroup,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanySelectProps {
  companies: { id: string; name?: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function CompanySelectCombobox({
  companies,
  value,
  onChange,
}: CompanySelectProps) {
  const [open, setOpen] = useState(false);

  const selectedCompany = companies.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="bg-white h-[52px] rounded-full">
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selectedCompany?.name ?? "Selecione uma empresa"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-white rounded-2xl w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar empresa..." />
          <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {companies.map((company) => (
                <CommandItem
                  key={company.id}
                  value={company.name}
                  onSelect={() => {
                    onChange(company.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      company.id === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {company.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
