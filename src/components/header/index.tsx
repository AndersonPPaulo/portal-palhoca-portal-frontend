import { Plus } from "lucide-react";
import { Button } from "../ui/button";

type Props = {
  title: string;
  description?: string;
  text_button?: string;
  onClick?: () => void;
  buttonHidden?: boolean;
};

export function Header({
  title,
  description,
  text_button,
  buttonHidden = false,
  onClick,
}: Props) {
  return (
    <div className="flex shadow-sm  p-12 pb-6 w-full bg-white">
      <div className="flex-grow flex-col">
        <h1 className="text-header-m mb-2">{title}</h1>
        <span className="text-gray-30">{description}</span>
      </div>

      {!buttonHidden && (
        <Button className="rounded-[24px]" onClick={onClick}>
          <Plus className="text-white" /> {text_button}
        </Button>
      )}
    </div>
  );
}

export default Header;
