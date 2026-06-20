function setText(doc, id, text) {
  const el = doc.getElementById(id);
  if (el) el.textContent = text;
}

export function updatePaymentTotalCard({
  document: doc = document,
  totalText = 'S/ 0.00',
  label = 'Monto a pagar',
  help = '',
} = {}) {
  setText(doc, 'pagoTotalMonto', totalText);
  setText(doc, 'payboxMonto', totalText);
  setText(doc, 'efectivoTotalMonto', totalText);
  setText(doc, 'payboxMontoLabel', label);

  const helpEl = doc.getElementById('pagoTotalHelp');
  if (helpEl && help) helpEl.textContent = help;

  const pagoCon = doc.getElementById('pagoCon');
  if (pagoCon) {
    pagoCon.placeholder = totalText !== 'S/ 0.00' ? totalText : 'S/ 0.00';
    pagoCon.min = totalText.replace('S/ ', '');
  }
}

export function updateCashChangeText({
  document: doc = document,
  total = 0,
  calculateChange,
  formatAmount,
} = {}) {
  const input = doc.getElementById('pagoCon');
  const paid = Number(input?.value || 0);
  const change = calculateChange({ paid, total });
  setText(doc, 'vmsg', 'Vuelto: ' + formatAmount(change));
}
