"use client";

import { DataTable } from "./data-table";
import { useContext, useEffect, useState } from "react";
import { columns } from "./columns";
import { BannerContext } from "@/providers/banner";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";

interface TableBannersProps {
  filter: string;
  activeFilters: {
    status: boolean | null;
  };
}

export default function TableBanners({
  filter,
  activeFilters,
}: TableBannersProps) {
  const { ListBanners, banners } = useContext(BannerContext);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      await ListBanners(1, 10, false, true);
    };

    fetch();
  }, []);

  // Se banners.data ainda não foi carregado, evite tentar usar .filter
  const filteredBanners = banners?.data?.length
    ? banners.data.filter((item) => {
        const search = filter.toLowerCase();

        const matchesSearch = item.name.toLowerCase().includes(search);

        const matchesStatus =
          activeFilters.status === null || activeFilters.status === item.status;

        return matchesSearch && matchesStatus;
      })
    : [];

  return (
    <>
      <DataTable columns={columns(setSelectedImage)} data={filteredBanners} />

      {selectedImage && (
        <Dialog
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
        >
          <DialogContent className=" max-w-2xl mx-auto p-4 rounded-xl bg-white shadow-xl z-50">
            <DialogTitle>Preview Banner</DialogTitle>
            <img
              src={selectedImage}
              alt="Preview"
              className="rounded-xl shadow-md w-full max-h-[80vh] object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-black text-xl font-bold hover:scale-110 transition-transform"
            >
              ×
            </button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
