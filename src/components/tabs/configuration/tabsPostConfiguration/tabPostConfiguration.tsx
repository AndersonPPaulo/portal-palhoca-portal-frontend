import React from "react";
import Articles from "../../cards/articles/articles";

export interface TabConfig {
  value: string;
  name: string;
  label: string;
  title: string;
  description: string;
  component: React.ReactNode;
  path: string;
  allowedRoles: string[];
}

export const tabPostConfigurations: TabConfig[] = [
  {
    value: "PUBLISHED",
    name: "Notícias",
    label: "Publicadas",
    title: "Notícias",
    description: "As Notícias publicadas em seu site.",
    component: <Articles status="PUBLISHED" />,
    path: "/postagens/artigos/criar",
    allowedRoles: [
      "administrador",
      "chefe de redação",
      "jornalista",
      "colunista",
    ],
  },
  {
    value: "UNPUBLISHED",
    name: "Notícias",
    label: "Despublicadas",
    title: "Notícias",
    description: "As Notícias despublicadas em seu site.",
    component: <Articles status="UNPUBLISHED" />,
    path: "/postagens/artigos/criar",
    allowedRoles: [
      "administrador",
      "chefe de redação",
      "jornalista",
      "colunista",
    ],
  },
  {
    value: "DRAFT",
    label: "Rascunho",
    title: "Notícias",
    name: "Notícias",
    description: "Continue a editar sua noticia.",
    component: <Articles status="DRAFT" />,
    path: "/postagens/artigos/criar",
    allowedRoles: [
      "administrador",
      "chefe de redação",
      "jornalista",
      "colunista",
    ],
  },
  {
    value: "PENDING_REVIEW",
    label: "Revisão",
    title: "Notícias",
    name: "Notícias",
    description: "Revisão para publicação da noticia",
    component: <Articles status="PENDING_REVIEW" />,
    path: "/postagens/artigos/criar",
    allowedRoles: ["administrador", "chefe de redação"],
  },
  {
    value: "REJECTED",
    label: "Rejeitadas",
    title: "Notícias",
    name: "Notícias",
    description: "Notícias rejeitadas e não publicadas.",
    component: <Articles status="REJECTED" />,
    path: "/postagens/artigos/criar",
    allowedRoles: [
      "administrador",
      "chefe de redação",
      "jornalista",
      "colunista",
    ],
  },
  {
    value: "CHANGES_REQUESTED",
    label: "Mudanças necessárias",
    title: "Notícias",
    name: "Notícias",
    description: "Notícias que precisam de alterações.",
    component: <Articles status="CHANGES_REQUESTED" />,
    path: "/postagens/artigos/criar",
    allowedRoles: [
      "administrador",
      "chefe de redação",
      "jornalista",
      "colunista",
    ],
  },
];

export const filterTabsByRole = (tabs: any[], userRole?: string) => {
  if (!userRole) return [];

  const normalizedRole = userRole.toLowerCase();
  const allowedSystemRoles = [
    "administrador",
    "chefe de redação",
    "jornalista",
    "colunista",
  ];

  if (!allowedSystemRoles.includes(normalizedRole)) return [];

  return tabs.filter((tab) => {
    return tab.allowedRoles.some(
      (role: string) => role.toLowerCase() === normalizedRole
    );
  });
};
