import React from "react";
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

  return (
    <div className={`w-full`}>
      {label && (
        <label htmlFor={props.id} className="px-6 block text-black">
          {label}
        </label>
      )}

      <div
        className={`${className} relative mt-1 border-2 border-primary-light rounded-[24px]`}
      >
        {textareaInput ? (
          <textarea
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            className={` w-full text-body-m text-gray-900 rounded-[24px] min-h-[128px] px-6 py-4 outline-none focus:border-blue-500 focus:ring-blue-500 resize-none ${
              error
                ? "border border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-none"
            } ${hasIcon ? (iconPosition === "left" ? "pl-12" : "pr-12") : ""} `}
          />
        ) : (
          <input
            {...props}
            className={` w-full text-body-m text-gray-900 rounded-[24px] px-6 py-4 outline-none focus:border-blue-500 focus:ring-blue-500 ${
              error
                ? "border border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-none"
            } ${props.disabled && "cursor-not-allowed"} ${
              hasIcon ? (iconPosition === "left" ? "pl-11 pt-5" : "pr-11") : ""
            } `}
          />
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
