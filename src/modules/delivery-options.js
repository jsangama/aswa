export const PICKUP_ADDRESS_VALUE = 'Recojo en local';

export function isPickupZoneText(zoneText = '') {
  return /recojo/i.test(String(zoneText || ''));
}

export function resolveOrderAddress({ zoneText = '', address = '' } = {}) {
  const cleanAddress = String(address || '').trim();
  return isPickupZoneText(zoneText) && !cleanAddress ? PICKUP_ADDRESS_VALUE : cleanAddress;
}

export function getAddressFieldState({ zoneText = '' } = {}) {
  const isPickup = isPickupZoneText(zoneText);

  return {
    isPickup,
    required: !isPickup,
    label: isPickup ? 'Referencia para recojo (opcional)' : 'Direccion de entrega',
    placeholder: isPickup
      ? 'Opcional: nombre de quien recoge o referencia'
      : 'Calle, numero, referencia',
    help: isPickup
      ? 'Para recojo no pedimos direccion. Guardaremos el cliente con celular y nombre; el pedido queda como Recojo en local.'
      : 'No aparece tu direccion? Puedes escribirla manualmente.',
  };
}

export function createDeliveryOptionsService() {
  return {
    getAddressFieldState,
    isPickupZoneText,
    resolveOrderAddress,
  };
}
