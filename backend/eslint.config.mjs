import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config([
  {
    ignores: ["dist/**", "node_modules/**", "src/__tests__/**", "*.js"]
  },
  {
    extends: tseslint.configs.recommended,
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      "prettier/prettier": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none"
        }
      ],
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  prettierConfig
]);
