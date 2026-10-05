import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
    { ignores: ["node_modules", "dist", ".agent-office"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: { globals: globals.node },
        // ponytail: keep v5-era severity; these were warnings before the eslint 10 bump
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-unused-expressions": "warn",
        },
    },
);
