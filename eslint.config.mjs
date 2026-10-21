import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [".next/**", "out/**", ".wrangler/**", "node_modules/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
];

export default config;
