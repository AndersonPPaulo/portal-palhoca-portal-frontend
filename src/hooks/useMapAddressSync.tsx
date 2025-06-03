// hooks/useMapAddressSync.tsx
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

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

// Hook customizado para sincronização bidirecional
export const useMapAddressSync = (
  setValue: (name: string, value: any) => void,
  watch: (name: string) => any
) => {
  const [addressData, setAddressData] = useState<AddressData>({
    cep: '',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
    fullAddress: '',
    latitude: undefined,
    longitude: undefined,
  });

  const [isUpdatingFromMap, setIsUpdatingFromMap] = useState(false);
  const [isUpdatingFromInputs, setIsUpdatingFromInputs] = useState(false);
  const [isResettingFields, setIsResettingFields] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Para forçar re-render do mapa

  // API do CEP
  const cepAPI = axios.create({
    baseURL: 'https://viacep.com.br/ws',
  });

  // Função para formatar endereço de forma limpa
  const formatCleanAddress = useCallback((data: NominatimResult): string => {
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
  }, []);

  // Função para filtrar display_name quando não há dados estruturados
  const filterDisplayName = useCallback((displayName: string): string => {
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
  }, []);

  // Função para parsear endereço do mapa e extrair dados estruturados
  const parseMapAddress = useCallback((mapAddress: string): Partial<AddressData> => {
    if (!mapAddress) return {};

    const parts = mapAddress.split(', ').map(part => part.trim());
    const parsed: Partial<AddressData> = {};

    // Extrair CEP (padrão brasileiro: 00000-000)
    const cepRegex = /\d{5}-?\d{3}/;
    const cepMatch = mapAddress.match(cepRegex);
    if (cepMatch) {
      parsed.cep = cepMatch[0].replace('-', '').replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    // Extrair estado (últimas siglas antes do CEP)
    const stateRegex = /\b[A-Z]{2}\b/g;
    const stateMatches = mapAddress.match(stateRegex);
    if (stateMatches) {
      parsed.state = stateMatches[stateMatches.length - 1];
    }

    // Lógica para extrair outras informações baseada na estrutura típica
    if (parts.length >= 4) {
      const withoutCEP = parts.filter(part => !cepRegex.test(part));
      const withoutState = withoutCEP.filter(part => !/^[A-Z]{2}$/.test(part));

      if (withoutState.length >= 3) {
        // Última parte é cidade, penúltima é bairro
        parsed.city = withoutState[withoutState.length - 1];
        parsed.district = withoutState[withoutState.length - 2];

        // Primeira ou segunda parte pode ser a rua
        for (let i = 0; i < withoutState.length - 2; i++) {
          const part = withoutState[i];
          if (part.toLowerCase().includes('rua') || 
              part.toLowerCase().includes('avenida') || 
              part.toLowerCase().includes('av.') ||
              part.toLowerCase().includes('r.') ||
              /\d+/.test(part)) {
            parsed.street = part;
            
            // Extrair número da rua se estiver junto
            const numberMatch = part.match(/(\d+)/);
            if (numberMatch && !parsed.number) {
              parsed.number = numberMatch[1];
              parsed.street = part.replace(/,?\s*\d+.*/, '').trim();
            }
            break;
          }
        }
      }
    }

    return parsed;
  }, []);

  // Função para buscar dados do CEP
  const fetchCEPData = useCallback(async (cep: string): Promise<CEPResponse | null> => {
    if (!cep || cep.length < 8) return null;

    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return null;

    try {
      const response = await cepAPI.get(`/${cleanCEP}/json`);
      if (response.data.erro) return null;
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  }, [cepAPI]);

  // Função para geocodificar endereço (endereço -> coordenadas)
  const geocodeAddress = useCallback(async (address: string): Promise<{lat: number, lng: number} | null> => {
    if (!address.trim()) return null;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address + ', Brasil'
        )}&limit=1&countrycodes=br&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error('Erro na geocodificação:', error);
    }

    return null;
  }, []);

  // Função para geocodificação reversa - MODIFICADA para retornar endereço limpo
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
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
  }, [formatCleanAddress]);

  // Função chamada quando o mapa é atualizado
  const handleMapLocationSelect = useCallback(async (lat: number, lng: number, address?: string) => {
    if (isUpdatingFromInputs) return; // Evitar loop infinito

    setIsUpdatingFromMap(true);
    setIsResettingFields(true);

    try {
      // PRIMEIRO: Resetar todos os campos de endereço
      setValue('cep', '');
      setValue('street', '');
      setValue('number', '');
      setValue('complement', '');
      setValue('district', '');
      setValue('city', '');
      setValue('state', '');
      setValue('address', '');
      
      // Pequeno delay para feedback visual do reset
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setIsResettingFields(false);

      // Se não veio endereço, buscar por geocodificação reversa
      let cleanAddress = address;
      if (!cleanAddress) {
        cleanAddress = await reverseGeocode(lat, lng);
      }

      const parsedData = cleanAddress ? parseMapAddress(cleanAddress) : {};
      
      const newAddressData: AddressData = {
        cep: '',
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        ...parsedData,
        fullAddress: cleanAddress || '',
        latitude: lat,
        longitude: lng,
      };

      setAddressData(newAddressData);

      // DEPOIS: Preencher com os novos dados do mapa
      if (parsedData.cep) setValue('cep', parsedData.cep);
      if (parsedData.street) setValue('street', parsedData.street);
      if (parsedData.number) setValue('number', parsedData.number);
      if (parsedData.district) setValue('district', parsedData.district);
      if (parsedData.city) setValue('city', parsedData.city);
      if (parsedData.state) setValue('state', parsedData.state);
      
      setValue('latitude', lat);
      setValue('longitude', lng);

      // Gerar links automáticos
      const googleMapsLink = `https://maps.google.com/maps?q=${lat},${lng}`;
      const wazeLink = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
      
      setValue('linkLocationMaps', googleMapsLink);
      setValue('linkLocationWaze', wazeLink);

      if (cleanAddress) {
        toast.success('🔄 Campos resetados e endereço carregado do mapa!');
      }
    } finally {
      setIsUpdatingFromMap(false);
      setIsResettingFields(false);
    }
  }, [parseMapAddress, setValue, isUpdatingFromInputs, reverseGeocode]);

  // Função para atualizar mapa quando inputs mudam
  const updateMapFromInputs = useCallback(async () => {
    if (isUpdatingFromMap) return; // Evitar loop infinito

    const currentData = {
      cep: watch('cep') || '',
      street: watch('street') || '',
      number: watch('number') || '',
      district: watch('district') || '',
      city: watch('city') || '',
      state: watch('state') || '',
    };

    // Verificar se temos dados suficientes para geocodificar
    const hasMinimumData = currentData.street && currentData.city && currentData.state;
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

      const fullAddress = addressParts.join(', ');
      
      // Geocodificar para obter coordenadas
      const coordinates = await geocodeAddress(fullAddress);
      
      if (coordinates) {
        const newAddressData: AddressData = {
          ...currentData,
          complement: watch('complement') || '',
          fullAddress,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        };

        setAddressData(newAddressData);
        setValue('latitude', coordinates.lat);
        setValue('longitude', coordinates.lng);
        
        // Forçar atualização do mapa
        setMapKey(prev => prev + 1);
        
        toast.success('🗺️ Mapa atualizado a partir do endereço!');
      }
    } catch (error) {
      console.error('Erro ao atualizar mapa:', error);
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
  }, [watch('street'), watch('number'), watch('district'), watch('city'), watch('state')]);

  return {
    addressData,
    handleMapLocationSelect,
    mapKey,
    isUpdatingFromMap,
    isUpdatingFromInputs,
    isResettingFields,
  };
};