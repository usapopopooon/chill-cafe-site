import { copyFileSync, existsSync, statSync } from "node:fs"
import { resolve } from "node:path"

const distDir = resolve(process.cwd(), "dist")
const indexPath = resolve(distDir, "index.html")
const fallbackPath = resolve(distDir, "404.html")

if (!existsSync(indexPath)) {
  throw new Error("dist/index.html was not found. Run vite build before preparing Pages output.")
}

copyFileSync(indexPath, fallbackPath)

if (!existsSync(fallbackPath) || statSync(fallbackPath).size === 0) {
  throw new Error("dist/404.html was not created for GitHub Pages SPA fallback.")
}

console.log("Created dist/404.html for GitHub Pages SPA fallback.")
