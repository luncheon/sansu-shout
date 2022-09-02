import isaaccssPlugin from "isaaccss/vite";
import openProps from "open-props";
import postcssJitProps from "postcss-jit-props";
import solidPlugin from "vite-plugin-solid";

/** @type {import("vite").UserConfig} */
export default {
  clearScreen: false,
  base: "",
  build: {
    outDir: "docs",
    assetsDir: "",
    rollupOptions: {
      output: {
        assetFileNames: "[name].[ext]",
        chunkFileNames: "[name].[ext]",
        entryFileNames: "[name].js",
        manualChunks: undefined,
      },
    },
  },
  plugins: [
    isaaccssPlugin({ postcss: { plugins: [postcssJitProps(openProps)] } }),
    solidPlugin(),
    {
      name: "built-timestamp-plugin",
      resolveId: (source) => (source === "built-timestamp" ? source : null),
      load: (id) => (id === "built-timestamp" ? `export default ${Date.now()}` : null),
    },
  ],
};
