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
  const [imageSize] = useState({ width: 300, height: 200 });

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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { parseCookies } = await import("nookies");
      const { api } = await import("@/service/api");
      const { "user:token": token } = parseCookies();

      if (!token) {
        throw new Error(
          "Token de autenticação não encontrado. Faça login novamente."
        );
      }

      const formData = new FormData();
      formData.append("image", file);

      const config = {
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      console.log("📤 Enviando imagem para a API...", {
        endpoint: "/upload/article-image",
        fileName: file.name,
        fileSize: file.size,
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
          width: `${imageSize.width}px`,
          height: `${imageSize.height}px`,
        } as any)
        .run();

      console.log("✅ Imagem inserida no editor com sucesso!");
    } catch (err: any) {
      console.error("❌ Erro upload imagem no editor:", err);
      console.error("Detalhes do erro:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Erro desconhecido ao enviar imagem";

      alert(
        `Erro ao enviar imagem: ${errorMessage}\n\nVerifique o console para mais detalhes.`
      );
    } finally {
      // limpar valor para permitir re-upload do mesmo arquivo se necessário
      if (event.target) event.target.value = "";
    }
  };

  useEffect(() => {
    if (!editor) return;

    editor.commands.setContent(
      editor
        .getHTML()
        .replace(
          /<img/g,
          `<img style="width: ${imageSize.width}px; height: ${imageSize.height}px;"`
        )
    );
  }, [imageSize, editor]);

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
          className={`px-2 py-1 border rounded`}
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
