import { useContext, useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { UserContext } from "@/providers/user";
import {
  Article,
  ArticleContext,
  ArticleListParams,
} from "@/providers/article";

interface TableArticlesProps {
  filter: string;
  activeFilters: {
    status: string;
    categories: string[];
    highlight: boolean | null;
    creators: string[];
  };
}

export default function TableArticles({
  filter,
  activeFilters,
}: TableArticlesProps) {
  const { ListAuthorArticles, listArticles } = useContext(ArticleContext);
  const { profile } = useContext(UserContext);
  const [_loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 9,
  });

useEffect(() => {
  const fetchArticles = async () => {
    setLoading(true);
    try {
      if (profile?.id) {
        const params: ArticleListParams = {
          status: activeFilters.status,
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          highlight:
            activeFilters.highlight !== null
              ? activeFilters.highlight
              : undefined,
          title: filter || undefined, // Busca por título e tags
        };

        // Envia a primeira categoria (caso haja uma selecionada)
        if (activeFilters.categories.length === 1) {
          params.category_name = activeFilters.categories[0];
        }

        // Aplica filtro por nome de criador (opcional: só se backend aceitar `creatorName`)
        // if (activeFilters.creators.length === 1) {
        //   params.creatorName = activeFilters.creators[0];
        // }

        const roleName = profile.role.name.toLowerCase();

        if (roleName === "chefe de redação") {
          params.chiefEditorId = profile.id;
          await ListAuthorArticles(undefined, params);
        } else if (roleName === "jornalista" || roleName === "colunista") {
          await ListAuthorArticles(profile.id, params);
        } else {
          await ListAuthorArticles(undefined, params);
        }
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (profile?.id) {
    fetchArticles();
  }
}, [profile, pagination.pageIndex, pagination.pageSize, activeFilters, filter]);


  const filteredArticles =
    listArticles?.data?.filter((item: Article) => {
      const search = filter.toLowerCase();

      const matchesSearch =
        (item.title?.toLowerCase()?.includes(search) ?? false) ||
        (item.tags?.some((tag) => tag.name?.toLowerCase()?.includes(search)) ??
          false);

      const matchesCategory =
        activeFilters.categories.length === 0 ||
        (item.category?.name &&
          activeFilters.categories.includes(item.category.name));

      const matchesHighlight =
        activeFilters.highlight === null ||
        item.highlight === activeFilters.highlight;

      const matchesCreator =
        (activeFilters.creators?.length ?? 0) === 0 ||
        (item.creator?.name &&
          activeFilters.creators?.includes(item.creator.name));

      return (
        matchesSearch && matchesCategory && matchesHighlight && matchesCreator
      );
    }) || [];

  return (
    <DataTable
      columns={columns}
      data={filteredArticles}
      totalPages={Number(listArticles?.meta?.totalPages || 1)}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
}
