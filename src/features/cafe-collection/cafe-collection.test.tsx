import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactElement } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { CafeCardDetailPage } from "@/features/cafe-collection/card-detail-page"
import { CafeCollectionPage } from "@/features/cafe-collection/catalog-page"
import { CafeRankingsPage } from "@/features/cafe-collection/rankings-page"
import type {
  CafeCatalog,
  CafeLeaderboardCategoryKey,
  CafeLeaderboards
} from "@/features/cafe-collection/types"

const catalog: CafeCatalog = {
  total_cards: 3,
  food_cards: 1,
  rarity_counts: { N: 1, HN: 1, R: 1, SR: 0, SSR: 0 },
  rarity_rates_percent: { N: 65, HN: 24, R: 8, SR: 2.5, SSR: 0.5 },
  cards: [
    {
      key: "spent-tea",
      name: "出がらし",
      rarity: "N",
      description: "二煎目か三煎目かは、もう誰も数えていない。",
      image_url: "/api/v1/public/cafe-collection/cards/spent-tea/image",
      base_draw_rate_percent: 2.6,
      draw_reward_xp: 25,
      exchange_xp: 25,
      is_food: false
    },
    {
      key: "scone",
      name: "スコーン",
      rarity: "HN",
      description: "クロテッドクリームを添えた焼き菓子。",
      image_url: "/api/v1/public/cafe-collection/cards/scone/image",
      base_draw_rate_percent: 0.96,
      draw_reward_xp: 30,
      exchange_xp: 30,
      is_food: true
    },
    {
      key: "house-blend",
      name: "店主の特製ブレンド",
      rarity: "R",
      description: "配合は秘密。今日の気分だけが隠し味。",
      image_url: "/api/v1/public/cafe-collection/cards/house-blend/image",
      base_draw_rate_percent: 0.29,
      draw_reward_xp: 60,
      exchange_xp: 60,
      is_food: false
    }
  ],
  sets: [
    {
      key: "classic-morning",
      name: "王道の喫茶店モーニング",
      description: "厚切りトーストと珈琲で開店。",
      required_card_keys: ["house-blend", "scone"]
    }
  ],
  mastery_tiers: [{ minimum_count: 1, name: "発見", emoji: "🔎" }],
  rules: {
    free_draws_per_day: 1,
    free_draw_reset_timezone: "Asia/Tokyo",
    paid_draw_cost_xp: 20,
    hourly_draw_limit: 10,
    daily_draw_limit: null,
    unowned_weight_multiplier: 2,
    endgame_pity_min_collected: 108,
    endgame_pity_duplicate_draws: 100,
    first_copy_protected: true,
    draw_results_public: true
  }
}

const categoryKeys: CafeLeaderboardCategoryKey[] = ["collection", "mastery", "sets", "rare", "joke"]

const rankings: CafeLeaderboards = {
  guild_id: "1168847276291137586",
  total_cards: 120,
  total_sets: 11,
  participant_count: 12,
  total_draws: 5217,
  captured_at: "2026-08-17T09:30:00Z",
  categories: categoryKeys.map((key) => ({
    key,
    entries: [
      {
        rank: 1,
        display_name: "うさぽ",
        avatar_url: "https://cdn.example/avatar.png",
        collection_count: 100,
        total_draws: 800,
        mastery_score: 300,
        discovery_cards: 10,
        familiar_cards: 8,
        regular_cards: 4,
        signature_cards: 2,
        completed_sets: 7,
        rare_collection_count: 30,
        rare_r_count: 20,
        rare_sr_count: 8,
        rare_ssr_count: 2,
        n_collection_count: 28,
        n_mastery_score: 120,
        n_signature_cards: 3
      }
    ]
  }))
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function mockJson(body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    )
  )
}

describe("CafeCollectionPage", () => {
  it("shows the catalog and filters cards without another request", async () => {
    mockJson(catalog)
    const user = userEvent.setup()
    renderWithQuery(<CafeCollectionPage />)

    expect(await screen.findByRole("heading", { name: "全カード図鑑" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "遊び方と大事なルール" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "セットメニュー図鑑" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "最初の1枚は必ず残る" })).toBeInTheDocument()
    expect(screen.getByText("基準 2.60%")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "出がらし" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "スコーン" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "食べ物" }))

    expect(screen.getByRole("heading", { name: "スコーン" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "出がらし" })).not.toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("keeps working while an older cached catalog response is rolling out", async () => {
    const legacyCatalog = {
      ...catalog,
      cards: catalog.cards.map((card) =>
        Object.fromEntries(Object.entries(card).filter(([key]) => key !== "base_draw_rate_percent"))
      ),
      rules: undefined
    }
    mockJson(legacyCatalog)

    renderWithQuery(<CafeCollectionPage />)

    expect(await screen.findByRole("heading", { name: "全カード図鑑" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "毎日1枚は無料" })).toBeInTheDocument()
    expect(screen.getAllByText("基準 準備中")).toHaveLength(3)
  })
})

describe("CafeCardDetailPage", () => {
  it("shows card facts and related sets", async () => {
    mockJson(catalog)
    renderWithQuery(<CafeCardDetailPage cardKey="house-blend" />)

    expect(await screen.findByRole("heading", { name: "店主の特製ブレンド" })).toBeInTheDocument()
    expect(screen.getByText("60 XP", { exact: true })).toBeInTheDocument()
    expect(screen.getByText("0.29%", { exact: true })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /カード画像を大きく見る/ })).toHaveAttribute(
      "href",
      "https://level-bot-api.chill-cafe.site/api/v1/public/cafe-collection/cards/house-blend/image"
    )
    expect(screen.getByRole("heading", { name: "王道の喫茶店モーニング" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "あわせて眺めたいカード" })).toBeInTheDocument()
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://chill-cafe.site/cafe-collection/cards/house-blend/"
    )
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "店主の特製ブレンド | カフェ・コレクション"
    )
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow, noarchive, nosnippet, noimageindex"
    )
  })
})

describe("CafeRankingsPage", () => {
  it("renders all five ranking categories without selecting a tab", async () => {
    mockJson(rankings)
    renderWithQuery(<CafeRankingsPage />)

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "図鑑ランキング" })).toBeInTheDocument()
    })
    expect(screen.getByRole("heading", { name: "熟練度ランキング" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "セットメニューランキング" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "レア棚ランキング" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "ネタ棚ランキング" })).toBeInTheDocument()
    expect(screen.getAllByText("うさぽ")).toHaveLength(5)
    const avatars = screen.getAllByRole("img", { name: "うさぽのDiscordアイコン" })
    expect(avatars).toHaveLength(5)
    expect(avatars[0]).toHaveAttribute("src", "https://cdn.example/avatar.png")

    fireEvent.error(avatars[0])
    expect(screen.getByText("う")).toBeInTheDocument()
    expect(screen.getAllByRole("img", { name: "うさぽのDiscordアイコン" })).toHaveLength(4)
  })
})
