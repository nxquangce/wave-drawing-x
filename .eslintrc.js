module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-empty': 'warn',
    'no-empty-function': 'warn',
    "@typescript-eslint/no-empty-function": ["warn"],
    'prefer-const': 'warn',
    '@typescript-eslint/no-inferrable-types': 'off'
  }
}
