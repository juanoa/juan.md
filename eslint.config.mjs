import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "**/.astro/**",
      "**/.idea/**",
      "**/.next/**",
      "**/.pnpm-store/**",
      "**/.turbo/**",
      "**/.vercel/**",
      "**/build/**",
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/public/**",
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...react.configs.flat.recommended,
    files: ["**/*.{jsx,tsx}"],
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ...react.configs.flat["jsx-runtime"],
    files: ["**/*.{jsx,tsx}"],
  },
  {
    ...reactHooks.configs.flat.recommended,
    files: ["**/*.{jsx,tsx}"],
  },
  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "react/prop-types": "off",
    },
  },
  {
    files: ["apps/*/**/*.{astro,js,mjs,cjs,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["packages/ui/src/**", "**/packages/ui/src/**"],
              message:
                "Import shared UI through @juan/ui/* instead of packages/ui/src/*.",
            },
          ],
        },
      ],
    },
  },
  ...astro.configs["flat/recommended"],
];
