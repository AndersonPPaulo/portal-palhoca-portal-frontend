"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useState } from "react";

export default function ReturnPageButton() {
  const { back } = useRouter();

  return (
    <Button
      type="button"
      onClick={back}
      className="flex items-center bg-primary-light text-primary  rounded-full"
    >
      <ArrowLeft size={24} />
    </Button>
  );
}
