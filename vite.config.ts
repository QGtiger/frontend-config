import { defineConfig, type Plugin } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import babel from "@rolldown/plugin-babel";
import path from "node:path";

function defineAppConfig() {
  return {
    BASE_URL: "http://localhost:3000",
  };
}

/** 仅本地 dev（vite serve）时在 HTML 最前注入，先于应用脚本执行 */
function injectRouterAppConfigDev(): Plugin {
  return {
    name: "inject-router-app-config-dev",
    transformIndexHtml(html, ctx) {
      if (!ctx.server) {
        return html;
      }
      return html.replace(
        /<head(\s[^>]*)?>/i,
        `<head$1><script>window.__ROUTER_APP_CONFIG__=${JSON.stringify(
          defineAppConfig()
        )}</script>`
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      injectRouterAppConfigDev(),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
