import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
    { ignores: ["node_modules", "dist", ".agent-office"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: globals.node,
            // Type information for the promise rules below
            parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
        },
        // ponytail: keep v5-era severity; these were warnings before the eslint 10 bump
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-unused-expressions": "warn",
            // An unawaited promise without .catch() is how errors used to vanish (interaction replies, role updates)
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { arguments: false } }],
        },
    },
    // node:test registers test() calls on its own; awaiting them at top level is not the convention
    { files: ["**/*.test.ts"], rules: { "@typescript-eslint/no-floating-promises": "off" } },
    // Config files are not part of the TypeScript project
    { files: ["**/*.mjs"], ...tseslint.configs.disableTypeChecked },
);
