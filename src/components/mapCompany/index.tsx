"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, Target, Search } from "lucide-react";
import { toast } from "sonner";
import CustomInput from "../input/custom-input";
import { Button } from "../ui/button";

// Interfaces para tipagem
interface MapComponentProps {
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  height?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showCurrentLocation?: boolean;
  markerDraggable?: boolean;
  className?: string;
}

interface LeafletMapProps extends MapComponentProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

// Interface para dados detalhados do Nominatim
interface NominatimResult {
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    street?: string;
    street_number?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    postcode?: string;
    country?: string;
    shop?: string;
    amenity?: string;
    tourism?: string;
    building?: string;
    name?: string;
    residential?: string;
    commercial?: string;
  };
  name?: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
}

// Função para geocodificação reversa - FLEXÍVEL (aceita resultados parciais)
const reverseGeocodeDetailed = async (lat: number, lng: number): Promise<string> => {
  try {
    // Primeira tentativa: precisão alta (zoom 18)
    let response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=pt-BR`
    );
    let data: NominatimResult = await response.json();

    // Se não tiver dados suficientes, tentar zoom 16 (área mais ampla)
    if (!data.address || Object.keys(data.address).length < 3) {
      try {
        response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1&accept-language=pt-BR`
        );
        const data16 = await response.json();
        
        // Usar dados do zoom 16 se tiver mais informações
        if (data16.address && Object.keys(data16.address).length > Object.keys(data.address || {}).length) {
          data = data16;
        }
      } catch (error) {
        console.log('Zoom 16 falhou, usando dados existentes');
      }
    }

    return formatCleanAddress(data);
  } catch (error) {
    console.error("Erro na geocodificação reversa:", error);
    return "";
  }
};

// Função para formatar endereço - FLEXÍVEL (monta endereço com dados disponíveis)
const formatCleanAddress = (data: NominatimResult): string => {
  if (!data.address) {
    return filterDisplayName(data.display_name);
  }

  const addr = data.address;
  const parts: string[] = [];

  // 1. Nome do estabelecimento (se relevante)
  const businessName = addr.shop || addr.amenity || addr.tourism || data.name;
  if (businessName && businessName !== addr.road && businessName !== addr.street) {
    parts.push(businessName);
  }

  // 2. Endereço (Rua + número se disponível)
  const street = addr.road || addr.street;
  const number = addr.house_number || addr.street_number;
  
  if (street) {
    let streetAddress = street;
    if (number) {
      streetAddress += `, ${number}`;
    }
    parts.push(streetAddress);
  }

  // 3. Bairro (se disponível e diferente da rua)
  const neighborhood = addr.suburb || addr.neighbourhood || addr.residential;
  if (neighborhood && neighborhood !== street) {
    parts.push(neighborhood);
  }

  // 4. Cidade (priorizar opções mais específicas)
  const city = addr.city || addr.town || addr.village || addr.municipality;
  if (city) {
    parts.push(city);
  }

  // 5. Estado (se disponível)
  if (addr.state) {
    parts.push(addr.state);
  }

  // 6. CEP (se disponível)
  if (addr.postcode) {
    parts.push(addr.postcode);
  }

  // Se conseguiu montar pelo menos 2 partes, usar estruturado
  if (parts.length >= 2) {
    return parts.join(', ');
  }

  // Fallback: usar display_name filtrado
  return filterDisplayName(data.display_name);
};

// Função para filtrar display_name quando não há dados estruturados
const filterDisplayName = (displayName: string): string => {
  const parts = displayName.split(', ');
  const filtered: string[] = [];
  
  const termsToRemove = [
    'Região Geográfica Imediata',
    'Região Geográfica Intermediária', 
    'Região Sul',
    'Região Norte',
    'Região Nordeste',
    'Região Centro-Oeste',
    'Região Sudeste',
    'Brasil',
    'Brazil'
  ];

  for (const part of parts) {
    const shouldRemove = termsToRemove.some(term => 
      part.toLowerCase().includes(term.toLowerCase())
    );
    
    if (!shouldRemove && filtered.length < 6) {
      filtered.push(part.trim());
    }
  }

  return filtered.join(', ');
};

