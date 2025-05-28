import { Home, ListIcon, User, LogOut, Users, Dot, Store } from "lucide-react";

export const navigationMain = [
  {
    name: "Home",
    icon: Home,
    path: "/dashboard",
  },
  {
    name: "Noticias",
    icon: ListIcon,
    path: "/postagens",
    children: [
      {
        name: "Tags",
        icon: Dot,
        path: "/postagens/tags",
      },
      {
        name: "Categorias",
        icon: Dot,
        path: "/postagens/categorias",
      },
    ],
  },
  {
    name: "Autores",
    icon: Users,
    path: "/autores",
  },
  {
    name: "Comércios",
    icon: Store,
    path: "/comercio",
  },
  {
    name: "Banners",
    icon: Store,
    path: "/banners",
  },
];

export const navigationSecond = [
  {
    name: "Minha conta",
    icon: User,
    path: "/minha-conta",
  },
  {
    name: "Sair",
    icon: LogOut,
    path: "/",
  },
];
