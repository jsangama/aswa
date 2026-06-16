export const PURCHASE_STEPS = {
  PRODUCTS: 'products',
  DELIVERY: 'delivery',
  PAYMENT: 'payment',
  COMPLETE: 'complete',
};

const STEP_CLASS = {
  [PURCHASE_STEPS.PRODUCTS]: 'purchase-step-products',
  [PURCHASE_STEPS.DELIVERY]: 'purchase-step-delivery',
  [PURCHASE_STEPS.PAYMENT]: 'purchase-step-payment',
  [PURCHASE_STEPS.COMPLETE]: 'purchase-complete',
};

export function createPurchaseFlow({ document: doc = document } = {}) {
  const body = () => doc.body;

  function show(step = PURCHASE_STEPS.PRODUCTS) {
    const target = STEP_CLASS[step] || STEP_CLASS[PURCHASE_STEPS.PRODUCTS];
    body()?.classList.remove(...Object.values(STEP_CLASS), 'aswa-home-step1');
    body()?.classList.add(target);
    return target;
  }

  return {
    steps: PURCHASE_STEPS,
    show,
    current() {
      const found = Object.entries(STEP_CLASS).find(([, className]) => body()?.classList.contains(className));
      return found?.[0] || PURCHASE_STEPS.PRODUCTS;
    },
    isBuying() {
      return [PURCHASE_STEPS.PRODUCTS, PURCHASE_STEPS.DELIVERY, PURCHASE_STEPS.PAYMENT].includes(this.current());
    },
  };
}
