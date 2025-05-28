import React, { useContext, useEffect } from "react";
import Comercio from "../cards/company/company";
import CategoriaComercio from "../cards/company-category/companyCategory";



export const tabCompanyConfigurations = [
  {
    value: "company",
    label: "Comércios",
    name: "Comércios",
    title: "Comércios",
    description:
      "Gerencie, edite e monitore os comércios cadastrados do seu site.",
    component: <Comercio />,
    path: "/comercio/criar",

  },
  {
    value: "categoria",
    title: "Categorias",
    name: "Categorias",
    label: "Categorias de comércios",
    description:
      "Gerencie, edite e monitore as categorias dos comércios cadastrados do seu site.",
    component: <CategoriaComercio/>,
    path: "/comercio/categoria/criar",
    
  },
];
