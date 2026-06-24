export function updateDeliveryAddressField({
  document: doc = document,
  inputId = 'direccion',
  helpId = 'direccionPedidoHelp',
  state = {},
} = {}) {
  const input = doc.getElementById(inputId);
  const label = input?.closest('.fld')?.querySelector('label');
  const help = doc.getElementById(helpId);

  if (label) label.textContent = state.label || 'Direccion de entrega';

  if (input) {
    input.required = Boolean(state.required);
    input.placeholder = state.placeholder || 'Calle, numero, referencia';
  }

  if (help) {
    help.textContent = state.help || 'No aparece tu direccion? Puedes escribirla manualmente.';
  }
}

export function updateNationalShippingNotice({
  document: doc = document,
  noticeId = 'nationalShippingNotice',
  selected = false,
  notice = {},
} = {}) {
  const box = doc.getElementById(noticeId);
  if (!box) return;

  box.style.display = selected ? 'block' : 'none';
  box.setAttribute('aria-hidden', selected ? 'false' : 'true');

  const title = box.querySelector('[data-national-title]');
  const summary = box.querySelector('[data-national-summary]');
  const list = box.querySelector('[data-national-conditions]');

  if (title && notice.title) title.textContent = notice.title;
  if (summary && notice.summary) summary.textContent = notice.summary;
  if (list && Array.isArray(notice.conditions)) {
    list.innerHTML = notice.conditions.map((item) => `<li>${item}</li>`).join('');
  }
}
