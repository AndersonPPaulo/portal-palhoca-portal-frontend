import { useContext, useState } from "react";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import CustomInput from "@/components/input/custom-input";
import { ArticleContext } from "@/providers/article";

interface FilterState {
  status: boolean | null;
  categories: string[];
  creators: string[];
  highlight: boolean | null;
}

interface FilterProps {
  filter: string;
  setFilter: (value: string) => void;
  onFilterChange: (filters: FilterState) => void;
}

const ArticleFilter = ({ filter, setFilter, onFilterChange }: FilterProps) => {
  const { listArticles } = useContext(ArticleContext);

  const categories = [
    ...new Set(listArticles.map((item) => item.category.name)),
  ];
  const creators = [...new Set(listArticles.map((item) => item.creator))];

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    creators: [],
    status: null,
    highlight: null,
  });

  const [openPopovers, setOpenPopovers] = useState({
    status: false,
    categories: false,
    creators: false,
    highlight: false,
  });

  const handleFilterChange = (
    type: keyof FilterState,
    value: string | boolean
  ) => {
    if (type === "highlight") {
      const newFilters = {
        ...filters,
        highlight: filters.highlight === value ? null : (value as boolean),
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
      return;
    } else if (type === "status") {
      const newFilters = {
        ...filters,
        status: filters.status === value ? null : (value as boolean),
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
      return;
    }

    const newFilters = {
      ...filters,
      [type]: filters[type].includes(value as string)
        ? filters[type].filter((item) => item !== value)
        : [...filters[type], value],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const renderFilterButton = (
    type: "categories" | "creators",
    label: string,
    items: string[],
    isEmpty: boolean
  ) => (
    <Popover
      open={openPopovers[type]}
      onOpenChange={(open) =>
        setOpenPopovers((prev) => ({ ...prev, [type]: open }))
      }
    >
      <div className="flex flex-col min-w-[180px]">
        <label className="ms-4">{label}</label>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`text-body-m mt-1 h-14 rounded-[24px] px-6 py-4 outline-none border-2 
              ${
                isEmpty
                  ? "bg-gray-100 cursor-not-allowed"
                  : "border-primary-light"
              } 
              flex justify-between items-center`}
            disabled={isEmpty}
          >
            <span>
              {isEmpty
                ? "Sem dados disponíveis"
                : filters[type].length === 0
                ? "Selecione"
                : `Selecionados:`}
            </span>
            <div className="flex items-center gap-2">
              {!isEmpty && filters[type].length > 0 && (
                <span className="rounded-full bg-primary-light w-6 h-6 flex items-center justify-center text-primary">
                  {filters[type].length}
                </span>
              )}
              {!isEmpty &&
                (openPopovers[type] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                ))}
            </div>
          </Button>
        </PopoverTrigger>
      </div>
      {!isEmpty && (
        <PopoverContent
          className="w-56 bg-white rounded-2xl shadow-2xl border-none"
          sideOffset={20}
        >
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox
                  className="text-white rounded checkbox-thick"
                  checked={filters[type].includes(item)}
                  onCheckedChange={() => handleFilterChange(type, item)}
                />
                <label className="ms-4">{item}</label>
              </div>
            ))}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex items-center gap-4">
        <div className="flex-grow">
          <span className="text-body-g ms-4">Artigo:</span>
          <CustomInput
            type="search"
            placeholder="Digite o título do artigo ou uma tag..."
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
                {filters.status === null
                  ? "Selecione"
                  : (filters.status === false || filters.status === true) &&
                    `Selecionado:`}{" "}
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
                  checked={filters.status === false}
                  className="text-white rounded checkbox-thick"
                  onCheckedChange={() => handleFilterChange("status", false)}
                />
                <label className="ms-4">Publicado</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.status === true}
                  className="text-white rounded checkbox-thick"
                  onCheckedChange={() => handleFilterChange("status", true)}
                />
                <label className="ms-4">Inativo</label>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {renderFilterButton(
          "categories",
          "Categoria",
          categories,
          categories.length === 0
        )}
        {renderFilterButton(
          "creators",
          "Criador",
          creators,
          creators.length === 0
        )}

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
                  : (filters.highlight === false ||
                      filters.highlight === true) &&
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
            className="w-56 bg-white rounded-2xl shadow-lg"
            sideOffset={20}
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.highlight === true}
                  className="text-white rounded checkbox-thick"
                  onCheckedChange={() => handleFilterChange("highlight", true)}
                />
                <label className="ms-4">Em destaque</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.highlight === false}
                  className="text-white rounded checkbox-thick"
                  onCheckedChange={() => handleFilterChange("highlight", false)}
                />
                <label className="ms-4">Sem destaque</label>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ArticleFilter;
