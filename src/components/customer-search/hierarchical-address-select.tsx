"use client";

import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getStates,
  getMunicipalities,
  getNeighborhoods,
} from "@/lib/actions/address-hierarchy";

interface HierarchicalAddressSelectProps {
  stateId: string;
  municipalityId: string;
  neighborhoodId: string;
  onChange: (stateId: string, municipalityId: string, neighborhoodId: string) => void;
}

export function HierarchicalAddressSelect({
  stateId,
  municipalityId,
  neighborhoodId,
  onChange,
}: HierarchicalAddressSelectProps) {
  // Fetch states
  const { data: states, isLoading: statesLoading } = useQuery({
    queryKey: ["states"],
    queryFn: getStates,
  });

  // Fetch municipalities when state is selected
  const { data: municipalities, isLoading: municipalitiesLoading } = useQuery({
    queryKey: ["municipalities", stateId],
    queryFn: () => getMunicipalities(stateId),
    enabled: !!stateId,
  });

  // Fetch neighborhoods when municipality is selected
  const { data: neighborhoods, isLoading: neighborhoodsLoading } = useQuery({
    queryKey: ["neighborhoods", municipalityId],
    queryFn: () => getNeighborhoods(municipalityId),
    enabled: !!municipalityId,
  });

  const handleStateChange = (value: string) => {
    // Reset dependent fields when state changes
    onChange(value, "", "");
  };

  const handleMunicipalityChange = (value: string) => {
    // Reset neighborhood when municipality changes
    onChange(stateId, value, "");
  };

  const handleNeighborhoodChange = (value: string) => {
    onChange(stateId, municipalityId, value);
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* State Selection */}
      <div className="space-y-2">
        <Label htmlFor="state">Estado</Label>
        <Select value={stateId} onValueChange={handleStateChange}>
          <SelectTrigger id="state">
            <SelectValue placeholder="Seleccione una" />
          </SelectTrigger>
          <SelectContent>
            {statesLoading ? (
              <SelectItem value="loading" disabled>
                Cargando...
              </SelectItem>
            ) : (
              states?.data.map((state) => (
                <SelectItem key={state.id} value={state.id}>
                  {state.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Municipality Selection */}
      <div className="space-y-2">
        <Label htmlFor="municipality">Municipio</Label>
        <Select
          value={municipalityId}
          onValueChange={handleMunicipalityChange}
          disabled={!stateId}
        >
          <SelectTrigger id="municipality">
            <SelectValue placeholder="Seleccione una" />
          </SelectTrigger>
          <SelectContent>
            {municipalitiesLoading ? (
              <SelectItem value="loading" disabled>
                Cargando...
              </SelectItem>
            ) : (
              municipalities?.data.map((municipality) => (
                <SelectItem key={municipality.id} value={municipality.id}>
                  {municipality.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Neighborhood Selection */}
      <div className="space-y-2">
        <Label htmlFor="neighborhood">Colonia</Label>
        <Select
          value={neighborhoodId}
          onValueChange={handleNeighborhoodChange}
          disabled={!municipalityId}
        >
          <SelectTrigger id="neighborhood">
            <SelectValue placeholder="Seleccione una opción" />
          </SelectTrigger>
          <SelectContent>
            {neighborhoodsLoading ? (
              <SelectItem value="loading" disabled>
                Cargando...
              </SelectItem>
            ) : (
              neighborhoods?.data.map((neighborhood) => (
                <SelectItem key={neighborhood.id} value={neighborhood.id}>
                  {neighborhood.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
