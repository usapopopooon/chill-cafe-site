import { useQuery } from "@tanstack/react-query"
import type { CSSProperties } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { ApiError, CHILL_CAFE_GUILD_ID, getUserLevels, getUserProfile } from "@/features/member/api"
import {
  formatDateShort,
  formatHoursDecimal,
  formatNumber,
  formatSeconds
} from "@/features/member/format"
import type {
  DailyPoint,
  LevelBreakdown,
  TopChannel,
  UserLevels,
  UserProfile
} from "@/features/member/types"
import "./member-page.css"

interface MemberPageProps {
  userId: string
  days: number
}

export function MemberPage({ userId, days }: MemberPageProps) {
  const profileQuery = useQuery({
    queryKey: ["member-profile", CHILL_CAFE_GUILD_ID, userId, days],
    queryFn: () => getUserProfile(userId, days),
    staleTime: 30_000
  })

  const levelsQuery = useQuery({
    queryKey: ["member-levels", CHILL_CAFE_GUILD_ID, userId],
    queryFn: () => getUserLevels(userId),
    staleTime: 30_000
  })

  return (
    <div className="level-bot-page min-h-screen">
      <header className="border-b bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
          <a href="/" className="text-base font-semibold tracking-tight">
            📊 Level Bot
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {profileQuery.isLoading ? (
          <LoadingProfile days={days} userId={userId} />
        ) : profileQuery.isError ? (
          <ProfileError error={profileQuery.error} userId={userId} />
        ) : profileQuery.data ? (
          <ProfileContent
            days={days}
            isLevelsLoading={levelsQuery.isLoading}
            levels={levelsQuery.data}
            profile={profileQuery.data}
          />
        ) : null}
      </main>
    </div>
  )
}

function ProfileContent({
  profile,
  levels,
  isLevelsLoading,
  days
}: {
  profile: UserProfile
  levels?: UserLevels
  isLevelsLoading: boolean
  days: number
}) {
  return (
    <div>
      <a href="/" className="text-sm text-white/50 hover:text-white/80">
        ← トップへ戻る
      </a>

      <div className="mt-8 space-y-6">
        <ProfileHeader profile={profile} days={days} />
        {levels ? <LevelsSection levels={levels} /> : isLevelsLoading ? <LevelsSkeleton /> : null}
        <StatsGrid profile={profile} days={days} />

        <section>
          <h2 className="mb-2 text-lg font-semibold">日別アクティビティ</h2>
          <UserDailyChart points={profile.daily} />
        </section>

        <section>
          <TopChannelsList entries={profile.top_channels} title="主な発言チャンネル" />
        </section>
      </div>
    </div>
  )
}

function ProfileHeader({ profile, days }: { profile: UserProfile; days: number }) {
  return (
    <header className="flex items-center gap-4">
      {profile.avatar_url ? (
        <img src={profile.avatar_url} alt="" className="h-14 w-14 rounded-full bg-white/10" />
      ) : (
        <div className="h-14 w-14 rounded-full bg-white/10" />
      )}
      <div>
        <h1 className="text-2xl font-bold">{profile.display_name}</h1>
        <p className="text-sm text-white/50">直近 {days} 日</p>
      </div>
    </header>
  )
}

function LoadingProfile({ days, userId }: { days: number; userId: string }) {
  return (
    <div>
      <a href="/" className="text-sm text-white/50 hover:text-white/80">
        ← トップへ戻る
      </a>

      <div className="mt-8 space-y-6">
        <header className="flex items-center gap-4" aria-busy="true" aria-label="読み込み中">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div>
            <Skeleton className="h-7 w-56 max-w-[54vw] rounded-md" />
            <Skeleton className="mt-2 h-4 w-20 rounded-md" />
            <span className="sr-only">
              {userId} の直近 {days} 日を読み込み中
            </span>
          </div>
        </header>
        <LevelsSkeleton />
        <StatsSkeleton />
        <section>
          <Skeleton className="mb-2 h-6 w-40 rounded-md" />
          <ChartSkeleton />
        </section>
        <section>
          <TopChannelsSkeleton />
        </section>
      </div>
    </div>
  )
}

function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div className={`level-bot-skeleton ${className}`} style={style} />
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-xl border bg-white/5 p-4">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="mt-3 h-8 w-24 rounded-md" />
          {index < 4 ? <Skeleton className="mt-2 h-3 w-16 rounded-md" /> : null}
        </div>
      ))}
    </div>
  )
}

function LevelsSkeleton() {
  return (
    <section className="space-y-3" aria-busy="true" aria-label="レベルを読み込み中">
      <Skeleton className="h-6 w-16 rounded-md" />
      <LevelCardSkeleton highlight />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LevelCardSkeleton key={index} />
        ))}
      </div>
    </section>
  )
}

