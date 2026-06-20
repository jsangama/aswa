export const PAYMENT_CHANNELS = {
  CASH: 'cash',
  WALLET: 'wallet',
  BANK: 'bank',
};

export const BANK_PAYMENT_METHODS = ['Interbank', 'BBVA', 'Banbif'];

export function formatSoles(amount = 0) {
  return 'S/ ' + Number(amount || 0).toFixed(2);
}

export function getPaymentChannel(method = '') {
  if (method === 'Efectivo') return PAYMENT_CHANNELS.CASH;
  if (BANK_PAYMENT_METHODS.includes(method)) return PAYMENT_CHANNELS.BANK;
  return PAYMENT_CHANNELS.WALLET;
}

export function getPaymentTotalCopy(method = '') {
  const channel = getPaymentChannel(method);

  if (channel === PAYMENT_CHANNELS.CASH) {
    return {
      label: 'Monto a pagar',
      help: 'Paga este total al recibir. Ingresa abajo con cuanto pagaras para calcular tu vuelto.',
    };
  }

  if (channel === PAYMENT_CHANNELS.BANK) {
    return {
      label: 'Monto a transferir',
      help: 'Transfiere exactamente este monto por banco y sube el comprobante.',
    };
  }

  return {
    label: 'Monto a pagar',
    help: 'Paga exactamente este monto por billetera y sube el comprobante.',
  };
}

export function calculateCashChange({ paid = 0, total = 0 } = {}) {
  return Math.max(0, Number(paid || 0) - Number(total || 0));
}

export function createPaymentMethodsService() {
  return {
    channels: PAYMENT_CHANNELS,
    bankMethods: BANK_PAYMENT_METHODS,
    calculateCashChange,
    formatSoles,
    getPaymentChannel,
    getPaymentTotalCopy,
  };
}
