import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";

// lamejs (dentro de mic-recorder-to-mp3) atribui variáveis globais sem
// declará-las (Lame, Presets, etc.). No strict mode do ESM isso causa
// "ReferenceError: Lame is not defined". Prefixamos as declarações.
const LAMEJS_GLOBALS =
  "var Lame,Presets,GainAnalysis,QuantizePVT,Quantize," +
  "Takehiro,Reservoir,MPEGMode,BitStream;\n";

const fixLamejsPlugin = () => ({
  name: "fix-lamejs-globals",
  // Corrige no build de produção (Rollup)
  transform(code, id) {
    if (
      id.includes("mic-recorder-to-mp3") &&
      code.includes("Lame_1")
    ) {
      return { code: LAMEJS_GLOBALS + code, map: null };
    }
    return null;
  },
});

// Plugin esbuild para corrigir no dev server (pre-bundling)
const fixLamejsEsbuild = {
  name: "fix-lamejs-globals",
  setup(build) {
    build.onLoad(
      { filter: /mic-recorder-to-mp3[\\/]dist[\\/]index\.js$/ },
      async (args) => {
        let contents = readFileSync(args.path, "utf8");
        return { contents: LAMEJS_GLOBALS + contents, loader: "js" };
      }
    );
  },
};

export default defineConfig({
  plugins: [
    fixLamejsPlugin(),
    {
      name: "treat-js-files-as-jsx",
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null;
        const { transform } = await import("esbuild");
        const result = await transform(code, { loader: "jsx" });
        return { code: result.code, map: null };
      },
    },
    react(),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 3500,
    open: true,
  },
  build: {
    outDir: "build",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
    },
  },
  envPrefix: "VITE_",
  optimizeDeps: {
    include: ["react", "react-dom"],
    esbuildOptions: {
      plugins: [fixLamejsEsbuild],
      loader: {
        ".js": "jsx",
      },
    },
  },
});
