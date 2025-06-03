"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, Target, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import CustomInput from "../input/custom-input";

// Interfaces
interface MapComponentProps {
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  height?: string;
  showSearch?: boolean;
  showCurrentLocation?: boolean;
  markerDraggable?: boolean;
  className?: string;
}

interface LeafletMapProps extends MapComponentProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

// Serviços integrados para o mapa
class MapAddressService {
  // Geocodificação reversa simplificada
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=pt-BR`
      );
      const data = await response.json();

      if (data.display_name) {
        return this.formatAddressFromResult(data);
      }
      return `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error("Erro na geocodificação reversa:", error);
      return `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }

  // Buscar endereço por texto
  async searchAddress(
    searchTerm: string
  ): Promise<{
    coordinates: { lat: number; lng: number };
    address: string;
  } | null> {
    if (!searchTerm.trim()) return null;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchTerm
        )}&limit=3&countrycodes=br&addressdetails=1&accept-language=pt-BR`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const coordinates = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        };
        const address = await this.reverseGeocode(
          coordinates.lat,
          coordinates.lng
        );
        return { coordinates, address };
      }
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
    }
    return null;
  }

  // Formatar endereço do resultado Nominatim
  private formatAddressFromResult(data: any): string {
    if (!data.address) {
      return this.filterDisplayName(data.display_name);
    }

    const addr = data.address;
    const parts: string[] = [];

    // Nome do estabelecimento
    const businessName = addr.shop || addr.amenity || addr.tourism || data.name;
    if (
      businessName &&
      businessName !== addr.road &&
      businessName !== addr.street
    ) {
      parts.push(businessName);
    }

    // Rua + número
    const street = addr.road || addr.street;
    const number = addr.house_number;

    if (street) {
      let streetAddress = street;
      if (number) streetAddress += `, ${number}`;
      parts.push(streetAddress);
    }

    // Outros dados
    const neighborhood = addr.suburb || addr.neighbourhood || addr.residential;
    if (neighborhood && neighborhood !== street) parts.push(neighborhood);

    const city = addr.city || addr.town || addr.village || addr.municipality;
    if (city) parts.push(city);

    if (addr.state) parts.push(addr.state);
    if (addr.postcode) parts.push(addr.postcode);

    return parts.length >= 1
      ? parts.join(", ")
      : this.filterDisplayName(data.display_name);
  }

  // Filtrar display_name
  private filterDisplayName(displayName: string): string {
    const parts = displayName.split(", ");
    const filtered: string[] = [];

    const termsToRemove = [
      "Região Geográfica Imediata",
      "Região Geográfica Intermediária",
      "Região Sul",
      "Região Norte",
      "Região Nordeste",
      "Região Centro-Oeste",
      "Região Sudeste",
      "Brasil",
      "Brazil",
    ];

    for (const part of parts) {
      const shouldRemove = termsToRemove.some((term) =>
        part.toLowerCase().includes(term.toLowerCase())
      );

      if (!shouldRemove && filtered.length < 6) {
        filtered.push(part.trim());
      }
    }

    return filtered.join(", ");
  }
}

// Instância do serviço
const mapService = new MapAddressService();

