"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  icon: React.ReactNode;
  value: number;
  title: string;
  path?: string;
  resultWeek?: string;
  bgCard: string;
  textColor: string;
  isAdmin?: boolean;
}

export default function CardInfoPainel({
  icon,
  value,
  title,
  path,
  resultWeek,
  bgCard,
  textColor,
  isAdmin,
}: Props) {
  const { push } = useRouter();

  if (isAdmin === false) return null;

  return (
    <Card
      className={`flex justify-start items-center ${textColor} ${bgCard} rounded-3xl min-h-[200px] max-h-[240px] min-w-[330px]`}
    >
      <CardContent className="flex flex-col justify-evenly py-4 px-8 h-full w-full items-start">
        <span className="h-8 w-8">{icon}</span>
        <span className={`text-header-g`}>{value}</span>
        <div className="flex items-center justify-between w-full">
          <span className="text-body-gg text-gray-40">{title}</span>
          <ArrowRight
            size={28}
            className={`${textColor} cursor-pointer rounded-full hover:bg-black/20 w-8 p-1 h-8 `}
            onClick={() => push(path ? path : "")}
          />
        </div>
        {resultWeek && <span className="text-xs">{resultWeek}</span>}
      </CardContent>
    </Card>
  );
}
