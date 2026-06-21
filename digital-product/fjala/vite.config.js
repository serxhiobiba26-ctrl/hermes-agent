import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configurazione minima: una sola pagina React.
export default defineConfig({
  plugins: [react()],
});
