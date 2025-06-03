// hooks/useMapAddressSync.tsx
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";

// Interface para os dados de endereço
interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
}

// Interface para resposta da API de CEP
interface CEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
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

// Hook customizado para sincronização bidirecional
export const useMapAddressSync = (
  setValue: (name: string, value: any) => void,
  watch: (name: string) => any
) => {
  const [addressData, setAddressData] = useState<AddressData>({
    cep: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    fullAddress: "",
    latitude: undefined,
    longitude: undefined,
  });

  const [isUpdatingFromMap, setIsUpdatingFromMap] = useState(false);
  const [isUpdatingFromInputs, setIsUpdatingFromInputs] = useState(false);
  const [isResettingFields, setIsResettingFields] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Para forçar re-render do mapa

  // API do CEP
  const cepAPI = axios.create({
    baseURL: "https://viacep.com.br/ws",
  });

  // Função melhorada para geocodificação reversa com múltiplas consultas
  const reverseGeocodeDetailed = useCallback(
    async (lat: number, lng: number): Promise<NominatimResult | null> => {
      try {
        // Primeira tentativa: máxima precisão (zoom 18 - nível de casa)
        let response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&extratags=1`
        );
        let data: NominatimResult = await response.json();

        // Se não encontrou endereço específico, tentar com zoom 17
        if (!data.address?.house_number && !data.address?.street_number) {
          response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1&extratags=1`
          );
          data = await response.json();
        }

        // Última tentativa: buscar o ponto mais próximo em um raio pequeno
        if (!data.address?.house_number && !data.address?.street_number) {
          const searchResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&lat=${lat}&lon=${lng}&addressdetails=1&limit=5&radius=50`
          );
          const searchData = await searchResponse.json();

          if (searchData && searchData.length > 0) {
            // Encontrar o resultado mais próximo com número
            const withNumber = searchData.find(
              (item: NominatimResult) =>
                item.address?.house_number || item.address?.street_number
            );
            if (withNumber) {
              data = withNumber;
            }
          }
        }

        return data;
      } catch (error) {
        console.error("Erro na geocodificação reversa detalhada:", error);
        return null;
      }
    },
    []
  );

  // Função melhorada para extrair dados estruturados do Nominatim
  const extractStructuredData = useCallback(
    (data: NominatimResult): Partial<AddressData> => {
      if (!data.address) return {};

      const addr = data.address;
      const extracted: Partial<AddressData> = {};

      // 1. CEP
      if (addr.postcode) {
        extracted.cep = addr.postcode
          .replace(/\D/g, "")
          .replace(/(\d{5})(\d{3})/, "$1-$2");
      }

      // 2. Rua/Logradouro
      if (addr.road || addr.street) {
        extracted.street = addr.road || addr.street || "";
      }

      // 3. Número (várias possibilidades)
      const houseNumber = addr.house_number || addr.street_number;
      if (houseNumber) {
        extracted.number = houseNumber;
      }

      // 4. Bairro
      const neighborhood =
        addr.suburb || addr.neighbourhood || addr.residential;
      if (neighborhood) {
        extracted.district = neighborhood;
      }

      // 5. Cidade
      const city = addr.city || addr.town || addr.village || addr.municipality;
      if (city) {
        extracted.city = city;
      }

      // 6. Estado
      if (addr.state) {
        extracted.state = addr.state;
      }

      return extracted;
    },
    []
  );

  // Função para formatar endereço completo
  const formatCompleteAddress = useCallback(
    (data: Partial<AddressData>, originalAddress?: string): string => {
      const parts: string[] = [];

      // Usar dados estruturados se disponíveis
      if (data.street) {
        let streetPart = data.street;
        if (data.number) {
          streetPart += `, ${data.number}`;
        }
        parts.push(streetPart);
      }

      if (data.district) {
        parts.push(data.district);
      }

      if (data.city) {
        parts.push(data.city);
      }

      if (data.state) {
        parts.push(data.state);
      }

      if (data.cep) {
        parts.push(data.cep);
      }

      // Se não conseguiu extrair dados estruturados suficientes, usar endereço original filtrado
      if (parts.length < 3 && originalAddress) {
        return filterDisplayName(originalAddress);
      }

      return parts.join(", ");
    },
    []
  );

  // Função para filtrar display_name (mantida da versão original)
  const filterDisplayName = useCallback((displayName: string): string => {
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
  }, []);

  // Função para buscar dados do CEP
  const fetchCEPData = useCallback(
    async (cep: string): Promise<CEPResponse | null> => {
      if (!cep || cep.length < 8) return null;

      const cleanCEP = cep.replace(/\D/g, "");
      if (cleanCEP.length !== 8) return null;

      try {
        const response = await cepAPI.get(`/${cleanCEP}/json`);
        if (response.data.erro) return null;
        return response.data;
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        return null;
      }
    },
    [cepAPI]
  );

  // Função para geocodificar endereço (endereço -> coordenadas)
  const geocodeAddress = useCallback(
    async (address: string): Promise<{ lat: number; lng: number } | null> => {
      if (!address.trim()) return null;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            address + ", Brasil"
          )}&limit=1&countrycodes=br&addressdetails=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          };
        }
      } catch (error) {
        console.error("Erro na geocodificação:", error);
      }

      return null;
    },
    []
  );

  // Função principal chamada quando o mapa é atualizado - MELHORADA
  const handleMapLocationSelect = useCallback(
    async (lat: number, lng: number, address?: string) => {
      if (isUpdatingFromInputs) return; // Evitar loop infinito

      setIsUpdatingFromMap(true);
      setIsResettingFields(true);

      try {
        // PRIMEIRO: Resetar todos os campos de endereço
        setValue("cep", "");
        setValue("street", "");
        setValue("number", "");
        setValue("complement", "");
        setValue("district", "");
        setValue("city", "");
        setValue("state", "");
        setValue("address", "");

        // Pequeno delay para feedback visual do reset
        await new Promise((resolve) => setTimeout(resolve, 300));

        setIsResettingFields(false);

        // Buscar dados detalhados da localização
        const detailedData = await reverseGeocodeDetailed(lat, lng);

        if (detailedData) {
          // Extrair dados estruturados
          const extractedData = extractStructuredData(detailedData);

          // Se não temos número e temos CEP, tentar buscar dados do CEP
          if (!extractedData.number && extractedData.cep) {
            const cepData = await fetchCEPData(extractedData.cep);
            if (cepData) {
              // Preencher dados faltantes do CEP
              if (!extractedData.street && cepData.logradouro) {
                extractedData.street = cepData.logradouro;
              }
              if (!extractedData.district && cepData.bairro) {
                extractedData.district = cepData.bairro;
              }
              if (!extractedData.city && cepData.localidade) {
                extractedData.city = cepData.localidade;
              }
              if (!extractedData.state && cepData.uf) {
                extractedData.state = cepData.uf;
              }
            }
          }

          // Criar endereço completo formatado
          const fullAddress = formatCompleteAddress(
            extractedData,
            detailedData.display_name
          );

          const newAddressData: AddressData = {
            cep: extractedData.cep || "",
            street: extractedData.street || "",
            number: extractedData.number || "",
            complement: "",
            district: extractedData.district || "",
            city: extractedData.city || "",
            state: extractedData.state || "",
            fullAddress,
            latitude: lat,
            longitude: lng,
          };

          setAddressData(newAddressData);

          // Preencher campos do formulário
          if (newAddressData.cep) setValue("cep", newAddressData.cep);
          if (newAddressData.street) setValue("street", newAddressData.street);
          if (newAddressData.number) setValue("number", newAddressData.number);
          if (newAddressData.district)
            setValue("district", newAddressData.district);
          if (newAddressData.city) setValue("city", newAddressData.city);
          if (newAddressData.state) setValue("state", newAddressData.state);
          setValue("address", fullAddress);

          setValue("latitude", lat);
          setValue("longitude", lng);

          // Gerar links automáticos
          const googleMapsLink = `https://maps.google.com/maps?q=${lat},${lng}`;
          const wazeLink = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

          setValue("linkLocationMaps", googleMapsLink);
          setValue("linkLocationWaze", wazeLink);

          // Feedback para o usuário
          if (newAddressData.number) {
            toast.success(
              `🎯 Endereço encontrado: ${newAddressData.street}, ${newAddressData.number}`
            );
          } else if (newAddressData.street) {
            toast.success(
              `📍 Rua encontrada: ${newAddressData.street} (número não identificado)`
            );
          } else {
            toast.success(
              "📍 Localização selecionada - preencha os detalhes manualmente"
            );
          }
        } else {
          // Se não conseguiu dados detalhados, manter apenas as coordenadas
          const newAddressData: AddressData = {
            cep: "",
            street: "",
            number: "",
            complement: "",
            district: "",
            city: "",
            state: "",
            fullAddress:
              address || `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
            latitude: lat,
            longitude: lng,
          };

          setAddressData(newAddressData);
          setValue("latitude", lat);
          setValue("longitude", lng);

          toast.warning(
            "📍 Localização selecionada - preencha o endereço manualmente"
          );
        }
      } finally {
        setIsUpdatingFromMap(false);
        setIsResettingFields(false);
      }
    },
    [
      extractStructuredData,
      fetchCEPData,
      formatCompleteAddress,
      setValue,
      isUpdatingFromInputs,
      reverseGeocodeDetailed,
    ]
  );

  // Função para atualizar mapa quando inputs mudam (mantida similar)
  const updateMapFromInputs = useCallback(async () => {
    if (isUpdatingFromMap) return; // Evitar loop infinito

    const currentData = {
      cep: watch("cep") || "",
      street: watch("street") || "",
      number: watch("number") || "",
      district: watch("district") || "",
      city: watch("city") || "",
      state: watch("state") || "",
    };

    // Verificar se temos dados suficientes para geocodificar
    const hasMinimumData =
      currentData.street && currentData.city && currentData.state;
    if (!hasMinimumData) return;

    setIsUpdatingFromInputs(true);

    try {
      // Construir endereço para geocodificação
      const addressParts = [
        currentData.street,
        currentData.number,
        currentData.district,
        currentData.city,
        currentData.state,
      ].filter(Boolean);

      const fullAddress = addressParts.join(", ");

      // Geocodificar para obter coordenadas
      const coordinates = await geocodeAddress(fullAddress);

      if (coordinates) {
        const newAddressData: AddressData = {
          ...currentData,
          complement: watch("complement") || "",
          fullAddress,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        };

        setAddressData(newAddressData);
        setValue("latitude", coordinates.lat);
        setValue("longitude", coordinates.lng);

        // Forçar atualização do mapa
        setMapKey((prev) => prev + 1);

        toast.success("🗺️ Mapa atualizado a partir do endereço!");
      }
    } catch (error) {
      console.error("Erro ao atualizar mapa:", error);
    } finally {
      setIsUpdatingFromInputs(false);
    }
  }, [watch, geocodeAddress, isUpdatingFromMap, setValue]);

  // Debounce para atualizar mapa quando inputs mudam
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateMapFromInputs();
    }, 1000); // Aguardar 1 segundo após última mudança

    return () => clearTimeout(timeoutId);
  }, [
    watch("street"),
    watch("number"),
    watch("district"),
    watch("city"),
    watch("state"),
  ]);

  return {
    addressData,
    handleMapLocationSelect,
    mapKey,
    isUpdatingFromMap,
    isUpdatingFromInputs,
    isResettingFields,
  };
};
