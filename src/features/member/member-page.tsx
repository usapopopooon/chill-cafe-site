import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
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
import {
  ApiError,
  CHILL_CAFE_GUILD_ID,
  getSocialGraph,
  getUserLevels,
  getUserProfile
} from "@/features/member/api"
import {
  formatDateShort,
  formatHoursDecimal,
  formatNumber,
  formatSeconds
} from "@/features/member/format"
import { MemberSocialGraph } from "@/features/member/member-social-graph"
import type {
  DailyPoint,
  LevelBreakdown,
  SocialGraph,
  TopChannel,
  UserLevels,
  UserProfile
} from "@/features/member/types"
import "./member-page.css"

const LEVEL_KUN_ICON_URL = `${import.meta.env.BASE_URL}level-kun.png`
const DEFAULT_ROBOTS_CONTENT = "index, follow, max-image-preview:large"
const MEMBER_PAGE_ROBOTS_CONTENT = "noindex, nofollow"

interface MemberPageProps {
  userId: string
  days: number
}

export function MemberPage({ userId, days }: MemberPageProps) {
  useMemberPageRobots()

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

  const socialGraphQuery = useQuery({
    queryKey: ["member-social-graph", CHILL_CAFE_GUILD_ID, days],
    queryFn: () => getSocialGraph(days),
    staleTime: 30_000
  })

  return (
    <div className="level-bot-page min-h-screen">
      <header className="level-bot-header border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
          <a href="/" className="flex items-center gap-3 text-base font-bold tracking-normal">
            <img
              src={LEVEL_KUN_ICON_URL}
              alt=""
              width="1254"
              height="1254"
              className="size-10 rounded-2xl border-2 border-white bg-white object-cover shadow-sm"
              aria-hidden="true"
            />
            レベルくん
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
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
            socialGraph={socialGraphQuery.data}
            isSocialGraphLoading={socialGraphQuery.isLoading}
          />
        ) : null}
      </main>
    </div>
  )
}

function useMemberPageRobots() {
  useEffect(() => {
    setMetaContent("robots", MEMBER_PAGE_ROBOTS_CONTENT)
    setMetaContent("googlebot", MEMBER_PAGE_ROBOTS_CONTENT)

    return () => {
      setMetaContent("robots", DEFAULT_ROBOTS_CONTENT)
      setMetaContent("googlebot", DEFAULT_ROBOTS_CONTENT)
    }
  }, [])
}

function setMetaContent(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)

  if (!meta) {
    meta = document.createElement("meta")
    meta.name = name
    document.head.append(meta)
  }

  meta.content = content
}

function ProfileContent({
  profile,
  levels,
  isLevelsLoading,
  socialGraph,
  isSocialGraphLoading,
  days
}: {
  profile: UserProfile
  levels?: UserLevels
  isLevelsLoading: boolean
  socialGraph?: SocialGraph
  isSocialGraphLoading: boolean
  days: number
}) {
  const topVoiceChannels = getTopVoiceChannels(profile)

  return (
    <div>
      <a href="/" className="text-sm font-medium text-[#8f7162] hover:text-[#5e493f]">
        ← トップへ戻る
      </a>

      <div className="mt-8 space-y-6">
        <ProfileHeader profile={profile} days={days} />
        {levels ? <LevelsSection levels={levels} /> : isLevelsLoading ? <LevelsSkeleton /> : null}
        <StatsGrid profile={profile} days={days} />

        <section>
          <h2 className="mb-2 text-lg font-black text-[#4e4038]">日別アクティビティ</h2>
          <UserDailyChart points={profile.daily} />
        </section>

        <section className="space-y-4">
          <TopChannelsList
            entries={topVoiceChannels}
            title="主なボイスチャンネル"
            valueLabel="利用時間"
            valueFormatter={(entry) => formatSeconds(entry.voice_seconds)}
          />
          <TopChannelsList
            entries={profile.top_channels}
            title="主な発言チャンネル"
            valueLabel="メッセージ数"
            valueFormatter={(entry) => formatNumber(entry.message_count)}
          />
        </section>

        {socialGraph ? (
          <MemberSocialGraph graph={socialGraph} profile={profile} />
        ) : isSocialGraphLoading ? (
          <SocialGraphSkeleton />
        ) : null}
      </div>
    </div>
  )
}

