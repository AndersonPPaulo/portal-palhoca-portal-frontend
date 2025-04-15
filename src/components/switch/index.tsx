import { FC } from "react";

interface SwitchProps {
  value: boolean;
  onChange: (checked: boolean) => void;
}

const Switch: FC<SwitchProps> = ({ value, onChange }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={() => onChange(!value)}
        className="sr-only"
      />
      <div
        className={`w-14 h-8 rounded-full p-1 transition duration-300 ${
          value ? "bg-green-500" : "bg-gray-400"
        }`}
      >
        <div
          className={`w-6 h-6 bg-white rounded-full shadow-md transform transition duration-300 ${
            value ? "translate-x-6" : "translate-x-0"
          }`}
        ></div>
      </div>
    </label>
  );
};

export default Switch;
