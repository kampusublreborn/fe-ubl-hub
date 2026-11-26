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
  ]),

  // Batas arsitektur Feature-Based.
  // 1. Fitur lain hanya boleh masuk lewat public API (@/features/<nama>), bukan file internal.
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["features/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/*", "**/features/*/*", "!@/features/tracer/client", "!@/features/logbook/client"],
              message:
                "Import fitur lewat public API-nya saja, mis. '@/features/auth', bukan file di dalamnya.",
            },
          ],
        },
      ],
    },
  },
  // 2. Di dalam fitur: lintas fitur lewat public API, dan fitur tidak boleh mengimpor app/.
  {
    files: ["features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/*", "!@/features/tracer/client", "!@/features/logbook/client"],
              message:
                "Import fitur lain lewat public API-nya (@/features/<nama>). Di dalam fitur sendiri pakai path relatif.",
            },
            {
              group: ["@/app/*", "**/app/**"],
              message: "Fitur tidak boleh bergantung pada app/. Dependensi mengalir dari app ke features.",
            },
          ],
        },
      ],
    },
  },
  // 3. shared tidak boleh bergantung pada fitur atau app.
  {
    files: ["shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features", "@/features/*", "@/app/*"],
              message: "shared tidak boleh mengimpor features atau app.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
