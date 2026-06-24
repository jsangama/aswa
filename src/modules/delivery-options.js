export const PICKUP_ADDRESS_VALUE = 'Recojo en local';
export const NATIONAL_AGENCY_FEE = 10;

export const NATIONAL_SHIPPING_CONDITIONS = [
  'ASWA cobra S/ 10.00 por llevar tu pedido hasta una agencia de transporte.',
  'El flete desde la agencia hasta tu ciudad no esta incluido; lo pagas directamente al recoger.',
  'Coordinaremos por WhatsApp la agencia disponible, datos del destinatario y horario de entrega.',
  'El pedido nacional se prepara y envia solo despues de confirmar el pago.',
];

export function isPickupZoneText(zoneText = '') {
  return /recojo/i.test(String(zoneText || ''));
}

export function isNationalZoneText(zoneText = '') {
  return /(nacional|agencia)/i.test(String(zoneText || ''));
}

export function resolveOrderAddress({ zoneText = '', address = '' } = {}) {
  const cleanAddress = String(address || '').trim();
  return isPickupZoneText(zoneText) && !cleanAddress ? PICKUP_ADDRESS_VALUE : cleanAddress;
}

export function getAddressFieldState({ zoneText = '' } = {}) {
  const isPickup = isPickupZoneText(zoneText);
  const isNational = isNationalZoneText(zoneText);

  return {
    isPickup,
    isNational,
    required: !isPickup,
    label: isPickup
      ? 'Referencia para recojo (opcional)'
      : (isNational ? 'Ciudad, agencia y datos de envio nacional' : 'Direccion de entrega'),
    placeholder: isPickup
      ? 'Opcional: nombre de quien recoge o referencia'
      : (isNational ? 'Ciudad, agencia preferida, DNI y nombre de quien recoge' : 'Calle, numero, referencia'),
    help: isPickup
      ? 'Para recojo no pedimos direccion. Guardaremos el cliente con celular y nombre; el pedido queda como Recojo en local.'
      : (isNational
          ? 'Para envio nacional escribe ciudad, agencia preferida y datos de quien recogera. El flete destino se paga en agencia.'
          : 'No aparece tu direccion? Puedes escribirla manualmente.'),
  };
}

export function getNationalShippingNotice({ selected = false } = {}) {
  return {
    selected,
    title: 'Condiciones para envio nacional',
    fee: NATIONAL_AGENCY_FEE,
    summary: 'S/ 10.00 cubre solo el traslado de ASWA hasta la agencia en Tarapoto.',
    conditions: [...NATIONAL_SHIPPING_CONDITIONS],
  };
}

export function createDeliveryOptionsService() {
  return {
    getAddressFieldState,
    getNationalShippingNotice,
    isNationalZoneText,
    isPickupZoneText,
    resolveOrderAddress,
  };
}
