import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import axios from 'axios';

// Tipos integrados
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
  private cepAPI = axios.create({ baseURL: 'https://viacep.com.br/ws' });

  // Buscar CEP - rápido e simples
  async fetchCEPData(cep: string): Promise<CEPResponse | null> {
    if (!cep || cep.length < 8) return null;
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return null;

    try {
      const response = await this.cepAPI.get(`/${cleanCEP}/json`);
      return response.data.erro ? null : response.data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  }

  // Geocodificação reversa - FOCO NAS COORDENADAS
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
      console.error('Erro na geocodificação reversa:', error);
      return `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }

  // Geocodificação direta - busca por texto
  async geocode(address: string): Promise<{lat: number, lng: number} | null> {
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
  }

  // Buscar endereço por texto
  async searchAddress(searchTerm: string): Promise<{ coordinates: {lat: number, lng: number}; address: string } | null> {
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
          lng: parseFloat(result.lon)
        };
        const address = await this.reverseGeocode(coordinates.lat, coordinates.lng);
        return { coordinates, address };
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
    }
    return null;
  }

  // Extrair dados estruturados - TOLERANTE
  extractStructuredData(data: NominatimResult): Partial<AddressData> {
    if (!data.address) {
      return this.parseDisplayNameFallback(data.display_name || '');
    }

    const addr = data.address;
    const extracted: Partial<AddressData> = {};

    // CEP (opcional)
    if (addr.postcode) {
      const cleanCep = addr.postcode.replace(/\D/g, '');
      if (cleanCep.length >= 8) {
        extracted.cep = cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2');
      }
    }

    // Dados de endereço (todos opcionais)
    extracted.street = addr.road || addr.street || '';
    extracted.number = addr.house_number || '';
    
    const neighborhood = addr.suburb || addr.neighbourhood || addr.residential;
    if (neighborhood && neighborhood !== extracted.street) {
      extracted.district = neighborhood;
    }
    
    extracted.city = addr.city || addr.town || addr.village || addr.municipality || '';
    extracted.state = addr.state || '';

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
    if (businessName && businessName !== addr.road && businessName !== addr.street) {
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

    // Aceitar qualquer quantidade de dados
    return parts.length >= 1 ? parts.join(', ') : this.filterDisplayName(data.display_name);
  }

  // Fallback para display_name
  private parseDisplayNameFallback(displayName: string): Partial<AddressData> {
    const parts = displayName.split(', ').map(part => part.trim());
    const extracted: Partial<AddressData> = {};

    const cepMatch = displayName.match(/\d{5}-?\d{3}/);
    if (cepMatch) {
      extracted.cep = cepMatch[0].replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    const stateMatches = displayName.match(/\b[A-Z]{2}\b/g);
    if (stateMatches) {
      extracted.state = stateMatches[stateMatches.length - 1];
    }

    const filteredParts = parts.filter(part => 
      !cepMatch?.test(part) && 
      !/^[A-Z]{2}$/.test(part) && 
      !part.toLowerCase().includes('brasil')
    );

    if (filteredParts.length >= 2) {
      extracted.city = filteredParts[filteredParts.length - 1];
      if (filteredParts.length >= 2) {
        extracted.district = filteredParts[filteredParts.length - 2];
      }
      
      for (let i = 0; i < Math.min(2, filteredParts.length - 2); i++) {
        const part = filteredParts[i];
        if (part.toLowerCase().includes('rua') || 
            part.toLowerCase().includes('avenida') ||
            /\d+/.test(part)) {
          
          const numberMatch = part.match(/(\d+)/);
          if (numberMatch) {
            extracted.number = numberMatch[1];
            extracted.street = part.replace(/,?\s*\d+.*/, '').trim();
          } else {
            extracted.street = part;
          }
          break;
        }
      }
    }

    return extracted;
  }

  // Filtrar display_name
  private filterDisplayName(displayName: string): string {
    const parts = displayName.split(', ');
    const filtered: string[] = [];
    
    const termsToRemove = [
      'Região Geográfica Imediata', 'Região Geográfica Intermediária', 
      'Região Sul', 'Região Norte', 'Região Nordeste', 
      'Região Centro-Oeste', 'Região Sudeste', 'Brasil', 'Brazil'
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

    return parts.join(' - ');
  }

  // Gerar links de navegação
  generateNavigationLinks(lat: number, lng: number) {
    return {
      googleMaps: `https://maps.google.com/maps?q=${lat},${lng}`,
      waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
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
    cep: '', street: '', number: '', complement: '', district: '',
    city: '', state: '', fullAddress: '', latitude: undefined, longitude: undefined,
  });

  const [isUpdatingFromMap, setIsUpdatingFromMap] = useState(false);
  const [isUpdatingFromInputs, setIsUpdatingFromInputs] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  // Helpers para setValue/watch com segurança
  const setValueSafe = useCallback((fieldName: string, value: any) => {
    try {
      setValue(fieldName as any, value);
    } catch (error) {
      console.warn(`Erro ao setar campo ${fieldName}:`, error);
    }
  }, [setValue]);

  const watchSafe = useCallback((fieldName: string): any => {
    try {
      return watch(fieldName as any);
    } catch (error) {
      console.warn(`Erro ao observar campo ${fieldName}:`, error);
      return '';
    }
  }, [watch]);

  // Função principal - FOCO NAS COORDENADAS EXATAS
  const handleMapLocationSelect = useCallback(async (lat: number, lng: number, address?: string) => {
    if (isUpdatingFromInputs) return;

    setIsUpdatingFromMap(true);

    try {
      // 🎯 PRIORIDADE 1: Salvar coordenadas e gerar links precisos
      setValueSafe('latitude', lat);
      setValueSafe('longitude', lng);
      
      const links = addressService.generateNavigationLinks(lat, lng);
      setValueSafe('linkLocationMaps', links.googleMaps);
      setValueSafe('linkLocationWaze', links.waze);

      // 🧹 Limpar campos de endereço
      ['cep', 'street', 'number', 'complement', 'district', 'city', 'state', 'address']
        .forEach(field => setValueSafe(field, ''));
      
      await new Promise(resolve => setTimeout(resolve, 200));

      // 📍 PRIORIDADE 2: Tentar buscar dados de endereço (opcional)
      let extractedData: Partial<AddressData> = {};

      try {
        if (!address) {
          address = await addressService.reverseGeocode(lat, lng);
        }

        if (address && !address.startsWith('Coordenadas:')) {
          // Criar um objeto compatível com NominatimResult
          const mockResult: NominatimResult = { 
            display_name: address, 
            address: undefined,
            lat: lat.toString(),
            lon: lng.toString()
          };
          extractedData = addressService.extractStructuredData(mockResult);
          
          // Se temos CEP, tentar melhorar com dados da API do CEP
          if (extractedData.cep) {
            try {
              const cepData = await addressService.fetchCEPData(extractedData.cep);
              if (cepData) {
                extractedData.street = extractedData.street || cepData.logradouro;
                extractedData.district = extractedData.district || cepData.bairro;
                extractedData.city = extractedData.city || cepData.localidade;
                extractedData.state = extractedData.state || cepData.uf;
              }
            } catch (cepError) {
              console.log('CEP lookup falhou, continuando sem CEP');
            }
          }
        }
      } catch (geocodeError) {
        console.log('Geocoding falhou, usando apenas coordenadas');
      }

      // Montar endereço completo a partir dos dados encontrados (ou vazio se não houver)
      const fullAddress = addressService.formatCompleteAddress(extractedData);

      // Atualizar estado
      const newAddressData: AddressData = {
        cep: extractedData.cep || '',
        street: extractedData.street || '',
        number: extractedData.number || '',
        complement: '',
        district: extractedData.district || '',
        city: extractedData.city || '',
        state: extractedData.state || '',
        fullAddress: fullAddress, // Endereço real, não coordenadas
        latitude: lat,
        longitude: lng,
      };

      setAddressData(newAddressData);

      // Preencher campos COM DADOS ENCONTRADOS
      Object.entries(newAddressData).forEach(([key, value]) => {
        if (value && key !== 'latitude' && key !== 'longitude') {
          setValueSafe(key, value);
        }
      });

      // 🎉 FEEDBACK POSITIVO - foco nas coordenadas salvas
      const foundData = Object.entries(newAddressData)
        .filter(([key, value]) => value && ['street', 'number', 'district', 'city'].includes(key))
        .map(([key]) => key === 'street' ? 'rua' : key === 'number' ? 'número' : 
                      key === 'district' ? 'bairro' : 'cidade');
      
      if (foundData.length >= 2) {
        toast.success(`📍 Localização exata salva! Encontrado: ${foundData.join(', ')} | Links gerados!`);
      } else if (foundData.length === 1) {
        toast.success(`📍 Localização salva! Encontrado: ${foundData[0]} | Complete os outros campos se necessário`);
      } else {
        toast.success('📍 Localização exata salva! Links do Maps e Waze gerados | Complete o endereço manualmente');
      }

    } finally {
      setIsUpdatingFromMap(false);
    }
  }, [isUpdatingFromInputs, setValueSafe]);

  // Função para atualizar endereço completo baseado nos campos do formulário
  const updateFullAddress = useCallback(() => {
    const currentData = {
      cep: watchSafe('cep'),
      street: watchSafe('street'),
      number: watchSafe('number'),
      complement: watchSafe('complement'),
      district: watchSafe('district'),
      city: watchSafe('city'),
      state: watchSafe('state'),
    };

    const fullAddress = addressService.formatCompleteAddress(currentData);
    
    setAddressData(prev => ({
      ...prev,
      ...currentData,
      fullAddress: fullAddress
    }));

    setValueSafe('address', fullAddress);
  }, [watchSafe, setValueSafe]);

  // Atualizar mapa quando inputs mudam
  const updateMapFromInputs = useCallback(async () => {
    if (isUpdatingFromMap) return;

    const currentData = {
      street: watchSafe('street'),
      number: watchSafe('number'),
      district: watchSafe('district'),
      city: watchSafe('city'),
      state: watchSafe('state'),
    };

    const hasMinimumData = currentData.street && currentData.city && currentData.state;
    if (!hasMinimumData) return;

    setIsUpdatingFromInputs(true);

    try {
      const addressParts = Object.values(currentData).filter(Boolean);
      const searchAddress = addressParts.join(', ');
      
      const coordinates = await addressService.geocode(searchAddress);
      
      if (coordinates) {
        setValueSafe('latitude', coordinates.lat);
        setValueSafe('longitude', coordinates.lng);
        
        // Atualizar estado com coordenadas, mantendo dados dos campos
        setAddressData(prev => ({
          ...prev,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        }));
        
        setMapKey(prev => prev + 1);
        toast.success('🗺️ Mapa atualizado a partir do endereço!');
      }
    } catch (error) {
      console.error('Erro ao atualizar mapa:', error);
    } finally {
      setIsUpdatingFromInputs(false);
    }
  }, [watchSafe, isUpdatingFromMap, setValueSafe]);

  // Debounce para inputs - atualizar mapa
  useEffect(() => {
    const timeoutId = setTimeout(updateMapFromInputs, 1000);
    return () => clearTimeout(timeoutId);
  }, [watchSafe('street'), watchSafe('number'), watchSafe('district'), watchSafe('city'), watchSafe('state')]);

  // Atualizar endereço completo sempre que campos mudarem
  useEffect(() => {
    updateFullAddress();
  }, [updateFullAddress, watchSafe('cep'), watchSafe('street'), watchSafe('number'), watchSafe('complement'), watchSafe('district'), watchSafe('city'), watchSafe('state')]);

  return {
    addressData,
    handleMapLocationSelect,
    mapKey,
    isUpdatingFromMap,
    isUpdatingFromInputs,
    updateFullAddress, // Exportar para uso no formulário
    // Exportar funções úteis
    searchAddress: addressService.searchAddress.bind(addressService),
    fetchCEPData: addressService.fetchCEPData.bind(addressService),
  };
};