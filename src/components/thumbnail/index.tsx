"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import CustomInput from "../input/custom-input";

interface ThumbnailUploaderProps {
  onImageUpload?: (imageFile: File, previewUrl: string, description?: string) => void;
  initialImage?: string;
  // Props para personalização de textos
  label?: string;
  modalTitle?: string;
  uploadAreaText?: string;
  uploadAreaSubtext?: string;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  processingText?: string;
  successMessage?: string;
  // Props para configurações
  maxFileSize?: number; 
  acceptedFormats?: string[];
  required?: boolean;
  showDescription?: boolean; 
}

export default function ThumbnailUploader({
  onImageUpload,
  initialImage,
  label = "Imagem de Thumbnail",
  modalTitle = "Adicionar Thumbnail",
  uploadAreaText = "Clique para adicionar uma imagem",
  uploadAreaSubtext = "SVG, PNG, JPG ou GIF (max. 5MB)",
  descriptionLabel = "Descrição da imagem",
  descriptionPlaceholder = "Descrição da imagem",
  confirmButtonText = "Selecionar",
  cancelButtonText = "Cancelar",
  processingText = "Processando...",
  successMessage = "Imagem selecionada com sucesso!",
  maxFileSize = 5, 
  acceptedFormats = ["image/*"],
  required = false,
  showDescription = true 
}: ThumbnailUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImage || null
  );
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (initialImage) {
      setPreviewUrl(initialImage);
    }
  }, [initialImage]);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError(false);
  };

  const saveImage = async () => {
    if (!selectedFile) {
      setError(true);
      toast.error("Selecione uma imagem primeiro!");
      return;
    }

    try {
      setLoading(true);

      // Verificar se é uma imagem
      if (!selectedFile.type.startsWith("image/")) {
        setError(true);
        toast.error("O arquivo deve ser uma imagem!");
        return;
      }

      if (onImageUpload) {
        onImageUpload(selectedFile, previewUrl!, showDescription ? description : undefined);
      }

      toast.success(successMessage);
      closeModal();
    } catch (error: any) {
      console.error("Erro ao processar imagem:", error);
      toast.error(error.message || "Ocorreu um erro ao processar a imagem.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(false);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Verificar se é uma imagem
      if (!file.type.startsWith("image/")) {
        setError(true);
        toast.error("O arquivo deve ser uma imagem!");
        return;
      }

      // Verificar tamanho do arquivo
      if (file.size > maxFileSize * 1024 * 1024) {
        setError(true);
        toast.error(`A imagem deve ter no máximo ${maxFileSize}MB`);
        return;
      }

      setSelectedFile(file);

      // Criar URL temporária para preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  // Formatação dinâmica do subtexto com tamanho máximo
  const getDynamicSubtext = () => {
    const formats = acceptedFormats
      .map(format => format.replace("image/", "").toUpperCase())
      .join(", ");
    return uploadAreaSubtext.includes("max") 
      ? uploadAreaSubtext.replace(/max\. \d+MB/, `max. ${maxFileSize}MB`)
      : `${formats} (max. ${maxFileSize}MB)`;
  };

  return (
    <div className="w-full">
      {/* Área de thumbnail com botão de upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={openModal}
        >
          {previewUrl ? (
            <div className="relative w-full h-48 mb-2">
              <img
                src={previewUrl}
                alt="Thumbnail selecionada"
                className="object-cover rounded-md h-full w-full"
              />
              {selectedFile && (
                <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Imagem selecionada
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48">
              <svg
                className="w-12 h-12 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              <p className="text-gray-500">{uploadAreaText}</p>
              <p className="text-sm text-gray-400 mt-1">
                {getDynamicSubtext()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de upload de imagem */}
      {showModal && (
        <div className="fixed inset-0 z-50 top-0 left-0 h-full w-full flex flex-col items-center justify-center bg-zinc-900 bg-opacity-50">
          <div className="flex flex-col bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-xl">{modalTitle}</span>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Preview da imagem */}
            {previewUrl && (
              <div className="mb-4">
                <div className="relative w-full h-48 rounded-md overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Input para seleção de arquivo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecione uma imagem
              </label>
              <input
                type="file"
                accept={acceptedFormats.join(",")}
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">
                  Por favor, selecione uma imagem válida.
                </p>
              )}
            </div>

            {/* Visualização do arquivo selecionado */}
            {selectedFile && (
              <div className="mb-4">
                <p className="block text-sm font-medium text-gray-700 mb-1">
                  Arquivo selecionado:
                </p>
                <p className="text-sm text-gray-600">{selectedFile.name}</p>
              </div>
            )}

            {/* Campo de descrição - apenas se showDescription for true */}
            {showDescription && (
              <CustomInput
                id="description"
                label={descriptionLabel}
                placeholder={descriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            )}

            {/* Botões de ação */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeModal}
                className="border border-red-300 hover:bg-red-700 hover:text-white text-red-700 px-4 py-2 rounded"
                disabled={loading}
              >
                {cancelButtonText}
              </button>
              <button
                onClick={saveImage}
                className="bg-green-700 hover:bg-opacity-70 text-white px-4 py-2 rounded flex items-center justify-center min-w-[100px]"
                disabled={loading || !selectedFile}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    {processingText}
                  </>
                ) : (
                  confirmButtonText
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}