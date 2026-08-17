import type {
  CafeCatalogRules,
  CafeLeaderboardCategoryKey,
  CafeLeaderboardEntry,
  CafeRarity
} from "@/features/cafe-collection/types"

export const DEFAULT_CAFE_RULES: CafeCatalogRules = {
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

export const RARITIES: CafeRarity[] = ["N", "HN", "R", "SR", "SSR"]

export const RARITY_DETAILS: Record<
  CafeRarity,
  { label: string; shortLabel: string; color: string }
> = {
  N: { label: "日常とネタ", shortLabel: "N", color: "#7b766c" },
  HN: { label: "定番", shortLabel: "HN", color: "#60815b" },
  R: { label: "こだわり", shortLabel: "R", color: "#367f91" },
  SR: { label: "名品", shortLabel: "SR", color: "#7655a6" },
  SSR: { label: "伝説", shortLabel: "SSR", color: "#ad6a22" }
}

export const LEADERBOARD_DETAILS: Record<
  CafeLeaderboardCategoryKey,
  { title: string; emoji: string; description: string }
> = {
  collection: {
    title: "図鑑ランキング",
    emoji: "📚",
    description: "異なるカードの収集種類数を競います。"
  },
  mastery: {
    title: "熟練度ランキング",
    emoji: "☕",
    description: "カードごとの最高熟練度を合計したランキングです。"
  },
  sets: {
    title: "セットメニューランキング",
    emoji: "🍽️",
    description: "完成したセットメニュー数を競います。"
  },
  rare: {
    title: "レア棚ランキング",
    emoji: "💎",
    description: "R・SR・SSRの異なるカード種類数を競います。"
  },
  joke: {
    title: "ネタ棚ランキング",
    emoji: "🥖",
    description: "Nカードだけの熟練ポイントを競います。"
  }
}

export function leaderboardValue(
  key: CafeLeaderboardCategoryKey,
  entry: CafeLeaderboardEntry,
  totalCards: number,
  totalSets: number
) {
  switch (key) {
    case "collection":
      return `${entry.collection_count}/${totalCards}種`
    case "mastery":
      return `${entry.mastery_score.toLocaleString("ja-JP")} pt`
    case "sets":
      return `${entry.completed_sets}/${totalSets}セット`
    case "rare":
      return `${entry.rare_collection_count}種`
    case "joke":
      return `${entry.n_mastery_score.toLocaleString("ja-JP")} pt`
  }
}

export function leaderboardDetail(key: CafeLeaderboardCategoryKey, entry: CafeLeaderboardEntry) {
  switch (key) {
    case "collection":
      return `レア棚 ${entry.rare_collection_count}種 · 累計 ${entry.total_draws.toLocaleString("ja-JP")}枚`
    case "mastery":
      return `看板 ${entry.signature_cards} · 常連 ${entry.regular_cards} · なじみ ${entry.familiar_cards}`
    case "sets":
      return `図鑑 ${entry.collection_count}種 · 熟練 ${entry.mastery_score.toLocaleString("ja-JP")} pt`
    case "rare":
      return `R ${entry.rare_r_count} · SR ${entry.rare_sr_count} · SSR ${entry.rare_ssr_count}`
    case "joke":
      return `N ${entry.n_collection_count}種 · 看板 ${entry.n_signature_cards}`
  }
}

export function rankMark(rank: number) {
  return ({ 1: "🥇", 2: "🥈", 3: "🥉" } as Record<number, string>)[rank] ?? `#${rank}`
}
