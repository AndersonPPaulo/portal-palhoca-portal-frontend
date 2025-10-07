import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import axios from "axios";

// Tipagem
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

interface CEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface NominatimResult {
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    street?: string;
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
    name?: string;
    residential?: string;
    commercial?: string;
  };
  name?: string;
  lat: string;
  lon: string;
}

type FormData = Record<string, any>;

// Classe de serviço integrada e otimizada
class AddressService {
  private cepAPI = axios.create({ baseURL: "https://viacep.com.br/ws" });

  // Buscar CEP - rápido e simples
  async fetchCEPData(cep: string): Promise<CEPResponse | null> {
    if (!cep || cep.length < 8) return null;
    const cleanCEP = cep.replace(/\D/g, "");
    if (cleanCEP.length !== 8) return null;

    try {
      const response = await this.cepAPI.get(`/${cleanCEP}/json`);
      return response.data.erro ? null : response.data;
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      return null;
    }
  }

  // Geocodificação reversa
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=pt-BR`
      );
      const data: NominatimResult = await response.json();

      if (data.display_name) {
        return this.formatAddress(data);
      }
      return `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error("Erro na geocodificação reversa:", error);
      return `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }

  // Geocodificação direta
  async geocode(address: string): Promise<{ lat: number; lng: number } | null> {
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
  }

  // Buscar endereço por texto
  async searchAddress(searchTerm: string): Promise<{
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

  // NOVA FUNÇÃO: Parse melhorado do display_name
  parseDisplayName(displayName: string): Partial<AddressData> {
    // Formato esperado: "Rua João Pinto, 91 - Florianópolis - Santa Catarina/XV - 88010-420"
    const result: Partial<AddressData> = {};

    // Extrair CEP
    const cepMatch = displayName.match(/\d{5}-?\d{3}/);
    if (cepMatch) {
      result.cep = cepMatch[0].replace(/(\d{5})(\d{3})/, "$1-$2");
    }

    // Remover CEP do texto para facilitar o parse
    let workingText = displayName.replace(/\d{5}-?\d{3}/, "").trim();

    // Remover separadores extras no final
    workingText = workingText.replace(/\s*-\s*$/, "");

    // Dividir por " - "
    const parts = workingText
      .split(" - ")
      .map((p) => p.trim())
      .filter((p) => p);

    if (parts.length === 0) return result;

    // Parte 1: Rua e número (ex: "Rua João Pinto, 91")
    if (parts[0]) {
      const streetParts = parts[0].split(",").map((p) => p.trim());
      result.street = streetParts[0] || "";
      result.number = streetParts[1] || "";
    }

    // Parte 2: Bairro (ex: "Florianópolis")
    if (parts[1]) {
      result.district = parts[1];
    }

    // Parte 3: Cidade/Estado (ex: "Santa Catarina/XV")
    if (parts[2]) {
      // Verificar se tem o formato "Cidade/Estado"
      if (parts[2].includes("/")) {
        const [cityOrState, state] = parts[2].split("/").map((p) => p.trim());

        // Se o segundo item tem 2 caracteres, é UF (Estado)
        if (state && state.length === 2) {
          result.state = state;
          result.city = cityOrState;
        } else {
          // Caso contrário, o primeiro é estado completo
          result.state = cityOrState;
          result.city = state || cityOrState;
        }
      } else {
        // Se não tem "/", assume que é cidade
        result.city = parts[2];
      }
    }

    // Parte 4: Pode ser estado adicional ou cidade
    if (parts[3]) {
      // Se ainda não temos cidade, este é a cidade
      if (!result.city) {
        result.city = parts[3];
      }
    }

    return result;
  }

  // Extrair dados estruturados - MELHORADO
  extractStructuredData(data: NominatimResult): Partial<AddressData> {
    // Priorizar parse do display_name quando não temos dados estruturados
    if (!data.address || Object.keys(data.address).length < 3) {
      return this.parseDisplayName(data.display_name || "");
    }

    const addr = data.address;
    const extracted: Partial<AddressData> = {};

    // CEP
    if (addr.postcode) {
      const cleanCep = addr.postcode.replace(/\D/g, "");
      if (cleanCep.length >= 8) {
        extracted.cep = cleanCep.replace(/(\d{5})(\d{3})/, "$1-$2");
      }
    }

    // Rua e número
    extracted.street = addr.road || addr.street || "";
    extracted.number = addr.house_number || "";

    // Bairro
    const neighborhood = addr.suburb || addr.neighbourhood || addr.residential;
    if (neighborhood && neighborhood !== extracted.street) {
      extracted.district = neighborhood;
    }

    // Cidade
    extracted.city =
      addr.city || addr.town || addr.village || addr.municipality || "";

    // Estado
    extracted.state = addr.state || "";

    return extracted;
  }

  // Formatar endereço - ACEITA DADOS PARCIAIS
  private formatAddress(data: NominatimResult): string {
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

    // Bairro
    const neighborhood = addr.suburb || addr.neighbourhood || addr.residential;
    if (neighborhood && neighborhood !== street) parts.push(neighborhood);

    // Cidade
    const city = addr.city || addr.town || addr.village || addr.municipality;
    if (city) parts.push(city);

    // Estado
    if (addr.state) parts.push(addr.state);

    // CEP
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

  // Formatar endereço completo a partir dos campos do formulário
  formatCompleteAddress(data: Partial<AddressData>): string {
    const parts: string[] = [];

    // Rua + número
    if (data.street) {
      let streetPart = data.street;
      if (data.number) streetPart += `, ${data.number}`;
      parts.push(streetPart);
    }

    // Complemento
    if (data.complement) {
      parts.push(data.complement);
    }

    // Bairro
    if (data.district) {
      parts.push(data.district);
    }

    // Cidade/Estado
    if (data.city && data.state) {
      parts.push(`${data.city}/${data.state}`);
    } else if (data.city) {
      parts.push(data.city);
    } else if (data.state) {
      parts.push(data.state);
    }

    // CEP
    if (data.cep) {
      parts.push(data.cep);
    }

    return parts.join(" - ");
  }

  // Gerar links de navegação
  generateNavigationLinks(lat: number, lng: number) {
    return {
      googleMaps: `https://maps.google.com/maps?q=${lat},${lng}`,
      waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    };
  }
}

