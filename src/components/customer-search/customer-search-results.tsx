"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { CustomerSearchResult } from "@/lib/types/customer";

interface CustomerSearchResultsProps {
  results: CustomerSearchResult[];
  totalCount: number;
}

export function CustomerSearchResults({
  results,
  totalCount,
}: CustomerSearchResultsProps) {
  // Handle empty results
  if (totalCount === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="py-12">
          <Alert className="border-yellow-200 bg-yellow-50">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              No hay información de búsqueda. Intenta con diferentes criterios.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="border-b bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-gray-700">
            RESULTADOS DE BÚSQUEDA
          </h2>
          <span className="text-sm text-gray-600">
            {totalCount} {totalCount === 1 ? "cliente encontrado" : "clientes encontrados"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {results.map((customer) => (
            <div
              key={customer.id}
              className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-400 hover:bg-blue-50"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900">
                    {customer.firstName} {customer.lastName}{" "}
                    {customer.secondLastName || ""}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Teléfono:</span> {customer.primaryPhone || "No disponible"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Dirección:</span>{" "}
                    {customer.primaryAddress || "No disponible"}
                  </p>
                </div>
                <div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      customer.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {customer.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
