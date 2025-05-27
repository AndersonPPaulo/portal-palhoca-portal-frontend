"use client";

import { useState } from "react";

interface ProfileImageViewerProps {
  imageUrl?: string;
  userName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackInitials?: string;
}

export default function ProfileImageViewer({
  imageUrl,
  userName = "Usuário",
  size = "md",
  className = "",
  fallbackInitials = "??"
}: ProfileImageViewerProps) {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Configurações de tamanho
  const sizeConfig = {
    sm: { container: "h-8 w-8", text: "text-xs" },
    md: { container: "h-14 w-14", text: "text-sm" },
    lg: { container: "h-20 w-20", text: "text-base" },
    xl: { container: "h-32 w-32", text: "text-xl" }
  };

  const currentSize = sizeConfig[size];

  const openModal = () => {
    if (imageUrl && !imageError) {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Determina se deve mostrar a imagem ou o placeholder
  const shouldShowImage = imageUrl && !imageError;

  return (
    <>
      {/* Imagem de perfil clicável */}
      <div 
        className={`${currentSize.container} ${className} cursor-pointer`}
        onClick={openModal}
      >
        {shouldShowImage ? (
          <img
            src={imageUrl}
            alt={`Foto de perfil de ${userName}`}
            className="rounded-full h-full w-full object-cover hover:opacity-90 transition-opacity"
            onError={handleImageError}
          />
        ) : (
          <div className={`rounded-full h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold ${currentSize.text} shadow-lg hover:from-blue-500 hover:to-blue-700 transition-colors`}>
            {fallbackInitials}
          </div>
        )}
      </div>

      {/* Modal de visualização da imagem */}
      {showModal && shouldShowImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            {/* Botão de fechar */}
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
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

            {/* Imagem em tamanho completo */}
            <img
              src={imageUrl}
              alt={`Foto de perfil de ${userName}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={closeModal}
            />

            {/* Informações do usuário */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
              <p className="text-white text-lg font-medium">{userName}</p>
            </div>
          </div>

          {/* Overlay clicável para fechar */}
          <div 
            className="absolute inset-0 -z-10"
            onClick={closeModal}
          />
        </div>
      )}
    </>
  );
}