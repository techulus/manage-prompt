import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    output: [
      { file: "dist/index.mjs", format: "es" },
      { file: "dist/index.cjs", format: "cjs" },
    ],
    plugins: [typescript()],
    external: ["@ai-sdk/provider"],
  },
  {
    input: "src/index.ts",
    output: { file: "dist/index.d.ts", format: "es" },
    plugins: [dts()],
    external: ["@ai-sdk/provider"],
  },
];
