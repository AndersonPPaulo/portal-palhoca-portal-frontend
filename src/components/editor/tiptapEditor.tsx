/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useRef, useState } from "react";
import { CustomImage } from "@/lib/customImagem";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import Link from "@tiptap/extension-link";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  UnderlineIcon,
  Image as ImageIcon,
} from "lucide-react";

interface TiptapEditorProps {
  value: string;
  onChange: (content: string) => void;
}

const TiptapEditor = ({
  value = "</br> </br> </br> </br> </br> </br>",
  onChange,
}: TiptapEditorProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage,
      BulletList,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Link,
      // CodeBlock,
    ],

    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  // upload service
  // importa `api` e `parseCookies` dinamicamente aqui para não quebrar SSR
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Função para comprimir imagem
  const compressImage = (file: File, maxSizeMB: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Redimensionar se for muito grande (max 1920px de largura)
          const maxWidth = 1920;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Tentar comprimir com qualidade decrescente até atingir o tamanho desejado
          let quality = 0.9;
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Erro ao comprimir imagem"));
                  return;
                }

                const compressedSize = blob.size / 1024 / 1024; // em MB

                if (compressedSize <= maxSizeMB || quality <= 0.1) {
                  const compressedFile = new File([blob], file.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  quality -= 0.1;
                  tryCompress();
                }
              },
              "image/jpeg",
              quality
            );
          };

          tryCompress();
        };
        img.onerror = () => reject(new Error("Erro ao carregar imagem"));
      };
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    });
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione apenas arquivos de imagem.");
        return;
      }

      const { parseCookies } = await import("nookies");
      const { api } = await import("@/service/api");
      const { "user:token": token } = parseCookies();

      if (!token) {
        throw new Error(
          "Token de autenticação não encontrado. Faça login novamente."
        );
      }

      const fileSizeMB = file.size / 1024 / 1024;
      const MAX_SIZE_MB = 2; // Limite de 2MB

      console.log("📤 Preparando upload de imagem...", {
        fileName: file.name,
        fileSize: `${fileSizeMB.toFixed(2)}MB`,
        maxSize: `${MAX_SIZE_MB}MB`,
      });

      let fileToUpload = file;

      // Comprimir se for maior que o limite
      if (fileSizeMB > MAX_SIZE_MB) {
        console.log("🔄 Imagem muito grande, comprimindo...");
        alert(
          `A imagem tem ${fileSizeMB.toFixed(
            2
          )}MB e será comprimida para ${MAX_SIZE_MB}MB...`
        );
        try {
          fileToUpload = await compressImage(file, MAX_SIZE_MB);
          const compressedSizeMB = fileToUpload.size / 1024 / 1024;
          console.log(`✅ Imagem comprimida: ${compressedSizeMB.toFixed(2)}MB`);
        } catch (compressError) {
          console.error("❌ Erro ao comprimir:", compressError);
          throw new Error(
            "Não foi possível comprimir a imagem. Tente uma imagem menor."
          );
        }
      }

      const formData = new FormData();
      formData.append("image", fileToUpload);

      const config = {
        headers: {
          Authorization: `bearer ${token}`,
        },
      };

      console.log("📤 Enviando imagem para a API...", {
        endpoint: "/upload/article-image",
        fileName: fileToUpload.name,
        fileSize: `${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`,
      });

      const response = await api.post(
        "/upload/article-image",
        formData,
        config
      );

      console.log("✅ Resposta da API:", response);

      if (!response || !response.data) {
        throw new Error("Resposta inválida da API (response.data é undefined)");
      }

      const imageUrl =
        response.data.imageUrl ||
        response.data.url ||
        response.data.thumbnailUrl ||
        response.data.link ||
        "";

      console.log("🖼️ URL da imagem retornada:", imageUrl);

      if (!imageUrl) {
        console.error("❌ Estrutura da resposta:", response.data);
        throw new Error(
          "URL da imagem não retornada pela API. Verifique o console."
        );
      }

      editor
        ?.chain()
        .focus()
        .setImage({
          src: imageUrl,
          width: "100%",
          height: "auto",
        } as any)
        .run();

      console.log("✅ Imagem inserida no editor com sucesso!");
    } catch (err: any) {
      console.error("❌ Erro upload imagem no editor:", err);
      console.error("Detalhes do erro:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code,
      });

      let errorMessage = "Erro desconhecido ao enviar imagem";

      // Tratamento específico para erro 413 (Content Too Large)
      if (err.response?.status === 413 || err.code === "ERR_NETWORK") {
        errorMessage =
          "A imagem é muito grande para o servidor. Tente uma imagem menor ou de menor resolução.";
        console.error("💡 Sugestão: Reduza a qualidade ou tamanho da imagem.");
      } else if (err.response?.status === 401) {
        errorMessage = "Sessão expirada. Faça login novamente.";
      } else if (err.response?.status === 403) {
        errorMessage = "Você não tem permissão para enviar imagens.";
      } else if (err.response?.status === 404) {
        errorMessage = "Endpoint de upload não encontrado. Contate o suporte.";
      } else if (err.response?.status === 500) {
        errorMessage = "Erro no servidor. Tente novamente mais tarde.";
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      alert(`Erro ao enviar imagem: ${errorMessage}`);
    } finally {
      // limpar valor para permitir re-upload do mesmo arquivo se necessário
      if (event.target) event.target.value = "";
    }
  };

  // Removido useEffect que forçava tamanhos fixos - agora as imagens são responsivas

  if (!isClient) return null;
  if (!editor) return null;

  const getAlignmentClass = (alignment: string) => {
    const currentAlign = editor?.getAttributes("paragraph")?.textAlign;
    const currentHeadingAlign = editor?.getAttributes("heading")?.textAlign;

    const currentAlignValue = currentAlign || currentHeadingAlign;

    return currentAlignValue === alignment ? "bg-gray-200" : "";
  };

  return (
    <div className="w-full border p-4 rounded-[32px] min-h-[300px]">
      <div className="mb-2 space-x-2 flex w-full overflow-x-auto pb-2">
        <span
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive("bold") ? "bg-gray-200" : ""
          }`}
        >
          <Bold />
        </span>

        <span
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive("italic") ? "bg-gray-200" : ""
          }`}
        >
          <Italic />
        </span>

        <span
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive("underline") ? "bg-gray-200" : ""
          }`}
        >
          <UnderlineIcon />
        </span>

        <span
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-2 py-1 border rounded ${
            editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""
          }`}
        >
          <Heading1 />
        </span>
        <span
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-2 py-1 border rounded ${
            editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""
          }`}
        >
          <Heading2 />
        </span>
        <span
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`px-2 py-1 border rounded ${
            editor.isActive("heading", { level: 3 }) ? "bg-gray-200" : ""
          }`}
        >
          <Heading3 />
        </span>

        <span
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive("bulletList") ? "bg-gray-200" : ""
          }`}
        >
          <List />
        </span>

        <span
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`px-2 py-1 border rounded ${getAlignmentClass("center")}`}
        >
          <AlignCenter />
        </span>

        <span
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`px-2 py-1 border rounded ${getAlignmentClass("left")}`}
        >
          <AlignLeft />
        </span>

        <span
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`px-2 py-1 border rounded ${getAlignmentClass("right")}`}
        >
          <AlignRight />
        </span>

        <span
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`px-2 py-1 border rounded ${getAlignmentClass("justify")}`}
        >
          <AlignJustify />
        </span>

        <span
          onClick={() => fileInputRef.current?.click()}
          className={`px-2 py-1 border rounded cursor-pointer hover:bg-gray-100`}
          title="Adicionar imagem (máx. 2MB - compressão automática se necessário)"
        >
          <ImageIcon />
        </span>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* <label className="px-2 py-1 border rounded cursor-pointer bg-gray-100">
          Upload de Imagem
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>

        <div className="flex items-center space-x-2">
          <span>Tamanho:</span>
          <input
            type="number"
            value={imageSize.width}
            onChange={(e) =>
              setImageSize({ ...imageSize, width: Number(e.target.value) })
            }
            className="w-16 border rounded px-2 py-1"
          />
          <input
            type="number"
            value={imageSize.height}
            onChange={(e) =>
              setImageSize({ ...imageSize, height: Number(e.target.value) })
            }
            className="w-16 border rounded px-2 py-1"
          />
        </div> */}

        {/* <span
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive("codeBlock") ? "bg-gray-200" : ""
          }`}
        >
          <CodeSquare />
        </span> */}

        <span
          onClick={() => {
            const url = prompt("Enter the URL");
            if (url) {
              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url })
                .run();
            }
          }}
          className={`px-2 py-1 border rounded ${
            editor.isActive("link") ? "bg-gray-200" : ""
          }`}
        >
          <Link2 />
        </span>
      </div>

      <EditorContent
        onClick={() => editor?.chain().focus().run()}
        className="p-4 border rounded-b-[24px] overflow-y-auto overflow-x-hidden max-h-[400px] min-h-[300px] w-full"
        editor={editor}
      />
    </div>
  );
};

export default TiptapEditor;
