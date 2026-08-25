import typescriptEslint from "typescript-eslint";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import js from "@eslint/js";
import storybook from "eslint-plugin-storybook";

export default typescriptEslint.config(
    js.configs.recommended,
    ...typescriptEslint.configs.recommended,
    react.configs.flat.recommended,
    react.configs.flat["jsx-runtime"],
    eslintConfigPrettier,
    ...storybook.configs["flat/recommended"],
    {
        // tema_compliancehcm/ é a pasta-fonte do design (canvas do Claude Design).
        // support.js e _ds/_ds_bundle.js são runtime do editor, não código deste tema:
        // ficam no repo como referência e nunca são empacotados.
        ignores: [
            "dist/**",
            "public/**",
            "dist_keycloak/**",
            "storybook-static/**",
            "tema_compliancehcm/**"
        ]
    },
    {
        plugins: {
            "react-refresh": reactRefresh,
            "react-hooks": reactHooks
        },
        languageOptions: {
            globals: {
                ...globals.browser
            }
        },
        settings: {
            react: {
                version: "detect"
            }
        },
        rules: {
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true }
            ],
            "react-hooks/exhaustive-deps": "off",
            "@typescript-eslint/no-redeclare": "off",
            "no-labels": "off"
        }
    },
    {
        files: ["**/*.stories.*"],
        rules: {
            "import/no-anonymous-default-export": "off"
        }
    }
);
