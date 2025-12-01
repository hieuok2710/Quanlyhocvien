import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Tăng giới hạn cảnh báo dung lượng chunk lên 3000kB (3MB)
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        // Tự động tách các thư viện (node_modules) thành chunk riêng (vendor)
        // Giúp trình duyệt cache tốt hơn và giảm thời gian tải ban đầu
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});