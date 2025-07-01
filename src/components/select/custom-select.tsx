"use client";
import { useCallback, useEffect, useState } from "react";
import ReactSelect from "react-select";
import { MultiValue } from "react-select";

// Tipos
export type OptionType = { value: string; label: string };

interface CustomSelectProps {
  id: string;
  label: string;
  placeholder: string;
  options: OptionType[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  isMulti?: boolean;
  error?: string;
  noOptionsMessage?: string;
}

// Estilo comum para todos os ReactSelects
export const selectStyles = {
  control: (base: any) => ({
    ...base,
    borderRadius: "24px",
    padding: "0rem 24px",
    minHeight: "56px",
    marginTop: "6px",
    borderWidth: "2px",
    borderColor: "#DFEAF6",
    "&:hover": {
      borderColor: "#DFEAF695",
    },
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "#3b82f6",
    padding: "0.25rem 0.5rem",
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: "white",
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: "white",
    ":hover": {
      backgroundColor: "#2563eb",
      color: "white",
    },
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: "24px",
  }),
  menuList: (base: any) => ({
    ...base,
    borderRadius: "20px",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#374151",
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
      ? "#DFEAF6"
      : "white",
    color: state.isSelected ? "white" : "#374151",
    "&:hover": {
      backgroundColor: state.isSelected ? "#3b82f6" : "#DFEAF6",
    },
    padding: "8px 16px",
  }),
};

const CustomSelect = ({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  isMulti = false,
  error,
  noOptionsMessage = "Nenhuma opção disponível",
}: CustomSelectProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // somente no cliente
  }, []);
  // Se for multi-select, retornar as opções selecionadas
  const getSelectedOptions = useCallback(() => {
    if (isMulti) {
      const selectedValues = Array.isArray(value) ? value : [];
      return options.filter((option) => selectedValues.includes(option.value));
    } else {
      return options.find((option) => option.value === value) || null;
    }
  }, [isMulti, options, value]);

  // Handle change events
  const handleChange = (
    selectedOption: MultiValue<OptionType> | OptionType | null
  ) => {
    if (isMulti) {
      // Multi-select
      const selectedOptions = selectedOption as MultiValue<OptionType>;
      const values = selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [];
      onChange(values);
    } else {
      // Single select
      const option = selectedOption as OptionType;
      onChange(option?.value || "");
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="px-6" htmlFor={id}>
        {label}
      </label>
      {isClient && (
        <ReactSelect
          id={id}
          isMulti={isMulti}
          className={`basic-${isMulti ? "multi-" : ""}select w-full`}
          classNamePrefix="select"
          placeholder={placeholder}
          noOptionsMessage={() => noOptionsMessage}
          value={getSelectedOptions()}
          onChange={handleChange}
          options={options}
          styles={selectStyles}
        />
      )}
      {error && <p className="text-sm text-red-500 px-6 mt-1">{error}</p>}
    </div>
  );
};

export default CustomSelect;
