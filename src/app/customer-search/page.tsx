"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2 } from "lucide-react";
import { HierarchicalAddressSelect } from "@/components/customer-search/hierarchical-address-select";
import type { CustomerSearchFilters } from "@/lib/types/customer";
import { validateSearchFilters } from "@/lib/utils/search-validation";
import { searchCustomers } from "@/lib/actions/customer-search";
import { CustomerSearchResults } from "@/components/customer-search/customer-search-results";

export default function CustomerSearchPage() {
  const [filters, setFilters] = useState<CustomerSearchFilters>({
    primaryPhone: "",
    secondaryPhone: "",
    clientNumber: "",
    firstName: "",
    lastName: "",
    secondLastName: "",
    dateOfBirth: "",
    rfc: "",
    stateId: "",
    municipalityId: "",
    neighborhoodId: "",
    postalCode: "",
    ife: "",
    passport: "",
  });

  const [validationError, setValidationError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // TanStack Query mutation for customer search
  const searchMutation = useMutation({
    mutationFn: searchCustomers,
    onError: (error) => {
      console.error("Search error:", error);
      setValidationError("Error al buscar clientes. Por favor, intenta de nuevo.");
    },
  });

  const handleInputChange = (field: keyof CustomerSearchFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear validation errors when user starts typing
    if (validationError) {
      setValidationError("");
    }
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleAddressChange = (
    stateId: string,
    municipalityId: string,
    neighborhoodId: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      stateId,
      municipalityId,
      neighborhoodId,
    }));
  };

  const handleClearQuery = () => {
    setFilters({
      primaryPhone: "",
      secondaryPhone: "",
      clientNumber: "",
      firstName: "",
      lastName: "",
      secondLastName: "",
      dateOfBirth: "",
      rfc: "",
      stateId: "",
      municipalityId: "",
      neighborhoodId: "",
      postalCode: "",
      ife: "",
      passport: "",
    });
    setValidationError("");
    setFieldErrors({});
  };

  const handleSearch = async () => {
    // Perform validation
    const validationResult = validateSearchFilters(filters);
    
    if (!validationResult.isValid) {
      // Set general error or field-specific errors
      if (validationResult.generalError) {
        setValidationError(validationResult.generalError);
      } else {
        // Convert array of errors to record
        const errorRecord: Record<string, string> = {};
        validationResult.errors.forEach((error) => {
          errorRecord[error.field] = error.message;
        });
        setFieldErrors(errorRecord);
        setValidationError("Por favor, corrige los errores en el formulario.");
      }
      return;
    }
    
    // Clear all errors if validation passes
    setValidationError("");
    setFieldErrors({});
    
    // Execute search using TanStack Query mutation
    searchMutation.mutate(filters);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
              <span className="text-2xl font-bold text-white">C</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">Caja Corporativa</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Caja bancaria</span>
          </div>
        </header>

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Llena alguno de los campos solicitados para iniciar la búsqueda del cliente.
          </AlertDescription>
        </Alert>

        {/* Validation Error */}
        {validationError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {/* Search Form Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Phone Data Section */}
            <Card>
              <CardHeader className="border-b bg-gray-50 px-6 py-3">
                <h2 className="text-sm font-semibold uppercase text-gray-700">
                  DATOS DE TELÉFONO
                </h2>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryPhone">Teléfono de casa</Label>
                  <Input
                    id="primaryPhone"
                    placeholder="Teléfono de casa"
                    value={filters.primaryPhone}
                    onChange={(e) => handleInputChange("primaryPhone", e.target.value)}
                    maxLength={10}
                    className={fieldErrors.primaryPhone ? "border-red-500" : ""}
                  />
                  {fieldErrors.primaryPhone && (
                    <p className="text-sm text-red-600">{fieldErrors.primaryPhone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryPhone">Celular</Label>
                  <Input
                    id="secondaryPhone"
                    placeholder="Celular"
                    value={filters.secondaryPhone}
                    onChange={(e) => handleInputChange("secondaryPhone", e.target.value)}
                    maxLength={10}
                    className={fieldErrors.secondaryPhone ? "border-red-500" : ""}
                  />
                  {fieldErrors.secondaryPhone && (
                    <p className="text-sm text-red-600">{fieldErrors.secondaryPhone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Data Section */}
            <Card>
              <CardHeader className="border-b bg-gray-50 px-6 py-3">
                <h2 className="text-sm font-semibold uppercase text-gray-700">
                  DATOS DEL CLIENTE
                </h2>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="clientNumber">No. de cliente</Label>
                  <Input
                    id="clientNumber"
                    placeholder="No. de cliente"
                    value={filters.clientNumber}
                    onChange={(e) => handleInputChange("clientNumber", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ap. paterno</Label>
                    <Input
                      id="firstName"
                      placeholder="ESQUIVEL"
                      value={filters.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Ap. materno</Label>
                    <Input
                      id="lastName"
                      placeholder="VELAZQUEZ"
                      value={filters.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Fecha de nac.</Label>
                    <Input
                      id="dateOfBirth"
                      placeholder="Fecha de nac."
                      type="date"
                      value={filters.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rfc">RFC</Label>
                  <Input
                    id="rfc"
                    placeholder="RFC"
                    value={filters.rfc}
                    onChange={(e) => handleInputChange("rfc", e.target.value)}
                    maxLength={13}
                    className={fieldErrors.rfc ? "border-red-500" : ""}
                  />
                  {fieldErrors.rfc && (
                    <p className="text-sm text-red-600">{fieldErrors.rfc}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Address Data Section */}
            <Card>
              <CardHeader className="border-b bg-gray-50 px-6 py-3">
                <h2 className="text-sm font-semibold uppercase text-gray-700">
                  DATOS DE DIRECCIÓN
                </h2>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <HierarchicalAddressSelect
                  stateId={filters.stateId}
                  municipalityId={filters.municipalityId}
                  neighborhoodId={filters.neighborhoodId}
                  onChange={handleAddressChange}
                />
                <div className="space-y-2">
                  <Label htmlFor="postalCode">CP</Label>
                  <Input
                    id="postalCode"
                    placeholder="CP"
                    value={filters.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    maxLength={5}
                    className={fieldErrors.postalCode ? "border-red-500" : ""}
                  />
                  {fieldErrors.postalCode && (
                    <p className="text-sm text-red-600">{fieldErrors.postalCode}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Official Data Section */}
            <Card>
              <CardHeader className="border-b bg-gray-50 px-6 py-3">
                <h2 className="text-sm font-semibold uppercase text-gray-700">
                  DATOS OFICIALES
                </h2>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="ife">IFE</Label>
                  <Input
                    id="ife"
                    placeholder="IFE"
                    value={filters.ife}
                    onChange={(e) => handleInputChange("ife", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passport">Pasaporte</Label>
                  <Input
                    id="passport"
                    placeholder="Pasaporte"
                    value={filters.passport}
                    onChange={(e) => handleInputChange("passport", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleSearch}
            className="bg-blue-600 px-8 hover:bg-blue-700"
            disabled={searchMutation.isPending}
          >
            {searchMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Buscar Cliente
          </Button>
          <Button
            onClick={handleClearQuery}
            variant="outline"
            className="border-blue-300 bg-cyan-100 px-8 text-blue-700 hover:bg-cyan-200"
            disabled={searchMutation.isPending}
          >
            Limpiar Consulta
          </Button>
        </div>

        {/* Search Results */}
        {searchMutation.data && (
          <CustomerSearchResults
            results={searchMutation.data.data}
            totalCount={searchMutation.data.totalCount}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
