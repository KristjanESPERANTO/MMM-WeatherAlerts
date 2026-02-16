import css from "@eslint/css";
import {defineConfig} from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import markdown from "@eslint/markdown";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
  {
    files: ["**/*.css"],
    plugins: {css},
    language: "css/css",
    extends: ["css/recommended"],
    rules: {
      "css/no-invalid-properties": "off"
    }
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.node,
        config: "readonly",
        Log: "readonly",
        Module: "readonly",
        moment: "readonly",
        WeatherAlertObject: "writable",
        WeatherAPIProvider: "writable",
        OpenWeatherMapProvider: "writable"
      }
    },
    plugins: {js},
    extends: ["js/all", stylistic.configs.all],
    rules: {
      "@stylistic/array-element-newline": ["error", "consistent"],
      "@stylistic/dot-location": ["error", "property"],
      "@stylistic/function-call-argument-newline": ["error", "consistent"],
      "@stylistic/indent": ["error", 2],
      "@stylistic/no-extra-parens": "off",
      "@stylistic/object-property-newline": [
        "error",
        {allowAllPropertiesOnSameLine: true}
      ],
      "@stylistic/padded-blocks": ["error", "never"],
      "@stylistic/quote-props": ["error", "as-needed"],
      "capitalized-comments": "off",
      "class-methods-use-this": "off",
      "id-length": ["error", {min: 2, exceptions: ["a", "i", "x", "y", "z"]}],
      "init-declarations": "off",
      "max-lines": ["error", 400],
      "max-lines-per-function": ["error", 100],
      "max-params": ["error", 4],
      "max-statements": ["error", 50],
      "no-inline-comments": "off",
      "no-magic-numbers": "off",
      "no-ternary": "off",
      "no-undefined": "off",
      "no-unused-vars": [
        "error",
        {vars: "all", args: "none", caughtErrors: "none"}
      ],
      "one-var": ["error", "never"],
      "prefer-named-capture-group": "off",
      "require-unicode-regexp": "off",
      "sort-keys": "off"
    }
  },
  {files: ["demo.config.js"], rules: {"prefer-const": "off"}},
  {
    files: ["**/*.md"],
    plugins: {markdown},
    language: "markdown/gfm",
    extends: ["markdown/recommended"]
  }
]);
