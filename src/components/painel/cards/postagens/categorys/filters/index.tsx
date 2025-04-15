import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import CustomInput from "@/components/input/custom-input";

interface FilterState {
  status: boolean | null;
}

interface FilterProps {
  filter: string;
  setFilter: (value: string) => void;
  onFilterChange: (filters: FilterState) => void;
}

const FilterCategorys = ({
  filter,
  setFilter,
  onFilterChange,
}: FilterProps) => {
  const [filters, setFilters] = useState<FilterState>({
    status: null,
  });

  const [openPopovers, setOpenPopovers] = useState({
    status: false,
  });

  const handleFilterChange = (value: boolean | null) => {
    const newFilters = {
      ...filters,
      status: filters.status === value ? null : value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    return;
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex items-center gap-4">
        <div className="flex-grow">
          <span className="text-body-g ms-4">Tag:</span>
          <CustomInput
            type="search"
            placeholder="Digite o título da tag..."
            value={filter}
            icon={<Search />}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <Popover
          open={openPopovers.status}
          onOpenChange={(open) =>
            setOpenPopovers((prev) => ({ ...prev, status: open }))
          }
        >
          <div className="flex flex-col min-w-[180px]">
            <label className="ms-4">Status</label>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="text-body-m mt-1 h-14 rounded-[24px] px-6 py-4 outline-none border-2 border-primary-light flex justify-between items-center"
              >
                {!filters.status ? "Selecione" : `Selecionado:`}
                <div className="flex items-center gap-2">
                  {filters.status !== null && (
                    <span className="rounded-full bg-primary-light w-6 h-6 flex items-center justify-center text-primary">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  {openPopovers.status ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </Button>
            </PopoverTrigger>
          </div>
          <PopoverContent
            className="w-56 bg-white rounded-2xl shadow-lg"
            sideOffset={20}
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.status === true}
                  className="text-white rounded checkbox-thick"
                  onCheckedChange={() => handleFilterChange(true)}
                />
                <label className="ms-4">Ativo</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.status === false}
                  className="text-white rounded checkbox-thick"
                  onCheckedChange={() => handleFilterChange(false)}
                />
                <label className="ms-4">Inativo</label>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default FilterCategorys;
