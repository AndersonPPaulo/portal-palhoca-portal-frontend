import { useContext, useState, useEffect } from "react";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import CustomInput from "@/components/input/custom-input";
import { CompanyCategoryContext } from "@/providers/company-category/index.tsx";

interface FilterState {
  name: string;
  categories: string[];
  highlight: boolean | null;
}

interface FilterProps {
  filter: string;
  setFilter: (value: string) => void;
  onFilterChange: (filters: FilterState) => void;
}

//Hook para detectar se está em mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
};

const CompanyFilter = ({ filter, setFilter, onFilterChange }: FilterProps) => {
  const { listCompanyCategory, ListCompanyCategory } = useContext(
    CompanyCategoryContext
  );

  const isMobile = useIsMobile();

  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Carregar categorias ao montar o componente
  useEffect(() => {
    ListCompanyCategory(100, 1);
  }, []);

  // Atualizar lista de categorias quando os dados mudarem
  useEffect(() => {
    if (listCompanyCategory?.data && listCompanyCategory.data.length > 0) {
      setCategories(listCompanyCategory.data);
    }
  }, [listCompanyCategory]);

  const [filters, setFilters] = useState<FilterState>({
    name: filter,
    categories: [],
    highlight: null,
  });

  const [openPopovers, setOpenPopovers] = useState({
    categories: false,
    highlight: false,
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedName = e.target.value;
    const newFilters = { ...filters, name: updatedName };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setFilter(updatedName);
  };

  const handleFilterChange = (
    type: keyof FilterState,
    value: string | boolean
  ) => {
    if (type === "highlight") {
      const newFilters = {
        ...filters,
        [type]: filters[type] === value ? null : (value as boolean),
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
      return;
    }

    if (type === "categories") {
      const newFilters = {
        ...filters,
        [type]: filters[type].includes(value as string)
          ? filters[type].filter((item) => item !== value)
          : [...filters[type], value as string],
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  const renderCategoryFilter = () => (
    <Popover
      open={openPopovers.categories}
      onOpenChange={(open) =>
        setOpenPopovers((prev) => ({ ...prev, categories: open }))
      }
    >
      <div className="flex flex-col min-w-[180px]">
        <label className="ms-4">Categoria</label>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`text-body-m mt-1 h-14 rounded-[24px] px-6 py-4 outline-none border-2 
              ${
                categories.length === 0
                  ? "bg-gray-100 cursor-not-allowed"
                  : "border-primary-light"
              } 
              flex justify-between items-center`}
            disabled={categories.length === 0}
          >
            <span>
              {categories.length === 0
                ? "Sem categorias"
                : filters.categories.length === 0
                ? "Selecione"
                : `Selecionados:`}
            </span>
            <div className="flex items-center gap-2">
              {categories.length > 0 && filters.categories.length > 0 && (
                <span className="rounded-full bg-primary-light w-6 h-6 flex items-center justify-center text-primary">
                  {filters.categories.length}
                </span>
              )}
              {categories.length > 0 &&
                (openPopovers.categories ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                ))}
            </div>
          </Button>
        </PopoverTrigger>
      </div>
      {categories.length > 0 && (
        <PopoverContent
          className="w-56 bg-white rounded-2xl shadow-2xl border-none"
          sideOffset={20}
        >
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  className="text-white rounded checkbox-thick"
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={() =>
                    handleFilterChange("categories", category.id)
                  }
                />
                <label
                  className="ms-4 cursor-pointer text-wrap"
                  onClick={() => handleFilterChange("categories", category.id)}
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );

  const renderHighlightFilter = () => (
    <Popover
      open={openPopovers.highlight}
      onOpenChange={(open) =>
        setOpenPopovers((prev) => ({ ...prev, highlight: open }))
      }
    >
      <div className="flex flex-col min-w-[180px]">
        <label className="ms-4">Destaque</label>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="text-body-m mt-1 h-14 rounded-[24px] px-6 py-4 outline-none border-2 border-primary-light flex justify-between items-center"
          >
            {filters.highlight === null
              ? "Selecione"
              : (filters.highlight === false || filters.highlight === true) &&
                `Selecionado:`}
            <div className="flex items-center gap-2">
              {filters.highlight !== null && (
                <span className="rounded-full bg-primary-light w-6 h-6 flex items-center justify-center text-primary">
                  <Check className="h-4 w-4" />
                </span>
              )}
              {openPopovers.highlight ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent
        className="w-56 bg-white rounded-2xl shadow-lg border-none"
        sideOffset={20}
      >
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={filters.highlight === true}
              className="text-white rounded checkbox-thick"
              onCheckedChange={() => handleFilterChange("highlight", true)}
            />
            <label
              className="ms-4 cursor-pointer"
              onClick={() => handleFilterChange("highlight", true)}
            >
              Em destaque
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={filters.highlight === false}
              className="text-white rounded checkbox-thick"
              onCheckedChange={() => handleFilterChange("highlight", false)}
            />
            <label
              className="ms-4 cursor-pointer"
              onClick={() => handleFilterChange("highlight", false)}
            >
              Sem destaque
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="flex flex-col w-full gap-4">
      <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-4`}>
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

        {!isMobile && (
          <>
            {renderCategoryFilter()}
            {renderHighlightFilter()}
          </>
        )}
      </div>

      {isMobile && (
        <div className="flex gap-4">
          {renderHighlightFilter()}
        </div>
      )}
    </div>
  );
};

export default CompanyFilter;