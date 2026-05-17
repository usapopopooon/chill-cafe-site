import type { UserLevels, UserProfile } from "@/features/member/types"

export const CHILL_CAFE_GUILD_ID = "1168847276291137586"

const DEFAULT_API_ORIGIN = "https://api-production-1623.up.railway.app"
const apiOrigin = (import.meta.env.VITE_LEVEL_BOT_API_ORIGIN || DEFAULT_API_ORIGIN).replace(
  /\/$/,
  ""
)
const apiToken = import.meta.env.VITE_LEVEL_BOT_API_TOKEN?.trim()

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchApi<T>(path: string): Promise<T> {
  const headers = new Headers({
    Accept: "application/json"
  })

  if (apiToken) {
    headers.set("Authorization", `Bearer ${apiToken}`)
  }

  const response = await fetch(`${apiOrigin}${path}`, {
    headers,
    credentials: "omit"
  })

  if (!response.ok) {
    let message = response.statusText

    try {
      const body = (await response.json()) as { detail?: string }
      message = body.detail || message
    } catch {
      // Ignore non-JSON error bodies.
    }

    throw new ApiError(response.status, message)
  }

  return response.json() as Promise<T>
}

export function getUserProfile(userId: string, days: number) {
  const params = new URLSearchParams({ days: String(days) })

  return fetchApi<UserProfile>(
    `/api/v1/guilds/${CHILL_CAFE_GUILD_ID}/users/${encodeURIComponent(userId)}?${params}`
  )
}

export function getUserLevels(userId: string) {
  return fetchApi<UserLevels>(
    `/api/v1/guilds/${CHILL_CAFE_GUILD_ID}/users/${encodeURIComponent(userId)}/levels`
  )
}
