'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard } from "lucide-react";

export interface CustomerCard {
  id: string;
  cardNumber: string;
  cardType: string;
  expirationDate: string;
  cardholderName: string;
  status: 'active' | 'inactive' | 'blocked';
  issuer: string;
  lastFourDigits: string;
}

interface CustomerCardSelectorProps {
  cards: CustomerCard[];
  selectedCardId?: string;
  onCardSelect: (cardId: string) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  error?: string;
}

// Utility function to mask card number (PCI compliance - only show last 4 digits)
function maskCardNumber(cardNumber: string): string {
  if (!cardNumber || cardNumber.length < 4) return '****';
  const lastFour = cardNumber.slice(-4);
  return `**** **** **** ${lastFour}`;
}

// Utility function to get card display text for dropdown
function getCardDisplayText(card: CustomerCard): string {
  const masked = maskCardNumber(card.cardNumber);
  return `${card.cardType} - ${masked}`;
}

export function CustomerCardSelector({
  cards,
  selectedCardId,
  onCardSelect,
  onConfirm,
  isLoading = false,
  error
}: CustomerCardSelectorProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar cuenta asociada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Cargando tarjetas...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar cuenta asociada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <CreditCard className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">No se pudieron cargar las Tarjetas</p>
            </div>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar cuenta asociada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="font-medium text-gray-900 mb-2">No se pudieron cargar las Tarjetas</p>
            <p className="text-sm text-gray-600">
              Este cliente no tiene tarjetas de pago asociadas a su cuenta.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seleccionar cuenta asociada</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedCardId} onValueChange={onCardSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una tarjeta" />
          </SelectTrigger>
          <SelectContent>
            {cards.map((card) => (
              <SelectItem 
                key={card.id} 
                value={card.id}
                disabled={card.status !== 'active'}
              >
                {getCardDisplayText(card)}
                {card.status !== 'active' && (
                  <span className="ml-2 text-xs text-red-600">
                    ({card.status})
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          onClick={onConfirm}
          disabled={!selectedCardId}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Seleccionar Tarjeta
        </Button>
      </CardContent>
    </Card>
  );
}
