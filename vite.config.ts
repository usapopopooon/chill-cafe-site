import path from "node:path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

const isStorybook = process.env.STORYBOOK === "true"
const normalizeBase = (basePath?: string) => {
  const basePathValue = basePath?.trim() || "/"

  return basePathValue.endsWith("/") ? basePathValue : `${basePathValue}/`
}
const base = normalizeBase(process.env.BASE_PATH)
const assetPath = (asset: string) => `${base}${asset.replace(/^\/+/, "")}`

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    !isStorybook &&
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png"],
        manifest: {
          name: "Chillカフェ | Discord Server",
          short_name: "Chillカフェ",
          description: "雑談・作業・ゲーム・お酒、まったりいろんなチルをするためのサーバー。",
          theme_color: "#f6d8e8",
          background_color: "#fff4f8",
          display: "standalone",
          start_url: base,
          scope: base,
          lang: "ja-JP",
          categories: ["social", "entertainment"],
          icons: [
            {
              src: assetPath("pwa-192x192.png"),
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable"
            },
            {
              src: assetPath("pwa-512x512.png"),
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable"
            }
          ]
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,ico,json}"]
        }
      })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})
