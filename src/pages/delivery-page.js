import {
  getAddressFieldState,
  isPickupZoneText,
  resolveOrderAddress,
} from '../modules/delivery-options.js';
import { updateDeliveryAddressField } from '../components/delivery-address-field.js';

export function createDeliveryPage({ document: doc = document } = {}) {
  function selectedZoneText() {
    const zone = doc.getElementById('zona');
    return zone?.options[zone.selectedIndex]?.text || '';
  }

  function isPickupSelected(zoneText = selectedZoneText()) {
    return isPickupZoneText(zoneText);
  }

  function orderAddressValue({
    zoneText = selectedZoneText(),
    address = doc.getElementById('direccion')?.value || '',
  } = {}) {
    return resolveOrderAddress({ zoneText, address });
  }

  function updateAddressField(zoneText = selectedZoneText()) {
    updateDeliveryAddressField({
      document: doc,
      state: getAddressFieldState({ zoneText }),
    });
  }

  return {
    isPickupSelected,
    orderAddressValue,
    selectedZoneText,
    updateAddressField,
  };
}
