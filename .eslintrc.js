module.exports = {
  extends: ['@nuxtjs/eslint-config', '@nuxtjs/eslint-config-typescript', 'eslint-config-prettier'],
  rules: {
    'no-console': [
      'warn',
      {
        allow: ['info', 'warn', 'error'],
      },
    ],
    'vue/multi-word-component-names': 0,
  },
};
