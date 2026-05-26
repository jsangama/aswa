(function configureAswa(global) {
  const defaultConfig = {
    BUSINESS_ID: 'aswa001',
    BUSINESS_NAME: 'La Rica Chicha',
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
    };
  }

  global.ASWA_CONFIG = mergeConfig(defaultConfig, global.ASWA_CONFIG || {});
})(window);
