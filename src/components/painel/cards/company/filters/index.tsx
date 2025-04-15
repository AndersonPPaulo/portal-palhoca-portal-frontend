import { useState } from "react";
import { Search } from "lucide-react";
import CustomInput from "@/components/input/custom-input";

interface FilterState {
  name: string;
}

interface FilterProps {
  filter: string;
  setFilter: (value: string) => void;
  onFilterChange: (filters: FilterState) => void;
}

const CompanyFilter = ({ filter, setFilter, onFilterChange }: FilterProps) => {
  const [filters, setFilters] = useState<FilterState>({ name: filter });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedName = e.target.value;
    setFilters({ name: updatedName });
    onFilterChange({ name: updatedName });
    setFilter(updatedName);
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex items-center gap-4">
        <div className="flex-grow">
          <span className="text-body-g ms-4">Empresa:</span>
          <CustomInput
            type="search"
            placeholder="Digite o nome da empresa..."
            value={filters.name}
            icon={<Search />}
            onChange={handleNameChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyFilter;
