import type {
  CafeCatalog,
  CafeCollectionProfile,
  CafeLeaderboards
} from "@/features/cafe-collection/types"

export const CHILL_CAFE_GUILD_ID = "1168847276291137586"

const DEFAULT_API_ORIGIN = "https://level-bot-api.chill-cafe.site"
const API_ORIGIN = (import.meta.env.VITE_LEVEL_BOT_API_ORIGIN || DEFAULT_API_ORIGIN).replace(
  /\/$/,
  ""
)
const PUBLIC_CAFE_PATH = "/api/v1/public/cafe-collection"

export class PublicCafeApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = "PublicCafeApiError"
  }
}

async function fetchPublicCafeApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_ORIGIN}${PUBLIC_CAFE_PATH}${path}`, {
    headers: { Accept: "application/json" },
    credentials: "omit"
  })

  if (!response.ok) {
    throw new PublicCafeApiError(response.status, "公開データを読み込めませんでした。")
  }

  return response.json() as Promise<T>
}

export function getCafeCatalog() {
  return fetchPublicCafeApi<CafeCatalog>("/catalog")
}

export function getCafeLeaderboards() {
  return fetchPublicCafeApi<CafeLeaderboards>(
    `/guilds/${encodeURIComponent(CHILL_CAFE_GUILD_ID)}/leaderboards`
  )
}

export function getCafeCollectionProfile(profileId: string) {
  return fetchPublicCafeApi<CafeCollectionProfile>(
    `/guilds/${encodeURIComponent(CHILL_CAFE_GUILD_ID)}/profiles/${encodeURIComponent(profileId)}`
  )
}

export function getCafeCardImageUrl(imagePath: string) {
  if (/^https?:\/\//.test(imagePath)) {
    return imagePath
  }
  return `${API_ORIGIN}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`
}