function getTopVoiceChannels(profile: UserProfile) {
  return [...(profile.top_voice_channels ?? profile.top_channels)]
    .filter((entry) => entry.voice_seconds > 0)
    .sort((left, right) => right.voice_seconds - left.voice_seconds)
    .slice(0, 5)
}

function ProfileHeader({ profile, days }: { profile: UserProfile; days: number }) {
  return (
    <header className="level-bot-panel flex items-center gap-4 p-4 sm:p-5">
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt=""
          className="size-16 rounded-[24px] border-4 border-white bg-white object-cover shadow-sm"
        />
      ) : (
        <div className="size-16 rounded-[24px] border-4 border-white bg-[#f1e7de] shadow-sm" />
      )}
      <div>
        <h1 className="text-2xl font-black text-[#4e4038]">{profile.display_name}</h1>
        <p className="mt-1 text-sm font-medium text-[#8f7162]">直近 {days} 日のきろく</p>
      </div>
    </header>
  )
}

function LoadingProfile({ days, userId }: { days: number; userId: string }) {
  return (
    <div>
      <a href="/" className="text-sm font-medium text-[#8f7162] hover:text-[#5e493f]">
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
        <section className="space-y-4">
          <TopChannelsSkeleton />
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
    <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="level-bot-panel p-4">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="mt-3 h-8 w-24 rounded-md" />
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
      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LevelCardSkeleton key={index} />
        ))}
      </div>
    </section>
  )
}

