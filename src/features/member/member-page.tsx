import { useQuery } from "@tanstack/react-query"
import { ExternalLink, Hash, Home, MessageCircle, SmilePlus, Trophy, Volume2 } from "lucide-react"
import { getUserLevels, getUserProfile, ApiError, CHILL_CAFE_GUILD_ID } from "@/features/member/api"
import type {
  DailyPoint,
  LevelBreakdown,
  TopChannel,
  UserLevels,
  UserProfile
} from "@/features/member/types"
import { formatDateShort, formatNumber, formatRank, formatSeconds } from "@/features/member/format"
import { Button } from "@/components/ui/button"

const DISCORD_SERVER_URL = "https://discord.com/servers/chillkahue-1168847276291137586"
const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`
const SERVER_BANNER_URL = assetUrl("server-banner.png")
const SERVER_ICON_URL = assetUrl("server-icon.png")
const daysOptions = [7, 30, 90]

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

  const profile = profileQuery.data
  const levels = levelsQuery.data

  return (
    <main className="min-h-screen overflow-hidden bg-[#fff5fa] font-['M_PLUS_Rounded_1c'] text-[#4a3342]">
      <MemberHero
        userId={userId}
        days={days}
        profile={profile}
        isLoading={profileQuery.isLoading}
      />

      {profileQuery.isLoading ? (
        <MemberLoading />
      ) : profileQuery.isError ? (
        <MemberError error={profileQuery.error} userId={userId} />
      ) : profile ? (
        <>
          <LevelSection levels={levels} />
          <StatsSection profile={profile} days={days} />
          <DailySection points={profile.daily} />
          <ChannelsSection channels={profile.top_channels} />
        </>
      ) : null}
    </main>
  )
}

interface MemberHeroProps {
  userId: string
  days: number
  profile?: UserProfile
  isLoading: boolean
}

function MemberHero({ userId, days, profile, isLoading }: MemberHeroProps) {
  const displayName = profile?.display_name || (isLoading ? "Loading..." : userId)

  return (
    <section className="relative isolate overflow-hidden bg-[#fff5fa]">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[linear-gradient(180deg,#fff8fb_0%,#ffe9f3_100%)]">
        <img
          src={SERVER_BANNER_URL}
          alt="🍭CHILLカフェのアイキャッチ画像"
          width="1800"
          height="1013"
          fetchPriority="high"
          className="size-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,245,250,0)_0%,rgba(255,245,250,0.05)_68%,#fff5fa_100%),linear-gradient(90deg,rgba(255,245,250,0.24)_0%,rgba(255,245,250,0.08)_45%,rgba(255,245,250,0)_100%)]" />
      </div>

      <div className="relative z-10 -mt-10 bg-[linear-gradient(180deg,rgba(255,245,250,0)_0%,rgba(255,245,250,0.92)_26%,#fff5fa_100%)] pt-12 shadow-[0_-18px_48px_rgba(190,112,150,0.08)] md:-mt-16 md:bg-[linear-gradient(90deg,rgba(255,245,250,0.9)_0%,rgba(255,245,250,0.64)_48%,rgba(255,245,250,0)_100%),linear-gradient(180deg,rgba(255,245,250,0)_0%,#fff5fa_72%)] md:pt-16">
        <div className="mx-auto w-full max-w-6xl px-5 pb-5 md:px-8 md:py-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 gap-4 md:items-center">
              <Avatar profile={profile} />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d8669b]">
                  Member
                </p>
                <h1 className="mt-2 text-4xl font-black leading-none tracking-normal text-[#4a3342] drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)] md:text-6xl">
                  {displayName}
                </h1>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#6d4e61] drop-shadow-[0_2px_10px_rgba(255,255,255,0.95)] md:text-base">
                  直近 {days} 日のチル記録
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:items-center">
              <Button
                size="lg"
                asChild
                className="h-12 rounded-full !bg-[#5865f2] px-8 font-bold !text-white shadow-[0_14px_34px_rgba(88,101,242,0.28)] hover:!bg-[#4752c4]"
              >
                <a href={DISCORD_SERVER_URL} target="_blank" rel="noreferrer">
                  Join Server
                  <ExternalLink className="size-4" />
                </a>
              </Button>
              <a
                href="/"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#e7aeca] bg-white/76 px-7 text-sm font-bold text-[#6b3f58] shadow-[0_12px_28px_rgba(226,141,177,0.12)] backdrop-blur transition hover:bg-white"
              >
                <Home className="size-4" />
                Home
              </a>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {daysOptions.map((option) => (
              <a
                key={option}
                href={`/members/${encodeURIComponent(userId)}?days=${option}`}
                aria-current={option === days ? "page" : undefined}
                className="inline-flex h-10 items-center rounded-full bg-white/72 px-4 text-sm font-bold text-[#8a4965] ring-1 ring-[#f6c6d9] transition hover:bg-white aria-[current=page]:bg-[#5865f2] aria-[current=page]:text-white aria-[current=page]:ring-[#5865f2]"
              >
                {option} days
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Avatar({ profile }: { profile?: UserProfile }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt=""
        aria-hidden="true"
        className="size-16 shrink-0 rounded-full border-[5px] border-white bg-white object-cover shadow-[0_12px_28px_rgba(190,112,150,0.24)] md:size-24"
      />
    )
  }

  return (
    <img
      src={SERVER_ICON_URL}
      alt=""
      aria-hidden="true"
      width="720"
      height="720"
      className="size-16 shrink-0 rounded-[20px] border-[5px] border-white bg-white object-cover shadow-[0_12px_28px_rgba(190,112,150,0.24)] md:size-24 md:rounded-[26px]"
    />
  )
}

function MemberLoading() {
  return (
    <section className="bg-[#fff5fa]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="h-4 w-48 rounded-full bg-[#f5c6da]" />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 rounded-[22px] bg-white/70 ring-1 ring-[#f6c6d9]" />
          ))}
        </div>
      </div>
    </section>
  )
}

function MemberError({ error, userId }: { error: Error; userId: string }) {
  const status = error instanceof ApiError ? error.status : undefined
  const title =
    status === 404
      ? "Member not found"
      : status === 401
        ? "API authentication required"
        : "Could not load member"

  return (
    <section className="bg-[#fff5fa]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d8669b]">Status</p>
        <h2 className="mt-4 text-3xl font-black leading-tight tracking-normal text-[#4a3342] md:text-5xl">
          {title}
        </h2>
        <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#735568]">user_id: {userId}</p>
      </div>
    </section>
  )
}

function LevelSection({ levels }: { levels?: UserLevels }) {
  if (!levels) return null

  return (
    <section className="bg-[#fff5fa]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d8669b]">Level</p>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-normal text-[#4a3342] md:text-5xl">
              Lv {levels.total.level}
            </h2>
            <p className="mt-4 text-[15px] leading-8 text-[#735568]">
              {formatNumber(levels.total.xp)} XP
            </p>
          </div>
          <div className="space-y-4">
            <LevelRow label="総合" value={levels.total} highlight />
            <LevelRow label="ボイス" value={levels.voice} />
            <LevelRow label="テキスト" value={levels.text} />
            <LevelRow label="リアクション (受)" value={levels.reactions_received} />
            <LevelRow label="リアクション (送)" value={levels.reactions_given} />
          </div>
        </div>
      </div>
    </section>
  )
}

function LevelRow({
  label,
  value,
  highlight = false
}: {
  label: string
  value: LevelBreakdown
  highlight?: boolean
}) {
  return (
    <div className="rounded-[22px] bg-white/66 px-5 py-4 ring-1 ring-[#f6c6d9]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-black text-[#6b3f58]">{label}</p>
        <p
          className={highlight ? "text-xl font-black text-[#5865f2]" : "font-black text-[#4a3342]"}
        >
          Lv {value.level}
        </p>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#ffe5f0]">
        <div
          className="h-full rounded-full bg-[#5865f2]"
          style={{ width: `${Math.max(4, Math.min(100, value.progress * 100))}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-bold text-[#8a6a7c]">{formatNumber(value.xp)} XP</p>
    </div>
  )
}

