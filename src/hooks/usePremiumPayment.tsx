import { useState } from 'react';

const PREMIUM_PRICE = 1600; // ₦1,600 one-time payment

export function usePremiumPayment() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openPaymentDialog = () => {
    setDialogOpen(true);
  };

  const closePaymentDialog = () => {
    setDialogOpen(false);
  };

  return {
    openPaymentDialog,
    closePaymentDialog,
    dialogOpen,
    setDialogOpen,
    premiumPrice: PREMIUM_PRICE,
  };
}
