import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
        // Manual chunks para otimizar bundle splitting
        manualChunks: (id) => {
          // Vendor chunks - bibliotecas grandes separadas
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            
            // Recharts (library pesada)
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            
            // Date utilities
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            
            // UI components (shadcn/ui é grande)
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            
            // Outras libs pequenas juntas
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
    
    // Source maps apenas em desenvolvimento
    sourcemap: mode === 'development',
  },
}));