// Instância do serviço
const addressService = new AddressService();

// Hook principal otimizado
export const useMapAddressSync = <T extends FormData>(
  setValue: UseFormSetValue<T>,
  watch: UseFormWatch<T>
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
  const [mapKey, setMapKey] = useState(0);

  // Helpers para setValue/watch com segurança
  const setValueSafe = useCallback(
    (fieldName: string, value: any) => {
      try {
        setValue(fieldName as any, value);
      } catch (error) {
        console.warn(`Erro ao setar campo ${fieldName}:`, error);
      }
    },
    [setValue]
  );

  const watchSafe = useCallback(
    (fieldName: string): any => {
      try {
        return watch(fieldName as any);
      } catch (error) {
        console.warn(`Erro ao observar campo ${fieldName}:`, error);
        return "";
      }
    },
    [watch]
  );

  // Função principal - ATUALIZAÇÃO SELETIVA DOS CAMPOS
  const handleMapLocationSelect = useCallback(
    async (lat: number, lng: number, address?: string) => {
      if (isUpdatingFromInputs) return;

      setIsUpdatingFromMap(true);

      try {
        // PRIORIDADE 1: Salvar coordenadas e gerar links precisos
        setValueSafe("latitude", lat);
        setValueSafe("longitude", lng);
        setValueSafe("lat", lat);
        setValueSafe("long", lng);

        const links = addressService.generateNavigationLinks(lat, lng);
        setValueSafe("linkLocationMaps", links.googleMaps);
        setValueSafe("linkLocationWaze", links.waze);

        await new Promise((resolve) => setTimeout(resolve, 200));

        // PRIORIDADE 2: Buscar dados de endereço
        let extractedData: Partial<AddressData> = {};

        try {
          if (!address) {
            address = await addressService.reverseGeocode(lat, lng);
          }

          console.log("📍 Endereço recebido do mapa:", address);

          if (address && !address.startsWith("Coordenadas:")) {
            // Usar a nova função de parse melhorada
            extractedData = addressService.parseDisplayName(address);

            console.log("🔍 Dados extraídos:", extractedData);

            // Se temos CEP, tentar melhorar com dados da API do CEP
            if (extractedData.cep) {
              try {
                const cepData = await addressService.fetchCEPData(
                  extractedData.cep
                );
                if (cepData) {
                  // Usar dados do CEP apenas se não temos dados melhores
                  extractedData.street =
                    extractedData.street || cepData.logradouro;
                  extractedData.district =
                    extractedData.district || cepData.bairro;
                  extractedData.city = extractedData.city || cepData.localidade;
                  extractedData.state = extractedData.state || cepData.uf;

                  console.log("✅ Dados melhorados com CEP:", extractedData);
                }
              } catch (cepError) {
                console.log("⚠️ Erro ao buscar CEP:", cepError);
              }
            }
          }
        } catch (geocodeError) {
          console.error("❌ Erro na geocodificação:", geocodeError);
        }

        // ATUALIZAÇÃO SELETIVA: Manter dados existentes nos campos não encontrados
        const currentData = {
          cep: watchSafe("zipcode"),
          street: watchSafe("street"),
          number: watchSafe("number"),
          complement: watchSafe("complement"),
          district: watchSafe("district"),
          city: watchSafe("city"),
          state: watchSafe("state"),
        };

        // Atualizar APENAS os campos que tiverem dados válidos encontrados
        const updatedData = {
          cep:
            extractedData.cep && extractedData.cep.trim()
              ? extractedData.cep
              : currentData.cep,
          street:
            extractedData.street && extractedData.street.trim()
              ? extractedData.street
              : currentData.street,
          number:
            extractedData.number && extractedData.number.trim()
              ? extractedData.number
              : currentData.number,
          complement: currentData.complement,
          district:
            extractedData.district && extractedData.district.trim()
              ? extractedData.district
              : currentData.district,
          city:
            extractedData.city && extractedData.city.trim()
              ? extractedData.city
              : currentData.city,
          state:
            extractedData.state && extractedData.state.trim()
              ? extractedData.state
              : currentData.state,
        };

        console.log("💾 Dados que serão salvos:", updatedData);

        // Montar endereço completo
        const fullAddress = addressService.formatCompleteAddress(updatedData);

        // Atualizar estado
        const newAddressData: AddressData = {
          ...updatedData,
          fullAddress: fullAddress,
          latitude: lat,
          longitude: lng,
        };

        setAddressData(newAddressData);

        // Atualizar campos no formulário
        setValueSafe("zipcode", updatedData.cep);
        setValueSafe("street", updatedData.street);
        setValueSafe("number", updatedData.number);
        setValueSafe("district", updatedData.district);
        setValueSafe("city", updatedData.city);
        setValueSafe("state", updatedData.state);
        setValueSafe("address", fullAddress);

        toast.success("📍 Localização atualizada com sucesso!");
      } finally {
        setIsUpdatingFromMap(false);
      }
    },
    [isUpdatingFromInputs, setValueSafe, watchSafe]
  );

  // Função para atualizar endereço completo baseado nos campos do formulário
  const updateFullAddress = useCallback(() => {
    const currentData = {
      cep: watchSafe("zipcode"),
      street: watchSafe("street"),
      number: watchSafe("number"),
      complement: watchSafe("complement"),
      district: watchSafe("district"),
      city: watchSafe("city"),
      state: watchSafe("state"),
    };

    const fullAddress = addressService.formatCompleteAddress(currentData);

    setAddressData((prev) => ({
      ...prev,
      ...currentData,
      fullAddress: fullAddress,
    }));

    setValueSafe("address", fullAddress);
  }, [watchSafe, setValueSafe]);

  // Atualizar mapa quando inputs mudam
  const updateMapFromInputs = useCallback(async () => {
    if (isUpdatingFromMap) return;

    const currentData = {
      street: watchSafe("street"),
      number: watchSafe("number"),
      district: watchSafe("district"),
      city: watchSafe("city"),
      state: watchSafe("state"),
    };

    const hasMinimumData =
      currentData.street && currentData.city && currentData.state;
    if (!hasMinimumData) return;

    setIsUpdatingFromInputs(true);

    try {
      const addressParts = Object.values(currentData).filter(Boolean);
      const searchAddress = addressParts.join(", ");

      const coordinates = await addressService.geocode(searchAddress);

      if (coordinates) {
        setValueSafe("latitude", coordinates.lat);
        setValueSafe("longitude", coordinates.lng);
        setValueSafe("lat", coordinates.lat);
        setValueSafe("long", coordinates.lng);

        setAddressData((prev) => ({
          ...prev,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        }));

        setMapKey((prev) => prev + 1);
        toast.success("🗺️ Mapa atualizado a partir do endereço!");
      }
    } catch (error) {
      console.error("Erro ao atualizar mapa:", error);
    } finally {
      setIsUpdatingFromInputs(false);
    }
  }, [watchSafe, isUpdatingFromMap, setValueSafe]);

  // Debounce para inputs - atualizar mapa
  useEffect(() => {
    const timeoutId = setTimeout(updateMapFromInputs, 1000);
    return () => clearTimeout(timeoutId);
  }, [
    watchSafe("street"),
    watchSafe("number"),
    watchSafe("district"),
    watchSafe("city"),
    watchSafe("state"),
  ]);

  // Atualizar endereço completo sempre que campos mudarem
  useEffect(() => {
    updateFullAddress();
  }, [
    updateFullAddress,
    watchSafe("zipcode"),
    watchSafe("street"),
    watchSafe("number"),
    watchSafe("complement"),
    watchSafe("district"),
    watchSafe("city"),
    watchSafe("state"),
  ]);

  return {
    addressData,
    handleMapLocationSelect,
    mapKey,
    isUpdatingFromMap,
    isUpdatingFromInputs,
    updateFullAddress,
    searchAddress: addressService.searchAddress.bind(addressService),
    fetchCEPData: addressService.fetchCEPData.bind(addressService),
  };
};
