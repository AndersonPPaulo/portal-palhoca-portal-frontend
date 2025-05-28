import { Home,  User, LogOut, Users, Dot, Store, NotebookPen } from "lucide-react";
import { RiMegaphoneLine } from "react-icons/ri";


export const navigationMain = [
  {
    name: "Home",
    icon: Home,
    path: "/dashboard",
  },
  {
    name: "Noticias",
    icon: NotebookPen ,
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
    name: "Comércios",
    icon: Store,
    path: "/comercio",
  },
  {
    name: "Banners",
    icon: RiMegaphoneLine,
    path: "/banners",
  },
  {
    name: "Usuários",
    icon: Users,
    path: "/usuarios",
  }
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

