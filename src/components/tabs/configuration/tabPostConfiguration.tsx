import React from "react";
import Articles from "../cards/articles/articles";
import Categorys from "../cards/categorys/categorys";
import Tags from "../cards/tags/tags";

export const tabPostConfigurations = [
  {
    value: "articles",
    label: "Artigos",
    description:
      "Gerencie, edite e monitore os artigos postados no blog do seu site.",
    component: <Articles />,
    path: "/postagens/artigos/criar",
  },
  {
    value: "tags",
    label: "Tags de semelhança",
    description:
      "Gerencie as tags de semelhança para melhor ranqueamento no google.",
    component: <Tags />,
    path: "/postagens/tags/criar",
  },
  {
    value: "categorys",
    label: "Categorias",
    description:
      "Gerencie as categorias dos artigos postados no blog do seu site.",
    component: <Categorys />,
    path: "/postagens/categorias/criar",
  },
  
];
