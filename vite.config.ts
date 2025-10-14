import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    // Sentry plugin para upload de source maps (apenas em produção)
    mode === "production" && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/**',
        ignore: ['node_modules'],
        filesToDeleteAfterUpload: ['./dist/**/*.map'],
      },
      telemetry: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increase chunk size warning limit (nossa app é grande)
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // Manual chunks simplificado - evita quebrar React em múltiplos chunks
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Recharts (biblioteca pesada - separar)
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            
            // Todas as outras libs juntas (evita problemas de createContext)
            return 'vendor';
          }
        },
      },
    },
    
    // Minificação
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Remove console.log em produção
        drop_debugger: mode === 'production',
      },
    },
    
    // Source maps para Sentry (produção) e debugging (dev)
    sourcemap: true,
  },
}));
