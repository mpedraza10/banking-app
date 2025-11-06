"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertCircle, CreditCard } from "lucide-react";
import { getCustomerCards } from "@/lib/actions/customer-cards";

export default function CustomerCardsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const [selectedCardId, setSelectedCardId] = useState<string>("");

  // Fetch customer cards using TanStack Query
  const {
    data: cards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customer-cards", customerId],
    queryFn: () => getCustomerCards(customerId),
    enabled: !!customerId,
  });

  const handleReturn = () => {
    router.back();
  };

  const handleAccept = () => {
    if (selectedCardId) {
      // Navigate to payment processing or next step with selected card
      router.push(`/payment/${customerId}/${selectedCardId}`);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-gray-600">Cargando tarjetas del cliente...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
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

          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar las tarjetas del cliente. Por favor, intenta de nuevo.
            </AlertDescription>
          </Alert>

          <div className="mt-6">
            <Button
              onClick={handleReturn}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white px-6"
            >
              Regresar
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Handle no cards scenario
  if (!cards || cards.length === 0) {
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

          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="text-sm text-blue-600">
              <span className="cursor-pointer hover:underline" onClick={handleReturn}>
                Búsqueda de cliente y pago
              </span>
            </nav>
            <h2 className="mt-2 text-xl font-semibold text-gray-800">
              Tarjetas del Cliente
            </h2>
          </div>

          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Este cliente no tiene tarjetas registradas en el sistema.
            </AlertDescription>
          </Alert>

          <div className="mt-6">
            <Button
              onClick={handleReturn}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white px-6"
            >
              Regresar
            </Button>
          </div>
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

        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="text-sm text-blue-600">
            <span className="cursor-pointer hover:underline" onClick={handleReturn}>
              Búsqueda de cliente y pago
            </span>
          </nav>
          <h2 className="mt-2 text-xl font-semibold text-gray-800">
            Selecciona una Tarjeta
          </h2>
        </div>

        {/* Info message */}
        <div className="mb-4 rounded bg-blue-100 px-4 py-3 text-sm text-blue-800">
          Selecciona la tarjeta con la que el cliente realizará el pago.
        </div>

        {/* Cards display */}
        <Card>
          <CardHeader className="border-b bg-gray-50 px-6 py-3">
            <h3 className="text-sm font-semibold uppercase text-gray-700">
              TARJETAS DISPONIBLES ({cards.length})
            </h3>
          </CardHeader>
          <CardContent className="p-6">
            <RadioGroup value={selectedCardId} onValueChange={setSelectedCardId}>
              <div className="space-y-3">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      selectedCardId === card.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setSelectedCardId(card.id)}
                  >
                    <div className="flex items-start gap-4">
                      <RadioGroupItem value={card.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-gray-600" />
                          <h4 className="font-semibold text-gray-900">
                            {card.cardType} - {card.maskedNumber}
                          </h4>
                          <span
                            className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
                              card.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {card.status === "active" ? "Activa" : "Inactiva"}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <div>
                            <span className="text-gray-500">Titular: </span>
                            <span className="text-gray-900">{card.cardholderName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Exp: </span>
                            <span className="text-gray-900">{card.expirationDate}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Límite: </span>
                            <span className="text-gray-900">
                              ${card.creditLimit?.toLocaleString("es-MX") || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Disponible: </span>
                            <span className="text-gray-900">
                              ${card.availableCredit?.toLocaleString("es-MX") || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleAccept}
            disabled={!selectedCardId}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Aceptar
          </Button>
          <Button
            onClick={handleReturn}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white px-6"
          >
            Regresar
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
