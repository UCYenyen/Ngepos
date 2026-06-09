import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Designer reference mockups, not application source:
    "design_handoff_ngepos/**",
    // Deno edge functions are linted/typed separately, not by the Next config:
    "supabase/functions/**",
  ]),
]);

export default eslintConfig;
