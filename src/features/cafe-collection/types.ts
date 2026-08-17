export type CafeRarity = "N" | "HN" | "R" | "SR" | "SSR"

export interface CafeCard {
  key: string
  name: string
  rarity: CafeRarity
  description: string
  image_url: string
  base_draw_rate_percent?: number
  draw_reward_xp: number
  exchange_xp: number
  is_food: boolean
}

export interface CafeSet {
  key: string
  name: string
  description: string
  required_card_keys: string[]
}

export interface CafeMasteryTier {
  minimum_count: number
  name: string
  emoji: string
}

export interface CafeCatalogRules {
  free_draws_per_day: number
  free_draw_reset_timezone: string
  paid_draw_cost_xp: number
  hourly_draw_limit: number
  daily_draw_limit: number | null
  unowned_weight_multiplier: number
  endgame_pity_min_collected: number
  endgame_pity_duplicate_draws: number
  first_copy_protected: boolean
  draw_results_public: boolean
}

export interface CafeCatalog {
  total_cards: number
  food_cards: number
  rarity_counts: Record<CafeRarity, number>
  rarity_rates_percent: Record<CafeRarity, number>
  cards: CafeCard[]
  sets: CafeSet[]
  mastery_tiers: CafeMasteryTier[]
  rules?: CafeCatalogRules
}

export type CafeLeaderboardCategoryKey = "collection" | "mastery" | "sets" | "rare" | "joke"

export interface CafeLeaderboardEntry {
  rank: number
  display_name: string
  collection_count: number
  total_draws: number
  mastery_score: number
  discovery_cards: number
  familiar_cards: number
  regular_cards: number
  signature_cards: number
  completed_sets: number
  rare_collection_count: number
  rare_r_count: number
  rare_sr_count: number
  rare_ssr_count: number
  n_collection_count: number
  n_mastery_score: number
  n_signature_cards: number
}

export interface CafeLeaderboardCategory {
  key: CafeLeaderboardCategoryKey
  entries: CafeLeaderboardEntry[]
}

export interface CafeLeaderboards {
  guild_id: string
  total_cards: number
  total_sets: number
  participant_count: number
  total_draws: number
  captured_at: string
  categories: CafeLeaderboardCategory[]
}