function StatsSection({ profile, days }: { profile: UserProfile; days: number }) {
  const stats = [
    {
      label: "Messages",
      value: formatNumber(profile.total_messages),
      rank: formatRank(profile.rank_messages),
      icon: MessageCircle
    },
    {
      label: "Voice",
      value: formatSeconds(profile.total_voice_seconds),
      rank: formatRank(profile.rank_voice),
      icon: Volume2
    },
    {
      label: "リアクション (受)",
      value: formatNumber(profile.total_reactions_received),
      rank: formatRank(profile.rank_reactions_received),
      icon: Trophy
    },
    {
      label: "リアクション (送)",
      value: formatNumber(profile.total_reactions_given),
      rank: formatRank(profile.rank_reactions_given),
      icon: SmilePlus
    }
  ]

  return (
    <section className="border-y border-[#f5c6da] bg-white/56">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d8669b]">Activity</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.label}
                className="rounded-[22px] bg-white/74 px-5 py-5 ring-1 ring-[#f6c6d9]"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-black text-[#6b3f58]">{stat.label}</p>
                  <Icon className="size-5 text-[#d8669b]" />
                </div>
                <p className="mt-4 text-2xl font-black text-[#4a3342]">{stat.value}</p>
                <p className="mt-2 text-xs font-bold text-[#8a6a7c]">rank {stat.rank}</p>
              </div>
            )
          })}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-white/72 px-3 py-1.5 text-sm font-bold text-[#8a4965] ring-1 ring-[#f6c6d9]">
            Daily avg msg {formatNumber(Math.round(profile.total_messages / days))}
          </span>
          <span className="inline-flex items-center rounded-full bg-white/72 px-3 py-1.5 text-sm font-bold text-[#8a4965] ring-1 ring-[#f6c6d9]">
            Daily avg voice {formatSeconds(Math.round(profile.total_voice_seconds / days))}
          </span>
        </div>
      </div>
    </section>
  )
}

