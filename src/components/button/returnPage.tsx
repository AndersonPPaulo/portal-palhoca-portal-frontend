"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReturnPageButton() {
  const { back } = useRouter();

  return (
    <span
      onClick={() => back()}
      className="flex items-center bg-primary-light text-primary p-2 rounded-full"
    >
      <ArrowLeft size={24} />
    </span>
  );
}
