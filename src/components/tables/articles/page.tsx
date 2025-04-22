import { useContext, useEffect } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

import { ArticleContext } from "@/providers/article";
import { User } from "lucide-react";
import { UserContext } from "@/providers/user";

interface TableArticlesProps {
  filter: string;
  activeFilters: {
    // status: boolean | null;
    categories: string[];
    // creators: string[];
    highlight: boolean | null;
  };
}

export default function TableArticles({
  filter,
  activeFilters,
}: TableArticlesProps) {
  const { ListArticles, listArticles } = useContext(ArticleContext);
  console.log("listArticles", listArticles?.data);
  const { profile } = useContext(UserContext);
  console.log("profile", profile);

  useEffect(() => {
    if (profile === null) return;
    if (profile.id) {
      const fetch = async () => {
        await ListArticles(profile!.id);
      };
      fetch();
    }
  }, [profile]);

  const filteredArticles = listArticles?.data.filter((item) => {
    const search = filter.toLowerCase();

    const matchesSearch =
      item.title.toLowerCase().includes(search) ||
      item.tags.some((tag) => tag.name.toLowerCase().includes(search));

    const matchesCategory =
      activeFilters.categories.length === 0 ||
      activeFilters.categories.includes(item.category.name);

    // const matchesCreator =
    //   activeFilters.creators.length === 0 ||
    //   activeFilters.creators.includes(item.creator);

    // const matchesStatus =
    //   activeFilters.status === null || item.status !== activeFilters.status;

    const matchesHighlight =
      activeFilters.highlight === null ||
      item.highlight === activeFilters.highlight;

    return (
      matchesSearch &&
      // matchesStatus &&
      matchesCategory &&
      // matchesCreator &&
      matchesHighlight
    );
  });

  return <DataTable columns={columns} data={filteredArticles ?? []} />;
}
