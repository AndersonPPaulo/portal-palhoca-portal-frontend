import React from "react";
import Articles from "../cards/articles/articles";

export const tabPostConfigurations = [
  {
    value: "PUBLISHED",
    name: "Noticias",
    label: "Publicadas",
    title: "Noticias",
    description: "As noticias publicadas em seu site.",
    component: <Articles status="PUBLISHED" />,
    path: "/postagens/artigos/criar",
  },

  {
    value: "DRAFT",
    label: "Rascunho",
    title: "Noticias",
    name: "Noticias",
    description: "Continue a editar sua noticia.",
    component: <Articles status="DRAFT" />,
    path: "/postagens/artigos/criar",
  },
  {
    value: "PENDING_REVIEW",
    label: "Revisão",
    title: "Noticias",
    name: "Noticias",
    description: "Revisão para publicação da noticia",
    component: <Articles status="PENDING_REVIEW" />,
    path: "/postagens/artigos/criar",
  },
  {
    value: "REJECTED",
    label: "Rejeitadas",
    title: "Noticias",
    name: "Noticias",
    description: "Noticias rejeitadas e não publicadas.",
    component: <Articles status="REJECTED" />,
    path: "/postagens/artigos/criar",
    
  },
  {
    value: "CHANGES_REQUESTED",
    label: "Mudanças necessárias",
    title: "Noticias",
    name: "Noticias",
    description: "Noticias rejeitadas e não publicadas.",
    component: <Articles status="CHANGES_REQUESTED" />,
    path: "/postagens/artigos/criar",
    
  },
];