// Componente interno do Leaflet otimizado
const LeafletMap: React.FC<LeafletMapProps> = ({
  onLocationSelect,
  initialLat = -27.644317,
  initialLng = -48.669188,
  initialZoom = 16,
  height = "600px",
  markerDraggable = true,
  showSearch = true,
  showCurrentLocation = true,
}) => {
  // Estados do mapa
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

  // Carregar Leaflet dinamicamente
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const L = await import("leaflet");
        const { MapContainer, TileLayer, Marker, useMapEvents, useMap } =
          await import("react-leaflet");

        // Configurar ícones do Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
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

  // Invalidar tamanho do mapa quando pronto
  useEffect(() => {
    if (map && isMapReady) {
      const timer = setTimeout(() => map.invalidateSize(), 100);
      return () => clearTimeout(timer);
    }
  }, [map, isMapReady]);

  // Buscar endereço - FOCO NAS COORDENADAS EXATAS
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const result = await mapService.searchAddress(searchTerm);

      if (result && map) {
        const { coordinates, address } = result;

        // Focar no PIN exato
        map.setView([coordinates.lat, coordinates.lng], 17);

        if (marker) {
          marker.setLatLng([coordinates.lat, coordinates.lng]);
        }

        // Chamar com coordenadas exatas
        onLocationSelect(coordinates.lat, coordinates.lng, address);
        toast.success("🎯 Local encontrado! PIN posicionado com precisão!");
      } else {
        toast.error("❌ Local não encontrado - tente outro termo");
      }
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      toast.error("❌ Erro na busca - tente novamente");
    } finally {
      setIsSearching(false);
    }
  };

  // Obter localização atual - FOCO NAS COORDENADAS EXATAS DO GPS
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("❌ Geolocalização não suportada pelo navegador");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        if (map) {
          // Posicionar PIN exatamente na localização do GPS
          map.setView([latitude, longitude], 17);
          if (marker) {
            marker.setLatLng([latitude, longitude]);
          }

          // Tentar buscar endereço, mas coordenadas são o importante
          let address = "";
          try {
            address = await mapService.reverseGeocode(latitude, longitude);
          } catch (error) {
            console.log("Geocoding falhou, mas GPS funcionou");
            address = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          }

          onLocationSelect(latitude, longitude, address);
          toast.success("🎯 Localização GPS obtida com precisão!");
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        toast.error("❌ Erro ao acessar GPS - posicione o PIN manualmente");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Processar seleção de localização - FOCO NAS COORDENADAS
  const processLocationSelection = async (lat: number, lng: number) => {
    setIsProcessingLocation(true);
    try {
      // Tentar buscar endereço, mas não é crítico
      let address = "";
      try {
        address = await mapService.reverseGeocode(lat, lng);
      } catch (error) {
        console.log("Geocoding falhou, mas coordenadas foram salvas");
        address = `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }

      // Sempre chamar onLocationSelect com as coordenadas exatas
      onLocationSelect(lat, lng, address);

      // Feedback sempre positivo - foco nas coordenadas precisas
      if (
        address &&
        !address.startsWith("Coordenadas:") &&
        !address.startsWith("GPS:")
      ) {
        toast.success("🎯 Localização exata salva + endereço encontrado!");
      } else {
        toast.success(
          "📍 Localização exata salva! Links do Maps e Waze gerados!"
        );
      }
    } finally {
      setIsProcessingLocation(false);
    }
  };

  // Eventos do mapa
  const MapEvents = () => {
    if (!leafletComponents) return null;

    const { useMapEvents } = leafletComponents;

    useMapEvents({
      click: async (e: any) => {
        const { lat, lng } = e.latlng;
        if (marker) marker.setLatLng([lat, lng]);
        await processLocationSelection(lat, lng);
      },
    });

    return null;
  };

  // Configuração do mapa
  const MapSetup = () => {
    if (!leafletComponents) return null;

    const { useMap } = leafletComponents;
    const mapInstance = useMap();

    useEffect(() => {
      if (mapInstance) {
        setMap(mapInstance);
        mapInstance.whenReady(() => {
          setIsMapReady(true);
          setTimeout(() => mapInstance.invalidateSize(), 100);
        });
      }
    }, []);

    return null;
  };

  // Loading enquanto carrega Leaflet
  if (!leafletComponents) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg border"
        style={{ height, width: "100%" }}
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
      {/* Controles */}
      {(showSearch || showCurrentLocation) && (
        <div className="flex gap-3">
          {showSearch && (
            <div className="flex-1 relative">
              <CustomInput
                type="text"
                placeholder="Buscar endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                disabled={isSearching}
              />
              <button
                onClick={handleSearch}
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

      {/* Container do Mapa */}
      <div
        className="relative rounded-lg overflow-hidden border border-gray-300 shadow-sm"
        style={{ height, width: "100%" }}
      >
        <MapContainer
          center={[initialLat, initialLng]}
          zoom={initialZoom}
          style={{ height: "100%", width: "100%" }}
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
              add: (e: any) => setMarker(e.target),
            }}
          />

          <MapEvents />
          <MapSetup />
        </MapContainer>

        {/* Instruções - FOCO NO PIN EXATO */}
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 px-3 py-2 rounded-lg shadow-lg text-xs text-gray-700 max-w-xs">
          <div className="flex items-center gap-1 font-medium text-blue-600">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span>📍 Clique para posicionar o PIN exato</span>
          </div>
          <div className="mt-1 text-gray-600">
            Links do Maps e Waze serão gerados automaticamente
          </div>
          {markerDraggable && (
            <div className="mt-1 text-gray-500 text-xs">
              Arraste o PIN para ajustar a posição
            </div>
          )}
        </div>

        {/* Loading do processamento */}
        {(!isMapReady || isProcessingLocation) && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-sm text-gray-600">
                {isProcessingLocation
                  ? "Processando localização..."
                  : "Carregando mapa..."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principal
const MapComponent: React.FC<MapComponentProps> = (props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg border ${
          props.className || ""
        }`}
        style={{ height: props.height || "400px", width: "100%" }}
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
