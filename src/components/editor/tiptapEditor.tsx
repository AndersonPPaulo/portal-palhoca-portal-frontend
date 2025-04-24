import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useState } from "react";
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
  CodeSquare,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  UnderlineIcon,
} from "lucide-react";
import CodeBlock from "@tiptap/extension-code-block";

interface TiptapEditorProps {
  value: string;
  onChange: (content: string) => void;
}

const TiptapEditor = ({
  value = "</br> </br> </br> </br> </br> </br>",
  onChange,
}: TiptapEditorProps) => {
  const [isClient, setIsClient] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 300, height: 200 });

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
      CodeBlock,
    ],

    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("thumbnail", file);

    try {
      const response = await fetch("http://localhost:5555/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Falha ao fazer upload da imagem");
      }

      const data = await response.json();
      const imageUrl = `http://localhost:5555/${data.url}`;

      editor?.chain().focus().setImage({ src: imageUrl }).run();

      setTimeout(() => {
        const lastImage = editor?.view.dom.querySelector("img:last-of-type");
        if (lastImage) {
          editor
            ?.chain()
            .focus()
            .updateAttributes("image", {
              width: imageSize.width.toString(),
              height: imageSize.height.toString(),
            })
            .run();
        }
      }, 10);
    } catch (error) {
      alert(error);
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
    <div className="border p-4 rounded-[32px] min-h-[300px] ">
      <div className="mb-2 space-x-2 flex flex-wrap ">
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

        <label className="px-2 py-1 border rounded cursor-pointer bg-gray-100">
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
        </div>

        <span
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive("codeBlock") ? "bg-gray-200" : ""
          }`}
        >
          <CodeSquare />
        </span>

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
        className="p-4 border rounded-b-[24px] no-scrollbar max-h-[400px] min-h-[300px] overflow-y-auto overflow-x-hidden break-words"
        editor={editor}
      />
    </div>
  );
};

export default TiptapEditor;
