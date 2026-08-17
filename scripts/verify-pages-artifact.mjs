import { existsSync, readFileSync, statSync } from "node:fs"
import { resolve } from "node:path"

const SITE_ORIGIN = "https://chill-cafe.site"
const distDir = resolve(process.cwd(), "dist")
const cards = JSON.parse(
  readFileSync(resolve(process.cwd(), "scripts/cafe-card-pages.json"), "utf8")
)
const directRoutes = [
  "cafe-collection",
  "cafe-collection/rankings",
  ...cards.map((card) => `cafe-collection/cards/${card.key}`)
]
const requiredFiles = [
  "index.html",
  "404.html",
  "CNAME",
  "robots.txt",
  "sitemap.xml",
  ...directRoutes.map((route) => `${route}/index.html`)
]

for (const file of requiredFiles) {
  const path = resolve(distDir, file)

  if (!existsSync(path) || statSync(path).size === 0) {
    throw new Error(`dist/${file} is required for GitHub Pages deployment.`)
  }
}

const indexHtml = readFileSync(resolve(distDir, "index.html"), "utf8")
const fallbackHtml = readFileSync(resolve(distDir, "404.html"), "utf8")

if (indexHtml !== fallbackHtml) {
  throw new Error("dist/404.html must match dist/index.html for unknown SPA routes.")
}

for (const route of directRoutes) {
  const html = readFileSync(resolve(distDir, route, "index.html"), "utf8")
  const canonicalUrl = `${SITE_ORIGIN}/${route}/`
  if (!html.includes(`<link rel="canonical" href="${canonicalUrl}" />`)) {
    throw new Error(`dist/${route}/index.html has an incorrect canonical URL.`)
  }
  if (!html.includes(`<meta property="og:url" content="${canonicalUrl}" />`)) {
    throw new Error(`dist/${route}/index.html has an incorrect Open Graph URL.`)
  }
  for (const crawler of ["robots", "googlebot"]) {
    if (
      !html.includes(
        `<meta name="${crawler}" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />`
      )
    ) {
      throw new Error(`dist/${route}/index.html does not block ${crawler}.`)
    }
  }
}

const sitemap = readFileSync(resolve(distDir, "sitemap.xml"), "utf8")
for (const route of directRoutes) {
  if (sitemap.includes(`<loc>${SITE_ORIGIN}/${route}/</loc>`)) {
    throw new Error(`dist/sitemap.xml must not list crawler-blocked route ${route}.`)
  }
}

const robots = readFileSync(resolve(distDir, "robots.txt"), "utf8")
if (!robots.includes("Disallow: /cafe-collection")) {
  throw new Error("dist/robots.txt must disallow every cafe collection route.")
}

console.log(
  `GitHub Pages artifact includes ${directRoutes.length} noindex direct routes and crawler rules.`
)
