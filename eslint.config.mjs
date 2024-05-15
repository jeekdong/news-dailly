import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'unused-imports/no-unused-vars': 'warn',
    'no-console': 'off',
    "@typescript-eslint/ban-ts-comment": "off",
  },
})
