"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info } from "lucide-react";
import type { CustomerSearchResult } from "@/lib/types/customer";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CustomerSearchResultsProps {
  results: CustomerSearchResult[];
  totalCount: number;
  onCustomerSelect?: (customerId: string) => void;
  onReturn?: () => void;
}

export function CustomerSearchResults({
  results,
  totalCount,
  onCustomerSelect,
  onReturn,
}: CustomerSearchResultsProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // Handle empty results
  if (totalCount === 0) {
    return (
      <div className="mt-6">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            No hay información de búsqueda
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSelectClick = () => {
    if (selectedCustomerId && onCustomerSelect) {
      onCustomerSelect(selectedCustomerId);
    }
  };

  return (
    <div className="mt-6">
      {/* Header message */}
      <div className="mb-4 rounded bg-blue-100 px-4 py-3 text-sm text-blue-800">
        Selecciona al cliente para actualizar sus datos o trabajar con sus cuentas.
      </div>

      {/* Results table */}
      <div className="overflow-x-auto rounded border border-gray-300 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
              <th className="border-b border-r border-gray-300 px-3 py-2 w-12"></th>
              <th className="border-b border-r border-gray-300 px-3 py-2">No. Cliente</th>
              <th className="border-b border-r border-gray-300 px-3 py-2">Nombre</th>
              <th className="border-b border-r border-gray-300 px-3 py-2">RFC</th>
              <th className="border-b border-r border-gray-300 px-3 py-2">Dirección</th>
              <th className="border-b border-gray-300 px-3 py-2">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            <RadioGroup value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              {results.map((customer) => (
                <tr
                  key={customer.id}
                  className="cursor-pointer hover:bg-gray-50 text-sm"
                  onClick={() => setSelectedCustomerId(customer.id)}
                >
                  <td className="border-b border-r border-gray-300 px-3 py-2 text-center">
                    <RadioGroupItem value={customer.id} className="mx-auto" />
                  </td>
                  <td className="border-b border-r border-gray-300 px-3 py-2">
                    {customer.customerNumber || customer.id.slice(0, 10)}
                  </td>
                  <td className="border-b border-r border-gray-300 px-3 py-2">
                    {customer.firstName} {customer.lastName} {customer.secondLastName || ""}
                  </td>
                  <td className="border-b border-r border-gray-300 px-3 py-2">
                    {customer.rfc || ""}
                  </td>
                  <td className="border-b border-r border-gray-300 px-3 py-2">
                    {customer.primaryAddress || ""}
                  </td>
                  <td className="border-b border-gray-300 px-3 py-2">
                    {customer.primaryPhone || ""}
                  </td>
                </tr>
              ))}
            </RadioGroup>
          </tbody>
        </table>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        <Button
          onClick={handleSelectClick}
          disabled={!selectedCustomerId}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          Seleccionar cliente
        </Button>
        <Button
          onClick={onReturn}
          variant="destructive"
          className="bg-red-600 hover:bg-red-700 text-white px-6"
        >
          Regresar
        </Button>
      </div>
    </div>
  );
}
