"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerCardsDisplay } from '@/components/customer-search/customer-cards-display';
import type { CustomerDetail } from '@/lib/types/customer';
import { getCustomerById } from '@/lib/actions/customer-detail';
import { getCustomerCards, type CustomerCardData } from '@/lib/actions/cards';
import { WorkflowNavigation } from '@/components/workflow';

export default function CustomerCardsPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [cards, setCards] = useState<CustomerCardData[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!customerId) {
      router.push('/customer-search');
      return;
    }

    // Load customer data and cards
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Load customer details
        const customerData = await getCustomerById(customerId);
        
        if (!customerData) {
          setError('Cliente no encontrado');
          setIsLoading(false);
          return;
        }
        
        setCustomer(customerData);
        
        // Load customer cards
        try {
          const cardsData = await getCustomerCards(customerId);
          setCards(cardsData);
          
          if (cardsData.length === 0) {
            // No cards scenario is handled by the component
            console.log('Customer has no cards');
          }
        } catch (cardError) {
          console.error('Error loading cards:', cardError);
          setError('No se pudieron cargar las Tarjetas');
        }
      } catch (err) {
        setError('Error al cargar la información del cliente.');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [customerId, router]);

  const handleCardSelect = (cardId: string) => {
    setSelectedCardId(cardId);
  };

  const handleAccept = () => {
    if (!selectedCardId) {
      return;
    }
    
    const selectedCard = cards.find(card => card.id === selectedCardId);
    if (selectedCard) {
      // Navigate to payment processing (to be implemented in later tasks)
      console.log('Card selected:', selectedCard);
      // For now, show success message
      alert(`Tarjeta seleccionada: ${selectedCard.cardType} terminada en ${selectedCard.lastFourDigits}`);
    }
  };

  const handleReturn = () => {
    router.push(`/customer-detail/${customerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching prototype */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                C
              </div>
              <span className="text-xl font-semibold">Caja Corporativa</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Page Title - matching prototype */}
        <div className="mb-6">
          <h1 className="text-2xl font-normal text-gray-900">Pago de tarjeta</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Customer Data - matching prototype */}
          <div>
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-normal mb-4">Datos del cliente</h2>
                
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : customer ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Nombre completo</p>
                        <p className="text-sm text-gray-900">
                          {`${customer.firstName} ${customer.secondLastName || ''} ${customer.lastName}`.trim()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Estado</p>
                        <p className="text-sm text-gray-900">{customer.addresses[0]?.stateName || '-'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Número de cliente</p>
                        <p className="text-sm text-blue-600 hover:underline cursor-pointer">
                          {customer.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Municipio</p>
                        <p className="text-sm text-gray-900">{customer.addresses[0]?.municipalityName || '-'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Fecha de nac.</p>
                        <p className="text-sm text-gray-900">-</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Dirección</p>
                        <p className="text-sm text-gray-900">{customer.addresses[0]?.street || '-'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">RFC</p>
                        <p className="text-sm text-gray-900">{customer.governmentIds.find(id => id.type === 'RFC')?.number || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Teléfono casa</p>
                        <p className="text-sm text-gray-900">{customer.phones.find(p => p.type === 'home')?.number || '-'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div></div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Teléfono oficina</p>
                        <p className="text-sm text-gray-900">{customer.phones.find(p => p.type === 'office')?.number || '0'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No se pudo cargar la información del cliente.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Card Selection - matching prototype */}
          <div>
            <CustomerCardsDisplay
              cards={cards}
              selectedCardId={selectedCardId}
              onCardSelect={handleCardSelect}
              onAccept={handleAccept}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <WorkflowNavigation
          showReturn
          returnLabel="Regresar"
          onReturn={handleReturn}
          showAccept
          acceptLabel="Seleccionar Tarjeta"
          onAccept={handleAccept}
          acceptDisabled={!selectedCardId}
          className="mt-6"
        />
      </div>
    </div>
  );
}
