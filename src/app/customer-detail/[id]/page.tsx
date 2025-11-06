"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getCustomerById } from "@/lib/actions/customer-detail";
import { WorkflowNavigation, WorkflowHeader, WorkflowAlert } from "@/components/workflow";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  // Fetch customer details using TanStack Query
  const {
    data: customer,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomerById(customerId),
    enabled: !!customerId,
  });

  const handleReturn = () => {
    router.back();
  };

  const handleAccept = () => {
    // Navigate to card management
    router.push(`/customer-cards/${customerId}`);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-gray-600">Cargando información del cliente...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !customer) {
    const errorMessage = error
      ? error instanceof Error
        ? error.message
        : "Error desconocido al cargar la información del cliente"
      : "Cliente no encontrado";

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

          <WorkflowAlert 
            type="error"
            message={errorMessage}
            className="mb-6"
          />

          {!customer && (
            <WorkflowAlert 
              type="info"
              message="No hay información de búsqueda para este cliente. Por favor, intenta realizar una nueva búsqueda."
              className="mb-6"
            />
          )}

          <WorkflowNavigation
            showReturn
            returnLabel="Regresar"
            onReturn={handleReturn}
            className="mt-6"
          />
        </div>
      </ProtectedRoute>
    );
  }

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

        {/* Page Header with Breadcrumb */}
        <WorkflowHeader
          title="Información del Cliente"
          breadcrumbs={[
            { label: "Búsqueda de cliente y pago", href: "/customer-search" },
            { label: "Información del Cliente" },
          ]}
          className="mb-6"
        />

        {/* Customer Information Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader className="border-b bg-gray-50 px-6 py-3">
              <h3 className="text-sm font-semibold uppercase text-gray-700">
                INFORMACIÓN PERSONAL
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-base text-gray-900">{customer.firstName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Apellido Paterno</p>
                  <p className="text-base text-gray-900">{customer.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Apellido Materno</p>
                  <p className="text-base text-gray-900">
                    {customer.secondLastName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <p className="text-base">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        customer.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {customer.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Registro</p>
                  <p className="text-base text-gray-900">
                    {new Date(customer.registrationDate).toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader className="border-b bg-gray-50 px-6 py-3">
              <h3 className="text-sm font-semibold uppercase text-gray-700">
                INFORMACIÓN DE CONTACTO
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Teléfonos</p>
                <div className="mt-2 space-y-1">
                  {customer.phones.length > 0 ? (
                    customer.phones.map((phone) => (
                      <div key={phone.id} className="flex items-center gap-2">
                        <span className="text-base text-gray-900">{phone.number}</span>
                        <span className="text-sm text-gray-500">({phone.type})</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-base text-gray-400">No hay teléfonos registrados</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader className="border-b bg-gray-50 px-6 py-3">
              <h3 className="text-sm font-semibold uppercase text-gray-700">
                INFORMACIÓN DE DIRECCIÓN
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {customer.addresses.length > 0 ? (
                customer.addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`rounded-lg border p-3 ${
                      address.isPrimary ? "border-blue-400 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    {address.isPrimary && (
                      <span className="mb-2 inline-flex rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                        Principal
                      </span>
                    )}
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium text-gray-900">{address.street}</p>
                      <p className="text-sm text-gray-600">
                        {address.neighborhoodName}, {address.municipalityName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.stateName} - CP: {address.postalCode}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-base text-gray-400">No hay direcciones registradas</p>
              )}
            </CardContent>
          </Card>

          {/* Government IDs */}
          <Card>
            <CardHeader className="border-b bg-gray-50 px-6 py-3">
              <h3 className="text-sm font-semibold uppercase text-gray-700">
                IDENTIFICACIONES OFICIALES
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {customer.governmentIds.length > 0 ? (
                customer.governmentIds.map((govId) => (
                  <div key={govId.id} className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">{govId.type}</p>
                    <p className="text-base text-gray-900">{govId.number}</p>
                  </div>
                ))
              ) : (
                <p className="text-base text-gray-400">
                  No hay identificaciones registradas
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <WorkflowNavigation
          showReturn
          returnLabel="Regresar"
          onReturn={handleReturn}
          showAccept
          acceptLabel="Aceptar"
          onAccept={handleAccept}
          className="mt-6"
        />
      </div>
    </ProtectedRoute>
  );
}
