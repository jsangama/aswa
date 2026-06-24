import {
  getAddressFieldState,
  getNationalShippingNotice,
  isPickupZoneText,
  isNationalZoneText,
  resolveOrderAddress,
} from '../modules/delivery-options.js';
import {
  updateDeliveryAddressField,
  updateNationalShippingNotice,
} from '../components/delivery-address-field.js';

export function createDeliveryPage({ document: doc = document } = {}) {
  function selectedZoneText() {
    const zone = doc.getElementById('zona');
    return zone?.options[zone.selectedIndex]?.text || '';
  }

  function isPickupSelected(zoneText = selectedZoneText()) {
    return isPickupZoneText(zoneText);
  }

  function isNationalSelected(zoneText = selectedZoneText()) {
    return isNationalZoneText(zoneText);
  }

  function orderAddressValue({
    zoneText = selectedZoneText(),
    address = doc.getElementById('direccion')?.value || '',
  } = {}) {
    return resolveOrderAddress({ zoneText, address });
  }

  function updateAddressField(zoneText = selectedZoneText()) {
    const nationalSelected = isNationalSelected(zoneText);
    updateDeliveryAddressField({
      document: doc,
      state: getAddressFieldState({ zoneText }),
    });
    updateNationalShippingNotice({
      document: doc,
      selected: nationalSelected,
      notice: getNationalShippingNotice({ selected: nationalSelected }),
    });
  }

  return {
    isNationalSelected,
    isPickupSelected,
    orderAddressValue,
    selectedZoneText,
    updateAddressField,
  };
}
