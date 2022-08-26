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
        assetFileNames: `[name].[ext]`,
        chunkFileNames: `[name].[ext]`,
        entryFileNames: `[name].js`,
        manualChunks: undefined,
      },
    },
  },
  plugins: [
    windiCssPlugin({ config: { prefixer: false, preflight: false } }),
    solidPlugin(),
    {
      name: "built-timestamp-plugin",
      resolveId: (source) => (source === "built-timestamp" ? source : null),
      load: (id) => (id === "built-timestamp" ? `export default ${Date.now()}` : null),
    },
  ],
});
