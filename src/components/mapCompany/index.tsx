"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin,  Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  };
  name?: string;
  lat: string;
  lon: string;
}

// Função para formatar endereço de forma limpa
const formatCleanAddress = (data: NominatimResult): string => {
  if (!data.address) {
    return filterDisplayName(data.display_name);
  }

  const addr = data.address;
  const parts: string[] = [];

  // 1. Nome do estabelecimento (se for comércio)
  const businessName = addr.shop || addr.amenity || addr.tourism || data.name;
  if (businessName && businessName !== addr.road) {
    parts.push(businessName);
  }

  // 2. Endereço (Rua/Avenida + número)
  let streetAddress = "";
  if (addr.road) {
    streetAddress = addr.road;
    if (addr.house_number) {
      streetAddress += `, ${addr.house_number}`;
    }
    parts.push(streetAddress);
  }

  // 3. Bairro
  const neighborhood = addr.suburb || addr.neighbourhood;
  if (neighborhood) {
    parts.push(neighborhood);
  }

  // 4. Cidade
  const city = addr.city || addr.town || addr.village || addr.municipality;
  if (city) {
    parts.push(city);
  }

  // 5. Estado
  if (addr.state) {
    parts.push(addr.state);
  }

  // 6. CEP
  if (addr.postcode) {
    parts.push(addr.postcode);
  }

  return parts.join(', ');
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

// Componente interno do Leaflet (só renderiza no client-side)
const LeafletMap: React.FC<LeafletMapProps> = ({
  onLocationSelect,
  initialLat =  -27.644317,
  initialLng = -48.669188,
  initialZoom = 16,
  height = "400px",
  markerDraggable = true,
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
  }, []);

  // Função para buscar endereço - MODIFICADA para retornar dados estruturados
  const searchAddress = async (address: string) => {
    if (!address.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=1&countrycodes=br&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result: NominatimResult = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Formatar endereço de forma limpa
        const cleanAddress = formatCleanAddress(result);
        
        if (map) {
          map.setView([lat, lng], 16);
          
          if (marker) {
            marker.setLatLng([lat, lng]);
          }
          
          onLocationSelect(lat, lng, cleanAddress);
          toast.success("Endereço encontrado!");
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
          map.setView([latitude, longitude], 16);
          
          if (marker) {
            marker.setLatLng([latitude, longitude]);
          }
          
          // Buscar endereço para a localização atual
          const address = await reverseGeocode(latitude, longitude);
          onLocationSelect(latitude, longitude, address);
          toast.success("Localização atual obtida!");
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

  // Função para geocodificação reversa - MODIFICADA para retornar endereço limpo
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data: NominatimResult = await response.json();
      
      // Usar função de formatação limpa
      return formatCleanAddress(data);
    } catch (error) {
      console.error("Erro na geocodificação reversa:", error);
      return "";
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
        
        // Buscar endereço limpo para as coordenadas
        const address = await reverseGeocode(lat, lng);
        onLocationSelect(lat, lng, address);
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
                const address = await reverseGeocode(lat, lng);
                onLocationSelect(lat, lng, address);
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
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-sm text-xs text-gray-600 max-w-xs">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span>Clique no mapa para selecionar</span>
          </div>
          {markerDraggable && (
            <div className="mt-1">Arraste o marcador para ajustar</div>
          )}
        </div>

        {/* Loading overlay */}
        {!isMapReady && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-sm text-gray-600">Carregando mapa...</span>
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