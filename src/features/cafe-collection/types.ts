export type CafeRarity = "N" | "HN" | "R" | "SR" | "SSR" | "UR" | "幻"
export type CafeCardTag = "coffee" | "tea" | "sweets" | "culture"

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
  tags?: CafeCardTag[]
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

export type CafeLeaderboardCategoryKey =
  | "collection"
  | "mastery"
  | "sets"
  | "rare"
  | "treasure"
  | "joke"
  | "coffee"
  | "tea"
  | "sweets"
  | "culture"

export interface CafeLeaderboardEntry {
  rank: number
  profile_id?: string
  display_name: string
  avatar_url?: string | null
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
  rare_ur_count: number
  rare_mythic_count: number
  treasure_collection_count: number
  n_collection_count: number
  n_mastery_score: number
  n_signature_cards: number
  coffee_collection_count?: number
  coffee_mastery_score?: number
  coffee_signature_cards?: number
  tea_collection_count?: number
  tea_mastery_score?: number
  tea_signature_cards?: number
  sweets_collection_count?: number
  sweets_mastery_score?: number
  sweets_signature_cards?: number
  culture_collection_count?: number
  culture_mastery_score?: number
  culture_signature_cards?: number
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

export interface CafeCollectionProfileCard {
  card_key: string
  count: number
  lifetime_count: number
}

export interface CafeCollectionProfile {
  profile_id: string
  display_name: string
  avatar_url?: string | null
  total_cards: number
  total_sets: number
  collection_count: number
  total_draws: number
  mastery_score: number
  completed_set_keys: string[]
  ranks: Partial<Record<CafeLeaderboardCategoryKey, number>>
  cards: CafeCollectionProfileCard[]
  captured_at: string
}
