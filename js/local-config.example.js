window.ASWA_CONFIG = {
  ...(window.ASWA_CONFIG || {}),
  // Solo para pruebas en localhost. En GitHub Pages/produccion debe quedar false.
  ALLOW_LEGACY_LOCAL_ACCESS: true,
  ADMIN_PIN: '1234',
  DELIVERY_PIN: '1234',
  ADMIN_CREDENTIALS: {
    admin: 'change-me',
    delivery: 'change-me-too',
  },
  OPERATOR_AUTH_EMAILS: {
    owner: 'owner@example.com',
    admin: 'admin@example.com',
    delivery: 'delivery@example.com',
  },
};
