import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default tseslint.config([
  {
    ignores: ["dist/**", "node_modules/**", "src/__tests__/**"]
  },
  {
    extends: tseslint.configs.recommended,
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      "prettier/prettier": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  prettierConfig
]);
