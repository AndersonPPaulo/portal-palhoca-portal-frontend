import { DataTable } from "./data-table";
import { useContext, useEffect, useState } from "react";
import { columns } from "./columns";
import { UserContext } from "@/providers/user";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface TableUsersProps {
  filter: string;
  activeFilters: {
    status: boolean | null;
  };
}

export default function TableUsers({
  filter,
  activeFilters,
}: TableUsersProps) {
  const { ListUser, listUser } = useContext(UserContext);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      await ListUser();
    };

    fetch();
  }, [ListUser]);

  // Se listUser ainda não foi carregado, evite tentar usar .filter
  const filteredUsers = listUser?.length
    ? listUser.filter((item) => {
        const search = filter.toLowerCase();

        // Busca por nome, email, telefone ou função
        const matchesSearch = 
          item.name.toLowerCase().includes(search) ||
          item.email.toLowerCase().includes(search) ||
          item.phone.toLowerCase().includes(search) ||
          item.role?.name.toLowerCase().includes(search) ||
          item.topic?.toLowerCase().includes(search);

        // Filtro por status (isActive)
        const matchesStatus =
          activeFilters.status === null || 
          activeFilters.status === item.isActive;

        return matchesSearch && matchesStatus;
      })
    : [];

  return (
    <>
      <DataTable 
        columns={columns} 
        data={filteredUsers} 
      />

      {selectedImage && (
        <Dialog
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
        >
          <DialogContent className="max-w-2xl mx-auto p-4 rounded-xl bg-white shadow-xl z-50">
            <DialogTitle>
              Preview Imagem do Usuário
            </DialogTitle>
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