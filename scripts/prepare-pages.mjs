import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

const SITE_ORIGIN = "https://chill-cafe.site"
const API_ORIGIN = "https://level-bot-api.chill-cafe.site"
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`
const distDir = resolve(process.cwd(), "dist")
const indexPath = resolve(distDir, "index.html")
const fallbackPath = resolve(distDir, "404.html")
const cardManifestPath = resolve(process.cwd(), "scripts/cafe-card-pages.json")

// API未デプロイ時も再現可能なビルドにするため、既知のカードの公開用メタ情報は
// チェックイン済みmanifestを使う。新しいカードはSPAの404フォールバックから
// level-bot APIを読み込めるため、manifestの件数はサイト表示を制限しない。

if (!existsSync(indexPath)) {
  throw new Error("dist/index.html was not found. Run vite build before preparing Pages output.")
}

const baseHtml = readFileSync(indexPath, "utf8")
const cards = JSON.parse(readFileSync(cardManifestPath, "utf8"))

if (!Array.isArray(cards) || cards.length === 0) {
  throw new Error("scripts/cafe-card-pages.json must contain at least one cafe card.")
}

const seenCardKeys = new Set()
for (const card of cards) {
  if (
    typeof card?.key !== "string" ||
    !/^[a-z0-9-]+$/.test(card.key) ||
    typeof card.name !== "string" ||
    typeof card.description !== "string"
  ) {
    throw new Error("Every cafe card page requires a safe key, name, and description.")
  }
  if (seenCardKeys.has(card.key)) {
    throw new Error(`Duplicate cafe card page key: ${card.key}`)
  }
  seenCardKeys.add(card.key)
}

const pageDefinitions = [
  {
    path: "cafe-collection",
    title: "カフェ・コレクション図鑑 | CHILLカフェ",
    description:
      "CHILLカフェで集められるカード図鑑。歴史的な飲み物や食べ物、喫茶店の名品を紹介します。"
  },
  {
    path: "cafe-collection/rankings",
    title: "カフェ・コレクションランキング | CHILLカフェ",
    description:
      "図鑑・熟練度・専門棚など、カフェ・コレクション全9部門のランキングを公開しています。"
  },
  {
    path: "cafe-collection/profile",
    title: "個人コレクション | CHILLカフェ",
    description: "ランキング参加者のカフェ・コレクションと熟練度を確認できます。"
  },
  ...cards.map((card) => ({
    path: `cafe-collection/cards/${card.key}`,
    title: `${card.name} | カフェ・コレクション`,
    description: card.description,
    image: `${API_ORIGIN}/api/v1/public/cafe-collection/cards/${card.key}/image`,
    imageType: "image/jpeg",
    imageWidth: "768",
    imageHeight: "768",
    imageAlt: `${card.name}のカフェ・コレクションカード`,
    ogType: "article"
  }))
]

for (const page of pageDefinitions) {
  const outputPath = resolve(distDir, page.path, "index.html")
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, renderPageHtml(baseHtml, page))
}

copyFileSync(indexPath, fallbackPath)
writeFileSync(resolve(distDir, "sitemap.xml"), renderSitemap())

if (!existsSync(fallbackPath) || statSync(fallbackPath).size === 0) {
  throw new Error("dist/404.html was not created for GitHub Pages SPA fallback.")
}

console.log(`Created ${pageDefinitions.length} direct-route HTML files, sitemap.xml, and 404.html.`)

function renderPageHtml(html, page) {
  const canonicalUrl = `${SITE_ORIGIN}/${page.path}/`
  const image = page.image ?? DEFAULT_OG_IMAGE
  const imageType = page.imageType ?? "image/png"
  const imageWidth = page.imageWidth ?? "1200"
  const imageHeight = page.imageHeight ?? "630"
  const imageAlt = page.imageAlt ?? "🍭CHILLカフェのアイキャッチ画像"
  const ogType = page.ogType ?? "website"

  let result = replaceRequired(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(page.title)}</title>`,
    "title"
  )
  result = replaceMeta(result, "name", "description", page.description)
  result = replaceMeta(
    result,
    "name",
    "robots",
    "noindex, nofollow, noarchive, nosnippet, noimageindex"
  )
  result = replaceMeta(
    result,
    "name",
    "googlebot",
    "noindex, nofollow, noarchive, nosnippet, noimageindex"
  )
  result = replaceLink(result, "canonical", canonicalUrl)
  result = replaceLink(result, "image_src", image)
  result = replaceMeta(result, "property", "og:type", ogType)
  result = replaceMeta(result, "property", "og:title", page.title)
  result = replaceMeta(result, "property", "og:description", page.description)
  result = replaceMeta(result, "property", "og:url", canonicalUrl)
  result = replaceMeta(result, "property", "og:image", image)
  result = replaceMeta(result, "property", "og:image:secure_url", image)
  result = replaceMeta(result, "property", "og:image:type", imageType)
  result = replaceMeta(result, "property", "og:image:width", imageWidth)
  result = replaceMeta(result, "property", "og:image:height", imageHeight)
  result = replaceMeta(result, "property", "og:image:alt", imageAlt)
  result = replaceMeta(result, "name", "twitter:title", page.title)
  result = replaceMeta(result, "name", "twitter:description", page.description)
  result = replaceMeta(result, "name", "twitter:image", image)
  result = replaceMeta(result, "name", "twitter:image:alt", imageAlt)
  return result
}

function replaceMeta(html, attribute, key, content) {
  const pattern = new RegExp(
    `<meta\\s+${attribute}="${escapeRegExp(key)}"\\s+content="[^"]*"\\s*\\/?>`
  )
  return replaceRequired(
    html,
    pattern,
    `<meta ${attribute}="${escapeAttribute(key)}" content="${escapeAttribute(content)}" />`,
    `${attribute}=${key}`
  )
}

function replaceLink(html, rel, href) {
  const pattern = new RegExp(`<link\\s+rel="${escapeRegExp(rel)}"\\s+href="[^"]*"\\s*\\/?>`)
  return replaceRequired(
    html,
    pattern,
    `<link rel="${escapeAttribute(rel)}" href="${escapeAttribute(href)}" />`,
    `link rel=${rel}`
  )
}

function replaceRequired(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`Could not find ${label} in dist/index.html.`)
  }
  return html.replace(pattern, replacement)
}

function renderSitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(`${SITE_ORIGIN}/`)}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
}

function escapeHtml(value) {
  return escapeAttribute(value).replaceAll("'", "&#39;")
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function escapeXml(value) {
  return escapeAttribute(value).replaceAll("'", "&apos;")
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
