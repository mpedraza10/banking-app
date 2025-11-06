"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Info, Shield, AlertTriangle } from "lucide-react";
import { 
  maskCardNumber, 
  getCardBrand,
  validateCardForTransaction 
} from "@/lib/utils/card-security.utils";

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
  onAccept?: () => void;
  isLoading?: boolean;
  error?: string;
}

// Card masking is now handled by imported utility function from card-security.utils.ts

// Utility function to get card type display name
// Also validates against detected card brand for security
function getCardTypeName(cardType: string, cardNumber?: string): string {
  const type = cardType.toLowerCase();
  
  // If card number provided, verify brand matches for security
  if (cardNumber) {
    const detectedBrand = getCardBrand(cardNumber);
    if (detectedBrand !== 'Unknown' && detectedBrand.toLowerCase() !== type) {
      console.warn(`Card type mismatch: stored=${cardType}, detected=${detectedBrand}`);
    }
  }
  
  switch (type) {
    case 'visa':
      return 'Visa';
    case 'mastercard':
      return 'MasterCard';
    case 'amex':
    case 'american express':
      return 'American Express';
    default:
      return cardType;
  }
}

// Utility function to get status badge variant
function getStatusVariant(status: string): "default" | "secondary" | "destructive" {
  switch (status) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    case 'blocked':
      return 'destructive';
    default:
      return 'secondary';
  }
}

// Utility function to format card for dropdown display (PCI compliant)
function formatCardForDisplay(card: CustomerCard): string {
  const maskedNumber = maskCardNumber(card.cardNumber);
  const brandName = getCardTypeName(card.cardType, card.cardNumber);
  return `${brandName} - ${maskedNumber}`;
}

// Utility function to check if card has security warnings
function getCardSecurityWarning(card: CustomerCard): string | null {
  const validation = validateCardForTransaction({
    cardNumber: card.cardNumber,
    expirationDate: card.expirationDate,
    status: card.status
  });
  
  if (!validation.isValid) {
    return validation.error || 'Tarjeta no válida para transacciones';
  }
  
  return null;
}

export function CustomerCardsDisplay({
  cards,
  selectedCardId,
  onCardSelect,
  onAccept,
  isLoading = false,
  error
}: CustomerCardsDisplayProps) {
  const selectedCard = cards.find(card => card.id === selectedCardId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Cargando tarjetas...
          </AlertDescription>
        </Alert>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Cargando información de tarjetas...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Busca la tarjeta asociada a la cuenta de tu cliente.
          </AlertDescription>
        </Alert>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="font-medium text-gray-900 mb-2">No se pudieron cargar las Tarjetas</p>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Busca la tarjeta asociada a la cuenta de tu cliente.
          </AlertDescription>
        </Alert>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium text-gray-900 mb-2">No se pudieron cargar las Tarjetas</p>
              <p className="text-sm text-gray-600">
                Este cliente no tiene tarjetas de pago asociadas a su cuenta.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Banner - matching prototype design */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          Busca la tarjeta asociada a la cuenta de tu cliente.
        </AlertDescription>
      </Alert>

      {/* Card Selection Section - matching prototype design */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-normal">Seleccionar cuenta asociada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dropdown for card selection */}
          <div className="space-y-2">
            <Label htmlFor="card-select">Selecciona una tarjeta</Label>
            <Select value={selectedCardId} onValueChange={onCardSelect}>
              <SelectTrigger id="card-select" className="w-full">
                <SelectValue placeholder="Selecciona una tarjeta" />
              </SelectTrigger>
              <SelectContent>
                {cards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{formatCardForDisplay(card)}</span>
                      <Badge 
                        variant={getStatusVariant(card.status)} 
                        className="text-xs ml-2"
                      >
                        {card.status.toUpperCase()}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Card Details */}
          {selectedCard && (
            <div className="space-y-3">
              {/* Security Warning if card has issues */}
              {(() => {
                const warning = getCardSecurityWarning(selectedCard);
                return warning ? (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-900">
                      {warning}
                    </AlertDescription>
                  </Alert>
                ) : null;
              })()}
              
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">{getCardTypeName(selectedCard.cardType)}</span>
                </div>
                <Badge variant={getStatusVariant(selectedCard.status)} className="text-xs">
                  {selectedCard.status.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número de tarjeta:</span>
                  <span className="font-mono">{maskCardNumber(selectedCard.cardNumber)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Titular:</span>
                  <span>{selectedCard.cardholderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de expiración:</span>
                  <span>{selectedCard.expirationDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emisor:</span>
                  <span>{selectedCard.issuer}</span>
                </div>
              </div>
              
              {/* PCI DSS Compliance Notice */}
              <div className="flex items-start gap-2 text-xs text-gray-600 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Shield className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>
                  La información de la tarjeta está protegida según los estándares PCI DSS.
                  Los números completos nunca se muestran por seguridad.
                </p>
              </div>
            </div>
            </div>
          )}

          {/* Action Button - matching prototype design */}
          <Button
            onClick={onAccept}
            disabled={!selectedCardId}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            Seleccionar Tarjeta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
