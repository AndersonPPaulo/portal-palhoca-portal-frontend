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

export function NavigationSecond() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    destroyCookie(null, "user:token");
    router.push("/");
  };

  const renderLevels = (data: NavigationList) => {
    return data.map((item, index) => {
      const isLogout = item.name === "Sair";

      return isLogout ? (
        <Link
          key={index}
          onClick={handleLogout}
          href={item.path ?? "#"}
          className={`${
            item.path === pathname
              ? "bg-primary-light hover:bg-primary-light/80 text-primary"
              : "hover:bg-zinc-100"
          } flex font-[600] items-center text-zinc-800 py-2 px-6 rounded-[48px] hover:bg-zinc-100 transition duration-300 ease-linear`}
        >
          {<item.icon size={18} className="mr-2" />}
          {item.name}
        </Link>
      ) : (
        <Link
          key={index}
          href={item.path ?? "#"}
          className={`${
            item.path === pathname
              ? "bg-primary-light hover:bg-primary-light/80 text-primary"
              : "hover:bg-zinc-100"
          } flex font-[600] items-center text-zinc-800 py-2 px-6 rounded-[48px] hover:bg-zinc-100 transition duration-300 ease-linear`}
        >
          {<item.icon size={18} className="mr-2" />}
          {item.name}
        </Link>
      );
    });
  };

  return <>{renderLevels(navigationSecond)}</>;
}
