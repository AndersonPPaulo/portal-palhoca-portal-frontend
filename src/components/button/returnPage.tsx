"use client";

import { on } from "events";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function ReturnPageButton({onClick}: {onClick?: () => void}) {
  const { back } = useRouter();

  return (
    <Button
    type="button"
      onClick={onClick}
      className="flex items-center bg-primary-light text-primary  rounded-full"
    >
      <ArrowLeft size={24} />
    </Button>
  );
}
