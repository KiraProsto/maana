'use client';

import { createContext, useContext, useState } from 'react';

interface IDeliveryContextValue {
  deliveryCost: number;
  deliveryDays: string | null;
  deliveryLoading: boolean;
  setDelivery: (cost: number, days: string | null) => void;
  setDeliveryLoading: (loading: boolean) => void;
}

const DeliveryContext = createContext<IDeliveryContextValue | null>(null);

export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [deliveryDays, setDeliveryDays] = useState<string | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  const setDelivery = (cost: number, days: string | null) => {
    setDeliveryCost(cost);
    setDeliveryDays(days);
  };

  return (
    <DeliveryContext.Provider
      value={{ deliveryCost, deliveryDays, deliveryLoading, setDelivery, setDeliveryLoading }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error('useDelivery must be inside DeliveryProvider');
  return ctx;
}
