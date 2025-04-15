import { Home, ListIcon, User, LogOut, Users, Dot, Store } from "lucide-react";

export const navigationMain = [
  {
    name: "Home",
    icon: Home,
    path: "/dashboard",
  },
  {
    name: "Postagens",
    icon: ListIcon,
    path: "/postagens",
    children: [
      {
        name: "Artigo",
        icon: Dot,
        path: "/postagens/artigos/criar",
      },
      {
        name: "Tags",
        icon: Dot,
        path: "/postagens/tags/criar",
      },
      {
        name: "Categorias",
        icon: Dot,
        path: "/postagens/categorias/criar",
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
