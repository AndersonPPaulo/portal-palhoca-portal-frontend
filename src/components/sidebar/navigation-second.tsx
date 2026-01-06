"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navigationSecond } from "./list-nav";
import { destroyCookie } from "nookies";

interface NavigationItem {
  name: string;
  icon: React.ElementType;
  path?: string;
}

type NavigationList = NavigationItem[];

interface NavigationSecondProps {
  isCollapsed?: boolean;
}

export function NavigationSecond({
  isCollapsed = false,
}: NavigationSecondProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    destroyCookie(null, "user:token", { path: "/" });
    router.push("/");
  };

  const renderLevels = (data: NavigationList) => {
    return data.map((item, index) => {
      const isActive = item.path === pathname;
      const isLogout = item.name === "Sair";

      const commonClasses = `${
        isActive
          ? "bg-primary-light hover:bg-primary-light/80 text-primary"
          : "hover:bg-zinc-100"
      } flex font-[600] items-center text-zinc-800 py-2 rounded-[48px] transition duration-300 ease-linear ${
        isCollapsed ? "lg:justify-center lg:px-2" : "px-6"
      }`;

      if (isLogout) {
        return (
          <button
            key={index}
            onClick={handleLogout}
            className={commonClasses}
            title={isCollapsed ? item.name : undefined}
          >
            <item.icon size={18} className={isCollapsed ? "" : "mr-2"} />
            <span className={isCollapsed ? "lg:hidden" : ""}>{item.name}</span>
          </button>
        );
      }

      return (
        <Link
          key={index}
          href={item.path ?? "#"}
          className={commonClasses}
          title={isCollapsed ? item.name : undefined}
        >
          <item.icon size={18} className={isCollapsed ? "" : "mr-2"} />
          <span className={isCollapsed ? "lg:hidden" : ""}>{item.name}</span>
        </Link>
      );
    });
  };

  return <>{renderLevels(navigationSecond)}</>;
}
