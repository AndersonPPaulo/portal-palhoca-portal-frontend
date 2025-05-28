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

  const getVisibleTabs = (userRole: string): string[] => {
    const roleName = userRole.toLowerCase();
    
    switch (roleName) {
      case "jornalista":
      case "colunista":
      case "chefe de redação":
        return ["/dashboard", "/postagens"]; 
      
      case "gerente comercial":
      case "vendedor":
        return ["/dashboard", "/banners", "/comercio"]; 
      
      case "administrador":
        return ["all"]; 
      
      default:
        return ["/dashboard"]; 
    }
  };

  // Função para verificar se um item deve ser visível
  const isItemVisible = (itemPath: string | undefined, userRole: string): boolean => {
    if (!itemPath) return true;
    
    const visibleTabs = getVisibleTabs(userRole);
    
    // Se for administrador, pode ver tudo
    if (visibleTabs.includes("all")) return true;
    
      itemPath === allowedPath || itemPath.startsWith(allowedPath + "/")
    );
  };

  const filterNavigationByRole = (items: NavigationList, userRole: string): NavigationList => {
    return items
      .filter(item => {
        if (item.path === "/usuarios" && userRole.toLowerCase() !== "administrador") {
          return false;
        }
        
        return isItemVisible(item.path, userRole);
      })
      .map(item => ({
        ...item,
        children: item.children 
          ? filterNavigationByRole(item.children, userRole)
          : undefined
      }))
      .filter(item => {
        if (item.children) {
          return item.children.length > 0 || isItemVisible(item.path, userRole);
        }
        return true;
      });
  };

  const renderLevels = (data: NavigationList, isChild = false) => {
    return data.map((item, index) => {
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

  const filteredNavigation = filterNavigationByRole(navigationMain, profile.role.name);

  return <>{renderLevels(filteredNavigation)}</>;
}