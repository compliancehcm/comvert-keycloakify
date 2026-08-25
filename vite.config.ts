import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        keycloakify({
            // "Single-Page" = Account Console v3 (o SPA React moderno).
            // Deliberadamente NÃO "Multi-Page": o account v1 faz o Keycloakify
            // gerar um JAR por versão do Keycloak (21-and-below, 23, 24, 25,
            // 26.0-to-26.1, 26.2-and-above) em vez dos dois atuais, e o
            // keycloak-theme-for-kc-all-other-versions.jar usado no deploy
            // deixaria de existir.
            accountThemeImplementation: "Single-Page"
        })
    ]
});
