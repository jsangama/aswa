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
