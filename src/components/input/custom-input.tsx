import React, { useState } from "react";
import { AlertCircle } from "lucide-react";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  textareaInput?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  textareaInput = false,
  icon,
  iconPosition = "right",
  className = "",
  ...props
}) => {
  const hasIcon = Boolean(icon);

  // Estilos comuns para input e textarea
  const commonInputStyles = `
    w-full 
    text-body-m 
    text-gray-900 
    rounded-[24px] 
    px-6 
    py-4 
    outline-none 
    border-none
    focus:ring-0
    ${props.disabled && "cursor-not-allowed"}
    ${hasIcon ? (iconPosition === "left" ? "pl-11" : "pr-11") : ""}
    ${error ? "border-red-500" : ""}
  `;

  return (
    <div className={`w-full`}>
      {label && (
        <label htmlFor={props.id} className="px-6 block text-black">
          {label}
        </label>
      )}

      <div
        className={`
          ${className} 
          relative 
          mt-1 
          border-2 
          border-[#DFEAF6] 
          rounded-[24px]
          transition-colors
          duration-200
          hover:border-[#DFEAF695]
          ${props.disabled ? "opacity-60" : ""}
          ${error ? "!border-red-500" : ""}
          
          focus-within:!border-[#3b82f6]
          focus-within:shadow-sm
          focus-within:shadow-blue-300
        `}
      >
        {textareaInput ? (
          <textarea
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            className={`${commonInputStyles} min-h-[128px] resize-none`}
          />
        ) : (
          <input {...props} className={commonInputStyles} />
        )}

        {icon && (
          <span
            className={`absolute inset-y-0 flex items-center ${
              iconPosition === "left" ? "left-4" : "right-4"
            } text-gray-500`}
          >
            {icon}
          </span>
        )}

        {error && (
          <span className="absolute inset-y-0 right-10 flex items-center text-red-500">
            <AlertCircle className="h-5 w-5" />
          </span>
        )}
      </div>

      {error && <p className="mt-1 ps-3 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default CustomInput;
