"use client";

import { on } from "events";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useState } from "react";

export default function ReturnPageButton() {
  const { back } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Button
      type="button"
      disabled={isSubmitting}
      onClick={back}
      className="flex items-center bg-primary-light text-primary  rounded-full"
    >
      <ArrowLeft size={24} />
    </Button>
  );
}
