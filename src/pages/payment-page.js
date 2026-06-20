import {
  calculateCashChange,
  formatSoles,
  getPaymentTotalCopy,
} from '../modules/payment-methods.js';
import {
  updateCashChangeText,
  updatePaymentTotalCard,
} from '../components/payment-total-card.js';

export function createPaymentPage({ document: doc = document } = {}) {
  function updateFromState(state = {}) {
    const total = Number(state.final || 0);
    const totalText = formatSoles(total);
    const copy = getPaymentTotalCopy(state.pago);

    updatePaymentTotalCard({
      document: doc,
      totalText,
      label: copy.label,
      help: copy.help,
    });

    updateCashChange({ total });
  }

  function updateCashChange({ total = 0 } = {}) {
    updateCashChangeText({
      document: doc,
      total,
      calculateChange: calculateCashChange,
      formatAmount: formatSoles,
    });
  }

  return {
    updateFromState,
    updateCashChange,
  };
}
