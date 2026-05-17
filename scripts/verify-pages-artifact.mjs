import { existsSync, readFileSync, statSync } from "node:fs"
import { resolve } from "node:path"

const distDir = resolve(process.cwd(), "dist")
const requiredFiles = ["index.html", "404.html", "CNAME"]

for (const file of requiredFiles) {
  const path = resolve(distDir, file)

  if (!existsSync(path) || statSync(path).size === 0) {
    throw new Error(`dist/${file} is required for GitHub Pages deployment.`)
  }
}

const indexHtml = readFileSync(resolve(distDir, "index.html"), "utf8")
const fallbackHtml = readFileSync(resolve(distDir, "404.html"), "utf8")

if (indexHtml !== fallbackHtml) {
  throw new Error("dist/404.html must match dist/index.html for direct SPA routes.")
}

console.log("GitHub Pages artifact includes index.html, 404.html, and CNAME.")
