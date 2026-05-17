export interface DailyPoint {
  date: string
  message_count: number
  voice_seconds: number
  reactions_received: number
  reactions_given: number
}

export interface TopChannel {
  channel_id: string
  name: string
  message_count: number
  voice_seconds: number
  reactions_received: number
  reactions_given: number
}

export interface UserProfile {
  user_id: string
  display_name: string
  avatar_url: string | null
  total_messages: number
  total_voice_seconds: number
  total_reactions_received: number
  total_reactions_given: number
  rank_messages: number | null
  rank_voice: number | null
  rank_reactions_received: number | null
  rank_reactions_given: number | null
  daily: DailyPoint[]
  top_channels: TopChannel[]
}

export interface LevelBreakdown {
  level: number
  xp: number
  current_floor: number
  next_floor: number
  progress: number
}

export interface UserLevels {
  total: LevelBreakdown
  voice: LevelBreakdown
  text: LevelBreakdown
  reactions_received: LevelBreakdown
  reactions_given: LevelBreakdown
}