// Componente interno do Leaflet
const LeafletMap: React.FC<LeafletMapProps> = ({
  onLocationSelect,
  initialLat = -27.644317,
  initialLng = -48.669188,
  initialZoom = 16, // Zoom balanceado para boa visualização
  height = "400px",
  markerDraggable = true,
  showSearch = true,
  showCurrentLocation = true,
}) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [leafletComponents, setLeafletComponents] = useState<any>(null);
  const [isProcessingLocation, setIsProcessingLocation] = useState(false);

  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const L = await import("leaflet");
        const {
          MapContainer,
          TileLayer,
          Marker,
          useMapEvents,
          useMap,
        } = await import("react-leaflet");

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        setLeafletComponents({
          L,
          MapContainer,
          TileLayer,
          Marker,
          useMapEvents,
          useMap,
        });
      } catch (error) {
        console.error("Erro ao carregar Leaflet:", error);
        toast.error("Erro ao carregar o mapa");
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (map && isMapReady) {
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [map, isMapReady]);

  // Função melhorada para buscar endereço
  const searchAddress = async (address: string) => {
    if (!address.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=5&countrycodes=br&addressdetails=1&accept-language=pt-BR`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        // Pegar o primeiro resultado com melhor precisão
        const bestResult = data.find((result: NominatimResult) => 
          result.address?.house_number || result.address?.street_number
        ) || data[0];

        const lat = parseFloat(bestResult.lat);
        const lng = parseFloat(bestResult.lon);
        
        const cleanAddress = await reverseGeocodeDetailed(lat, lng);
        
        if (map) {
          map.setView([lat, lng], 17); // Zoom balanceado
          
          if (marker) {
            marker.setLatLng([lat, lng]);
          }
          
          onLocationSelect(lat, lng, cleanAddress);
          toast.success("📍 Endereço encontrado!");
        }
      } else {
        toast.error("Endereço não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      toast.error("Erro ao buscar endereço");
    } finally {
      setIsSearching(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada pelo navegador");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        if (map) {
          map.setView([latitude, longitude], 17); // Zoom balanceado
          
          if (marker) {
            marker.setLatLng([latitude, longitude]);
          }
          
          // Buscar endereço detalhado para a localização atual
          const address = await reverseGeocodeDetailed(latitude, longitude);
          onLocationSelect(latitude, longitude, address);
          toast.success("📍 Localização atual obtida!");
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        toast.error("Erro ao obter localização atual");
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Função para processar seleção de localização com feedback flexível
  const processLocationSelection = async (lat: number, lng: number) => {
    setIsProcessingLocation(true);
    try {
      const address = await reverseGeocodeDetailed(lat, lng);
      onLocationSelect(lat, lng, address);
      
      // Feedback sempre positivo - foca no que foi encontrado
      if (address && address.length > 10) {
        toast.success("📍 Localização salva com endereço!");
      } else {
        toast.success("📍 Localização salva! Complete os dados se necessário");
      }
    } finally {
      setIsProcessingLocation(false);
    }
  };

  // Componente para capturar cliques no mapa
  const MapEvents = () => {
    if (!leafletComponents) return null;
    
    const { useMapEvents } = leafletComponents;
    
    useMapEvents({
      click: async (e: any) => {
        const { lat, lng } = e.latlng;
        
        if (marker) {
          marker.setLatLng([lat, lng]);
        }
        
        await processLocationSelection(lat, lng);
      },
    });
    
    return null;
  };

  // Componente para configurar o mapa
  const MapSetup = () => {
    if (!leafletComponents) return null;
    
    const { useMap } = leafletComponents;
    const mapInstance = useMap();
    
    useEffect(() => {
      if (mapInstance) {
        setMap(mapInstance);
        
        mapInstance.whenReady(() => {
          setIsMapReady(true);
          setTimeout(() => {
            mapInstance.invalidateSize();
          }, 100);
        });
      }
    }, []);
    
    return null;
  };

  if (!leafletComponents) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg border"
        style={{ height, width: '100%' }}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-sm text-gray-600">Carregando mapa...</span>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker } = leafletComponents;

  return (
    <div className="w-full space-y-4">
      {/* Barra de busca e botão de localização atual */}
      {(showSearch || showCurrentLocation) && (
        <div className="flex gap-3">
          {showSearch && (
            <div className="flex-1 relative">
              <CustomInput
                type="text"
                placeholder="Buscar endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchAddress(searchTerm)}
                disabled={isSearching}
              />
              <button
                onClick={() => searchAddress(searchTerm)}
                disabled={isSearching || !searchTerm.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>
            </div>
          )}
          
          {showCurrentLocation && (
            <Button
            className="rounded-3xl min-h-[48px] text-[16px] pt-3 px-6 mt-1"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Target className="h-5 w-5" />
              )}
              Minha Localização
            </Button>
          )}
        </div>
      )}

      {/* Container do mapa */}
      <div 
        className="relative rounded-lg overflow-hidden border border-gray-300 shadow-sm"
        style={{ height, width: '100%' }}
      >
        <MapContainer
          center={[initialLat, initialLng]}
          zoom={initialZoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          scrollWheelZoom={true}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            tileSize={256}
          />
          
          <Marker
            position={[initialLat, initialLng]}
            draggable={markerDraggable}
            ref={markerRef}
            eventHandlers={{
              dragend: async (e: any) => {
                const { lat, lng } = e.target.getLatLng();
                await processLocationSelection(lat, lng);
              },
              add: (e: any) => {
                setMarker(e.target);
              },
            }}
          />
          
          <MapEvents />
          <MapSetup />
        </MapContainer>
        
        {/* Instruções de uso */}
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 px-3 py-2 rounded-lg shadow-lg text-xs text-gray-700 max-w-xs">
          <div className="flex items-center gap-1 font-medium">
            <MapPin className="h-3 w-3 flex-shrink-0 text-blue-600" />
            <span>Clique para selecionar localização exata</span>
          </div>
          {markerDraggable && (
            <div className="mt-1 text-gray-600">Arraste o marcador para ajustar</div>
          )}
        </div>

        {/* Loading overlay */}
        {(!isMapReady || isProcessingLocation) && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-sm text-gray-600">
                {isProcessingLocation ? "Processando localização..." : "Carregando mapa..."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principal com carregamento dinâmico
const MapComponent: React.FC<MapComponentProps> = (props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg border ${props.className || ""}`}
        style={{ height: props.height || "400px", width: '100%' }}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-sm text-gray-600">Inicializando mapa...</span>
        </div>
      </div>
    );
  }

  return (
    <LeafletMap
      {...props}
      onLocationSelect={props.onLocationSelect || (() => {})}
    />
  );
};

export default MapComponent;