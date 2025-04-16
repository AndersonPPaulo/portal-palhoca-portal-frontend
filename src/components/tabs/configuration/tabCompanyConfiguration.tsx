import React from "react";
import Comercio from "../cards/company/company";
import TableCategoryCompany from "@/components/tables/company-category/page";

export const tabCompanyConfigurations = [
  {
    value: "company",
    label: "Comércios",
    description:
      "Gerencie, edite e monitore os comércios cadastrados do seu site.",
    component: <Comercio />,
    path: "/comercio",
  },
  {
    value: "companyCategory",
    label: "Categorias de comércios",
    description:
      "Gerencie, edite e monitore as categorias dos comércios cadastrados do seu site.",
    component: <TableCategoryCompany/>,
    path: "/comercio/categoria",
  },
  
];