function DailySection({ points }: { points: DailyPoint[] }) {
  const maxMessages = Math.max(...points.map((point) => point.message_count), 1)
  const visiblePoints = points.slice(-30)

  return (
    <section className="bg-[linear-gradient(180deg,#fff5fa_0%,#f9ecf7_100%)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d8669b]">Daily</p>
        <div className="mt-8 flex h-56 items-end gap-1 rounded-[24px] bg-white/64 px-4 py-5 ring-1 ring-[#f6c6d9]">
          {visiblePoints.map((point) => (
            <div key={point.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-full bg-[#5865f2] shadow-[0_8px_18px_rgba(88,101,242,0.16)]"
                style={{
                  height: `${Math.max(6, (point.message_count / maxMessages) * 164)}px`
                }}
                title={`${formatDateShort(point.date)} ${formatNumber(point.message_count)} messages`}
              />
              <span className="hidden text-[10px] font-bold text-[#8a6a7c] sm:inline">
                {formatDateShort(point.date)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ChannelsSection({ channels }: { channels: TopChannel[] }) {
  return (
    <section className="bg-[#fff5fa]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d8669b]">Channels</p>
        <div className="mt-8 divide-y divide-[#f1c7d9]">
          {channels.map((channel) => (
            <div
              key={channel.channel_id}
              className="grid gap-4 py-6 md:grid-cols-[1fr_160px_160px] md:items-center"
            >
              <p className="inline-flex min-w-0 items-center gap-2 text-xl font-bold leading-8 text-[#5d4053]">
                <Hash className="size-5 shrink-0 text-[#d8669b]" />
                <span className="truncate">{channel.name}</span>
              </p>
              <p className="text-sm font-bold text-[#735568]">
                {formatNumber(channel.message_count)} messages
              </p>
              <p className="text-sm font-bold text-[#735568]">
                {formatSeconds(channel.voice_seconds)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