function LevelCardSkeleton({ highlight = false }: { highlight?: boolean }) {
  return (
    <div className={`level-bot-panel p-4 ${highlight ? "level-bot-highlight-panel" : ""}`}>
      <div className="flex min-w-0 items-baseline justify-between gap-2">
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
    <div className="level-bot-panel h-72 w-full p-4">
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

function SocialGraphSkeleton() {
  return (
    <section className="space-y-3" aria-busy="true" aria-label="交流マップを読み込み中">
      <div>
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="mt-2 h-4 w-20 rounded-md" />
      </div>
      <div className="level-bot-panel h-[360px] overflow-hidden p-4 sm:h-[460px]">
        <div className="relative h-full">
          <Skeleton className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <Skeleton className="absolute left-[18%] top-[28%] h-11 w-11 rounded-full opacity-50" />
          <Skeleton className="absolute right-[20%] top-[24%] h-12 w-12 rounded-full opacity-50" />
          <Skeleton className="absolute bottom-[22%] left-[26%] h-10 w-10 rounded-full opacity-40" />
          <Skeleton className="absolute bottom-[25%] right-[28%] h-10 w-10 rounded-full opacity-40" />
        </div>
      </div>
    </section>
  )
}

function TopChannelsSkeleton() {
  return (
    <div className="level-bot-panel p-4" aria-busy="true" aria-label="チャンネルを読み込み中">
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
    <div className="level-bot-panel p-5">
      <div className="text-xs uppercase tracking-wide text-[#a2806c]">Error</div>
      <h1 className="mt-2 text-2xl font-bold">{message}</h1>
      <p className="mt-2 text-sm text-[#8f7162]">user_id: {userId}</p>
    </div>
  )
}

function StatsGrid({ profile, days }: { profile: UserProfile; days: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      <StatCard label="Messages" value={formatNumber(profile.total_messages)} />
      <StatCard label="Voice" value={formatSeconds(profile.total_voice_seconds)} />
      <StatCard label="リアクション (受)" value={formatNumber(profile.total_reactions_received)} />
      <StatCard label="リアクション (送)" value={formatNumber(profile.total_reactions_given)} />
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
    <div className="level-bot-panel p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-[#a2806c]">{label}</div>
      <div className="mt-1 text-2xl font-black text-[#4e4038]">{value}</div>
      {hint ? <div className="mt-1 text-xs text-[#8f7162]">{hint}</div> : null}
    </div>
  )
}

function LevelsSection({ levels }: { levels: UserLevels }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <img
          src={LEVEL_KUN_ICON_URL}
          alt=""
          width="1254"
          height="1254"
          className="size-12 rounded-[18px] border-2 border-white bg-white object-cover shadow-sm"
          aria-hidden="true"
        />
        <div>
          <h2 className="text-xl font-black text-[#4e4038]">レベル</h2>
          <p className="text-xs font-medium text-[#8f7162]">ゆるっと成長のきろく</p>
        </div>
      </div>
      <LevelCard label="総合" emoji="⭐" breakdown={levels.total} tone="total" highlight />
      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:grid-cols-4">
        <LevelCard label="ボイス" emoji="🎙️" breakdown={levels.voice} tone="blue" />
        <LevelCard label="テキスト" emoji="💬" breakdown={levels.text} tone="green" />
        <LevelCard
          label="リアクション (受)"
          emoji="💖"
          breakdown={levels.reactions_received}
          tone="red"
        />
        <LevelCard
          label="リアクション (送)"
          emoji="👍"
          breakdown={levels.reactions_given}
          tone="pink"
        />
      </div>
    </section>
  )
}

type LevelTone = "total" | "blue" | "green" | "red" | "pink"

function LevelCard({
  label,
  emoji,
  breakdown,
  tone,
  highlight
}: {
  label: string
  emoji?: string
  breakdown: LevelBreakdown
  tone: LevelTone
  highlight?: boolean
}) {
  const ratio = Math.max(0, Math.min(1, breakdown.progress))
  const remaining = Math.max(0, breakdown.next_floor - breakdown.xp)
  const span = breakdown.next_floor - breakdown.current_floor

  return (
    <div
      className={`level-bot-panel level-card level-card-${tone} p-4 ${
        highlight ? "level-bot-highlight-panel sm:p-5" : ""
      }`}
    >
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <span className="min-w-0 truncate text-xs font-bold text-[#7b6256]">
          {emoji ? `${emoji} ` : ""}
          {label}
        </span>
        <span
          className={`shrink-0 tabular-nums text-[#4e4038] ${highlight ? "text-3xl font-black" : "text-lg font-black"}`}
        >
          Lv {breakdown.level}
        </span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/75 shadow-[inset_0_1px_2px_rgba(99,77,60,0.12)]">
        <div
          className="level-bot-progress h-full rounded-full"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-bold text-[#9a7a69] tabular-nums">
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
    <div className="level-bot-panel h-72 w-full p-4">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 6" stroke="#decfc4" />
          <XAxis dataKey="date" tick={{ fill: "#8f7162", fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fill: "#8f7162", fontSize: 12 }} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: "#8f7162", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: "#fffdf8",
              border: "1px solid #d8c2b3",
              borderRadius: 14,
              color: "#4e4038"
            }}
            labelStyle={{ color: "#4e4038", fontWeight: 700 }}
          />
          <Legend wrapperStyle={{ color: "#6e574b", fontWeight: 700 }} />
          <Bar
            yAxisId="left"
            dataKey="messages"
            name="メッセージ"
            fill="#6aa8df"
            radius={[12, 12, 4, 4]}
          />
          <Bar
            yAxisId="right"
            dataKey="voiceHours"
            name="ボイス (時間)"
            fill="#86bf5b"
            radius={[12, 12, 4, 4]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function TopChannelsList({
  entries,
  title,
  valueLabel,
  valueFormatter
}: {
  entries: TopChannel[]
  title: string
  valueLabel: string
  valueFormatter: (entry: TopChannel) => string
}) {
  return (
    <div className="level-bot-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-black text-[#4e4038]">{title}</h2>
        <span className="text-xs font-bold text-[#a2806c]">{valueLabel}</span>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-[#8f7162]">データがありません。</p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, index) => (
            <li key={entry.channel_id} className="flex items-center gap-3">
              <span className="w-6 text-right text-sm font-bold text-[#a2806c]">#{index + 1}</span>
              <span className="flex-1 truncate text-sm font-medium text-[#5e493f]">
                #{entry.name}
              </span>
              <span className="text-sm font-bold text-[#4e4038] tabular-nums">
                {valueFormatter(entry)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
