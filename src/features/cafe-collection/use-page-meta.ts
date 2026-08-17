import { useEffect } from "react"

const SITE_ORIGIN = "https://chill-cafe.site"
const DEFAULT_IMAGE = `${SITE_ORIGIN}/og-image.png`

interface PageMeta {
  title: string
  description: string
  canonicalPath: string
  imageUrl?: string
  imageAlt?: string
  imageType?: "image/jpeg" | "image/png"
  imageWidth?: number
  imageHeight?: number
  ogType?: "article" | "website"
}

interface ElementUpdate {
  element: Element
  attribute: string
  previousValue: string | null
  created: boolean
}

export function usePageMeta({
  title,
  description,
  canonicalPath,
  imageUrl = DEFAULT_IMAGE,
  imageAlt = "🍭CHILLカフェのアイキャッチ画像",
  imageType = "image/png",
  imageWidth = 1200,
  imageHeight = 630,
  ogType = "website"
}: PageMeta) {
  useEffect(() => {
    const canonicalUrl = `${SITE_ORIGIN}/${canonicalPath.replace(/^\/+|\/+$/g, "")}/`
    const previousTitle = document.title
    const updates: ElementUpdate[] = []

    document.title = title
    updateMeta("name", "description", description, updates)
    updateMeta("name", "robots", "noindex, nofollow, noarchive, nosnippet, noimageindex", updates)
    updateMeta(
      "name",
      "googlebot",
      "noindex, nofollow, noarchive, nosnippet, noimageindex",
      updates
    )
    updateLink("canonical", canonicalUrl, updates)
    updateLink("image_src", imageUrl, updates)
    updateMeta("property", "og:type", ogType, updates)
    updateMeta("property", "og:title", title, updates)
    updateMeta("property", "og:description", description, updates)
    updateMeta("property", "og:url", canonicalUrl, updates)
    updateMeta("property", "og:image", imageUrl, updates)
    updateMeta("property", "og:image:secure_url", imageUrl, updates)
    updateMeta("property", "og:image:type", imageType, updates)
    updateMeta("property", "og:image:width", String(imageWidth), updates)
    updateMeta("property", "og:image:height", String(imageHeight), updates)
    updateMeta("property", "og:image:alt", imageAlt, updates)
    updateMeta("name", "twitter:title", title, updates)
    updateMeta("name", "twitter:description", description, updates)
    updateMeta("name", "twitter:image", imageUrl, updates)
    updateMeta("name", "twitter:image:alt", imageAlt, updates)

    return () => {
      document.title = previousTitle
      for (const update of updates.reverse()) {
        if (update.created) {
          update.element.remove()
        } else if (update.previousValue === null) {
          update.element.removeAttribute(update.attribute)
        } else {
          update.element.setAttribute(update.attribute, update.previousValue)
        }
      }
    }
  }, [
    canonicalPath,
    description,
    imageAlt,
    imageHeight,
    imageType,
    imageUrl,
    imageWidth,
    ogType,
    title
  ])
}

function updateMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
  updates: ElementUpdate[]
) {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  const created = element === null
  if (!element) {
    element = document.createElement("meta")
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  updates.push({
    element,
    attribute: "content",
    previousValue: element.getAttribute("content"),
    created
  })
  element.content = content
}

function updateLink(rel: string, href: string, updates: ElementUpdate[]) {
  let element = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  const created = element === null
  if (!element) {
    element = document.createElement("link")
    element.rel = rel
    document.head.append(element)
  }
  updates.push({
    element,
    attribute: "href",
    previousValue: element.getAttribute("href"),
    created
  })
  element.href = href
}
