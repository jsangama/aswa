/**
 * Deprecated compatibility wrapper.
 *
 * New code should read configuration from window.ASWA_CONFIG, which can be
 * populated by js/app-config.js.
 */

const firebaseConfig = window.ASWA_CONFIG?.FIREBASE || {};

export default firebaseConfig;
