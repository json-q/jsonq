/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
module.exports = {
  $schema: 'https://json.schemastore.org/prettierrc.json',
  printWidth: 100,
  useTabs: false,
  singleQuote: true,
  proseWrap: 'never',
  plugins: ['prettier-plugin-tailwindcss'],
};
