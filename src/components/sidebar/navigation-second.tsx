"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navigationSecond } from "./list-nav";
import { destroyCookie, parseCookies } from "nookies";

interface NavigationItem {
  name: string;
  icon: React.ElementType;
  path?: string;
}

type NavigationList = NavigationItem[];

export function NavigationSecond() {
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
      } flex font-[600] items-center text-zinc-800 py-2 px-6 rounded-[48px] transition duration-300 ease-linear`;

      if (isLogout) {
        return (
          <button key={index} onClick={handleLogout} className={commonClasses}>
            <item.icon size={18} className="mr-2" />
            {item.name}
          </button>
        );
      }

      return (
        <Link key={index} href={item.path ?? "#"} className={commonClasses}>
          <item.icon size={18} className="mr-2" />
          {item.name}
        </Link>
      );
    });
  };

  return <>{renderLevels(navigationSecond)}</>;
}
