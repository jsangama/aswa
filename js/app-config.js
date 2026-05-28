(function configureAswa(global) {
  const defaultConfig = {
    BUSINESS_ID: 'aswa001',
    BUSINESS_NAME: 'La Rica Chicha',
    ALLOW_LEGACY_LOCAL_ACCESS: false,
    STORAGE_MODE: 'whatsapp_manual',
    HORARIO: {
      activo: true,
      inicio: '07:00',
      fin: '17:30',
      mensaje: 'Volvemos en el siguiente horario de entrega',
      texto: '🕘 Horarios de entrega:<br>✨ Mañanas: 7:00 am – 2:00 pm<br>✨ Tardes: 2:00 pm – 5:30 pm<br>📅 Disponible de lunes a viernes<br>🗓️ Sábados: 7:00 am – 2:00 pm',
      lunesViernes: [
        { nombre: 'Mañanas', inicio: '07:00', fin: '14:00' },
        { nombre: 'Tardes', inicio: '14:00', fin: '17:30' },
      ],
      sabado: [
        { nombre: 'Sábados', inicio: '07:00', fin: '14:00' },
      ],
    },
    WHATSAPP: {
      pedidos1: '51955273229',
      pedidos2: '51986445531',
      yape: '51947999736',
    },
    FIREBASE: {
      apiKey: 'AIzaSyAsAIZEEuE4Ha3xCFgfn8hBTictVi4CTIk',
      authDomain: 'pedidos-aswa-peru.firebaseapp.com',
      projectId: 'pedidos-aswa-peru',
      storageBucket: 'pedidos-aswa-peru.appspot.com',
      messagingSenderId: '213964983594',
      appId: '1:213964983594:web:92d761a6e0cce9ddaa253',
    },
  };

  function mergeConfig(base, override) {
    return {
      ...base,
      ...override,
      FIREBASE: {
        ...(base.FIREBASE || {}),
        ...(override.FIREBASE || {}),
      },
      ADMIN_CREDENTIALS: {
        ...(base.ADMIN_CREDENTIALS || {}),
        ...(override.ADMIN_CREDENTIALS || {}),
      },
      OPERATOR_AUTH_EMAILS: {
        ...(base.OPERATOR_AUTH_EMAILS || {}),
        ...(override.OPERATOR_AUTH_EMAILS || {}),
      },
      HORARIO: {
        ...(base.HORARIO || {}),
        ...(override.HORARIO || {}),
      },
      WHATSAPP: {
        ...(base.WHATSAPP || {}),
        ...(override.WHATSAPP || {}),
      },
    };
  }

  global.ASWA_CONFIG = mergeConfig(defaultConfig, global.ASWA_CONFIG || {});
})(window);
