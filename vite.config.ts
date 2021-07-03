import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import windiCssPlugin from "vite-plugin-windicss";

export default defineConfig({
  base: "",
  build: {
    outDir: "docs",
    assetsDir: "",
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  plugins: [windiCssPlugin({ config: { prefixer: false, preflight: false } }), solidPlugin()],
});
