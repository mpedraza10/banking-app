"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CreditCard, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

interface CustomerCardsDisplayProps {
  cards: CustomerCard[];
  selectedCardId?: string;
  onCardSelect: (cardId: string) => void;
  onAccept: () => void;
  isLoading?: boolean;
  error?: string;
}

// Utility function to mask card number (PCI compliance - show only last 4 digits)
function maskCardNumber(cardNumber: string): string {
  if (!cardNumber || cardNumber.length < 4) return '****';
  const lastFour = cardNumber.slice(-4);
  return `**** **** **** ${lastFour}`;
}

// Format card display text
function formatCardDisplay(card: CustomerCard): string {
  const masked = maskCardNumber(card.cardNumber);
  return `${card.cardType} - ${masked}`;
}

export function CustomerCardsDisplay({
  cards,
  selectedCardId,
  onCardSelect,
  onAccept,
  isLoading = false,
  error
}: CustomerCardsDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar cuenta asociada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No se pudieron cargar las Tarjetas
            </AlertDescription>
          </Alert>
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
        <CardContent className="space-y-4">
          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              No se pudieron cargar las Tarjetas
            </AlertDescription>
          </Alert>
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
        <div className="space-y-2">
          <Label htmlFor="card-select">Selecciona una tarjeta</Label>
          <Select value={selectedCardId} onValueChange={onCardSelect}>
            <SelectTrigger id="card-select">
              <SelectValue placeholder="Selecciona una tarjeta" />
            </SelectTrigger>
            <SelectContent>
              {cards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {formatCardDisplay(card)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={onAccept}
          disabled={!selectedCardId}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Seleccionar Tarjeta
        </Button>
      </CardContent>
    </Card>
  );
}
