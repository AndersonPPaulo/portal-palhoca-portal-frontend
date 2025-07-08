// "use client";

// import Header from "@/components/header";
// import FilterCategorys from "@/components/painel/cards/postagens/categorys/filters";
// import TableCategorys from "@/components/tables/categorys/page";
// import { Card } from "@/components/ui/card";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// interface FilterState {
//   status: boolean | null;
// }

// const Categorys = () => {
//   const [filter, setFilter] = useState("");
//   const { push } = useRouter();

//   const [activeFilters, setActiveFilters] = useState<FilterState>({
//     status: null,
//   });
//   return (
//     <div className="h-screen bg-primary-light flex flex-col overflow-hidden">
//         <Header
//         title="Categorias"
//         text_button="Cadastrar Categoria"
//         onClick={() => push("/postagens/categorias/criar")}
//         description="Listagem de categorias."
//         />
//         <div className="flex flex-col gap-4 h-full p-4">
//       {/* <Card className="rounded-3xl min-h-[140px] bg-white flex items-center gap-4 p-4">
//         <FilterCategorys
//           filter={filter}
//           setFilter={setFilter}
//           onFilterChange={setActiveFilters}
//         />
//       </Card> */}
//       {/* <Card className="bg-white rounded-3xl px-4">
//         <TableCategorys filter={filter} activeFilters={activeFilters} />
//       </Card> */}
//       </div>
//     </div>
//   );
// };

// export default Categorys;
