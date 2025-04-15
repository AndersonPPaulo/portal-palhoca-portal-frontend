"use client";

import { useContext, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationMain } from "./list-nav";
import { ChevronDown, ChevronRight } from "lucide-react";
import { UserContext } from "@/providers/user";

interface NavigationItem {
  name: string;
  icon: React.ElementType;
  path?: string;
  children?: NavigationItem[];
}

type NavigationList = NavigationItem[];

const NavigationSkeleton = () => {
  return (
    <div className="w-full space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-10 w-full bg-gray-200 animate-pulse rounded-3xl"
        />
      ))}
    </div>
  );
};

export function NavigationMain() {
  const { profile } = useContext(UserContext);
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (path?: string, event?: React.MouseEvent) => {
    if (!path) return;
    event?.preventDefault();
    setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const renderLevels = (data: NavigationList, isChild = false) => {
    return data
      .filter(
        (item) => !(profile?.role !== "superuser" && item.path === "/autores")
      )
      .map((item, index) => {
        const isActive = pathname.startsWith(item.path || "");
        const isOpen = openMenus[item.path || ""] || isActive;

        return (
          <div key={index} className="w-full">
            <div
              className={`${
                isActive ? "bg-primary-light text-primary" : "hover:bg-zinc-100"
              } flex items-center justify-between w-full rounded-3xl`}
            >
              <Link
                href={item.path ?? "#"}
                className={`${
                  isActive
                    ? "bg-primary-light text-primary"
                    : "hover:bg-zinc-100"
                } flex items-center w-full font-[600] py-2 px-6 rounded-[48px] transition duration-300 ease-linear ${
                  isChild ? "pl-10 text-sm" : ""
                }`}
              >
                <item.icon size={18} className="mr-2" />
                <span>{item.name}</span>
              </Link>

              {item.children && (
                <button
                  onClick={(event) => toggleMenu(item.path, event)}
                  className="p-2 rounded-md transition duration-300 ease-linear"
                >
                  {isOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              )}
            </div>

            {item.children && isOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {renderLevels(item.children, true)}
              </div>
            )}
          </div>
        );
      });
  };

  if (!profile) return <NavigationSkeleton />;

  return <>{renderLevels(navigationMain)}</>;
}