function LevelCardSkeleton({ highlight = false }: { highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "level-bot-border-amber bg-amber-400/5" : "bg-white/5"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className={highlight ? "h-8 w-16 rounded-md" : "h-6 w-14 rounded-md"} />
      </div>
      <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
      <div className="mt-2 flex justify-between">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-3 w-20 rounded-md" />
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="h-72 w-full rounded-xl border bg-white/5 p-4">
      <div className="flex h-full items-end gap-2">
        {Array.from({ length: 24 }).map((_, index) => (
          <Skeleton
            key={index}
            className="min-w-0 flex-1 rounded-t-md"
            style={{ height: `${24 + ((index * 17) % 58)}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function TopChannelsSkeleton() {
  return (
    <div
      className="rounded-xl border bg-white/5 p-4"
      aria-busy="true"
      aria-label="チャンネルを読み込み中"
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-3 w-16 rounded-md" />
      </div>
      <ol className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className="flex items-center gap-3">
            <Skeleton className="h-4 w-6 rounded-md" />
            <Skeleton className="h-4 flex-1 rounded-md" />
            <Skeleton className="h-4 w-14 rounded-md" />
          </li>
        ))}
      </ol>
    </div>
  )
}

function ProfileError({ error, userId }: { error: Error; userId: string }) {
  const status = error instanceof ApiError ? error.status : undefined
  const message =
    status === 404
      ? "ユーザーのデータがありません。"
      : status === 401
        ? "API 認証が必要です。"
        : "プロフィールを読み込めませんでした。"

  return (
    <div className="rounded-xl border bg-white/5 p-5">
      <div className="text-xs uppercase tracking-wide text-white/50">Error</div>
      <h1 className="mt-2 text-2xl font-bold">{message}</h1>
      <p className="mt-2 text-sm text-white/50">user_id: {userId}</p>
    </div>
  )
}

function StatsGrid({ profile, days }: { profile: UserProfile; days: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <StatCard
        label="Messages"
        value={formatNumber(profile.total_messages)}
        hint={profile.rank_messages ? `rank #${profile.rank_messages}` : undefined}
      />
      <StatCard
        label="Voice"
        value={formatSeconds(profile.total_voice_seconds)}
        hint={profile.rank_voice ? `rank #${profile.rank_voice}` : undefined}
      />
      <StatCard
        label="リアクション (受)"
        value={formatNumber(profile.total_reactions_received)}
        hint={
          profile.rank_reactions_received ? `rank #${profile.rank_reactions_received}` : undefined
        }
      />
      <StatCard
        label="リアクション (送)"
        value={formatNumber(profile.total_reactions_given)}
        hint={profile.rank_reactions_given ? `rank #${profile.rank_reactions_given}` : undefined}
      />
      <StatCard
        label="Daily avg msg"
        value={formatNumber(Math.round(profile.total_messages / days))}
      />
      <StatCard
        label="Daily avg voice"
        value={formatSeconds(Math.round(profile.total_voice_seconds / days))}
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  hint
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="rounded-xl border bg-white/5 p-4">
      <div className="text-xs uppercase tracking-wide text-white/50">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-white/40">{hint}</div> : null}
    </div>
  )
}

function LevelsSection({ levels }: { levels: UserLevels }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">レベル</h2>
      <LevelCard label="総合" emoji="⭐" breakdown={levels.total} highlight />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <LevelCard label="ボイス" emoji="🎙️" breakdown={levels.voice} />
        <LevelCard label="テキスト" emoji="💬" breakdown={levels.text} />
        <LevelCard label="リアクション (受)" emoji="💖" breakdown={levels.reactions_received} />
        <LevelCard label="リアクション (送)" emoji="👍" breakdown={levels.reactions_given} />
      </div>
    </section>
  )
}

function LevelCard({
  label,
  emoji,
  breakdown,
  highlight
}: {
  label: string
  emoji?: string
  breakdown: LevelBreakdown
  highlight?: boolean
}) {
  const ratio = Math.max(0, Math.min(1, breakdown.progress))
  const remaining = Math.max(0, breakdown.next_floor - breakdown.xp)
  const span = breakdown.next_floor - breakdown.current_floor

  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "level-bot-border-amber bg-amber-400/5" : "bg-white/5"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-white/60">
          {emoji ? `${emoji} ` : ""}
          {label}
        </span>
        <span
          className={`tabular-nums ${highlight ? "text-2xl font-bold" : "text-lg font-semibold"}`}
        >
          Lv {breakdown.level}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full ${highlight ? "bg-amber-400" : "bg-white/50"}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-white/40 tabular-nums">
        <span>{formatNumber(breakdown.xp)} XP</span>
        <span>{span > 0 ? `次まで ${formatNumber(remaining)}` : "MAX"}</span>
      </div>
    </div>
  )
}

function UserDailyChart({ points }: { points: DailyPoint[] }) {
  const data = points.map((point) => ({
    date: formatDateShort(point.date),
    messages: point.message_count,
    voiceHours: formatHoursDecimal(point.voice_seconds)
  }))

  return (
    <div className="h-72 w-full rounded-xl border bg-white/5 p-4">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
          <XAxis dataKey="date" tick={{ fill: "#aaa", fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fill: "#aaa", fontSize: 12 }} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: "#aaa", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: "#1a1d24",
              border: "1px solid #ffffff20",
              borderRadius: 8
            }}
            labelStyle={{ color: "#fff" }}
          />
          <Legend wrapperStyle={{ color: "#ddd" }} />
          <Bar
            yAxisId="left"
            dataKey="messages"
            name="メッセージ"
            fill="#5865F2"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="voiceHours"
            name="ボイス (時間)"
            fill="#57F287"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function TopChannelsList({ entries, title }: { entries: TopChannel[]; title: string }) {
  return (
    <div className="rounded-xl border bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-white/40">メッセージ数</span>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-white/50">データがありません。</p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, index) => (
            <li key={entry.channel_id} className="flex items-center gap-3">
              <span className="w-6 text-right text-sm text-white/40">#{index + 1}</span>
              <span className="flex-1 truncate text-sm">#{entry.name}</span>
              <span className="text-sm font-medium tabular-nums">
                {formatNumber(entry.message_count)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
