import React from "react";
import Articles from "../cards/articles/articles";

export const tabPostConfigurations = [
  {
    value: "news",
    name: "Noticias",
    label: "Publicadas",
    title: "Noticias",
    description: "As noticias publicadas em seu site.",
    component: <Articles />,
    path: "/postagens",
  },

  {
    value: "draft",
    label: "Rascunho",
    title: "Noticias",
    name: "Noticias",
    description: "Continue a editar sua noticia.",
    component: <Articles />,
    path: "/postagens/artigos/criar",
  },
  {
    value: "review",
    label: "Revisão",
    title: "Noticias",
    name: "Noticias",
    description: "Revisão para publicação da noticia",
    component: <Articles />,
    path: "/postagens/artigos/criar",
  },
  {
    value: "rejected",
    label: "Rejeitadas",
    title: "Noticias",
    name: "Noticias",
    description: "Noticias rejeitadas e não publicadas.",
    component: <Articles />,
    path: "/postagens/artigos/criar",
  },
];
