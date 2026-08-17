import { useQuery } from "@tanstack/react-query"
import { BookOpen, Clock3, Trophy, Users } from "lucide-react"
import { getCafeLeaderboards } from "@/features/cafe-collection/api"
import { CafeError, CafeLoading, CafeShell } from "@/features/cafe-collection/cafe-shell"
import {
  LEADERBOARD_DETAILS,
  leaderboardDetail,
  leaderboardValue,
  rankMark
} from "@/features/cafe-collection/presentation"
import type {
  CafeLeaderboardCategory,
  CafeLeaderboardEntry
} from "@/features/cafe-collection/types"
import { usePageMeta } from "@/features/cafe-collection/use-page-meta"

const sitePath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`

export function CafeRankingsPage() {
  usePageMeta({
    title: "カフェ・コレクションランキング | CHILLカフェ",
    description: "図鑑・熟練度・セットメニュー・レア棚・ネタ棚の全ランキングを公開しています。",
    canonicalPath: "cafe-collection/rankings"
  })
  const rankingQuery = useQuery({
    queryKey: ["cafe-collection", "leaderboards"],
    queryFn: getCafeLeaderboards,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })

  if (rankingQuery.isLoading) {
    return (
      <CafeShell>
        <CafeLoading label="ランキングを集計しています…" />
      </CafeShell>
    )
  }
  if (rankingQuery.isError || !rankingQuery.data) {
    return (
      <CafeShell>
        <CafeError message="ランキングを読み込めませんでした。" />
      </CafeShell>
    )
  }

  const ranking = rankingQuery.data

  return (
    <CafeShell>
      <main className="cafe-ranking-main">
        <header className="cafe-ranking-hero">
          <div>
            <p className="cafe-kicker">Cafe hall of fame</p>
            <h1>カフェ・コレクションランキング</h1>
            <p>
              集め方も、楽しみ方もひとつではありません。
              全5部門の上位20名を、いつでもまとめて確認できます。
            </p>
          </div>
          <Trophy aria-hidden="true" />
        </header>

        <section className="cafe-ranking-summary" aria-label="ランキング概要">
          <div>
            <Users aria-hidden="true" />
            <span>参加者</span>
            <strong>{ranking.participant_count.toLocaleString("ja-JP")}人</strong>
          </div>
          <div>
            <BookOpen aria-hidden="true" />
            <span>累計抽選</span>
            <strong>{ranking.total_draws.toLocaleString("ja-JP")}枚</strong>
          </div>
          <div>
            <Clock3 aria-hidden="true" />
            <span>最終集計</span>
            <strong>{formatCapturedAt(ranking.captured_at)}</strong>
          </div>
        </section>

        <nav className="cafe-ranking-index" aria-label="ランキング内目次">
          {ranking.categories.map((category) => {
            const detail = LEADERBOARD_DETAILS[category.key]
            return (
              <a href={`#ranking-${category.key}`} key={category.key}>
                <span aria-hidden="true">{detail.emoji}</span>
                {detail.title.replace("ランキング", "")}
              </a>
            )
          })}
        </nav>

        <div className="cafe-ranking-sections">
          {ranking.categories.map((category) => (
            <RankingSection
              key={category.key}
              category={category}
              totalCards={ranking.total_cards}
              totalSets={ranking.total_sets}
            />
          ))}
        </div>

        <div className="cafe-ranking-note">
          ランキングは最大5分間キャッシュされます。退会済み・表示除外ユーザーは掲載されません。
        </div>
        <a
          href={sitePath("cafe-collection/")}
          className="cafe-primary-link cafe-ranking-catalog-link"
        >
          <BookOpen aria-hidden="true" />
          全カード図鑑を見る
        </a>
      </main>
    </CafeShell>
  )
}

function RankingSection({
  category,
  totalCards,
  totalSets
}: {
  category: CafeLeaderboardCategory
  totalCards: number
  totalSets: number
}) {
  const detail = LEADERBOARD_DETAILS[category.key]

  return (
    <section id={`ranking-${category.key}`} className="cafe-ranking-section">
      <header>
        <span aria-hidden="true">{detail.emoji}</span>
        <div>
          <p>TOP 20</p>
          <h2>{detail.title}</h2>
          <small>{detail.description}</small>
        </div>
      </header>
      {category.entries.length ? (
        <ol>
          {category.entries.map((entry, index) => (
            <RankingRow
              key={`${entry.rank}-${entry.display_name}-${index}`}
              entry={entry}
              category={category}
              totalCards={totalCards}
              totalSets={totalSets}
            />
          ))}
        </ol>
      ) : (
        <p className="cafe-ranking-empty">まだ抽選記録がありません。</p>
      )}
    </section>
  )
}

function RankingRow({
  entry,
  category,
  totalCards,
  totalSets
}: {
  entry: CafeLeaderboardEntry
  category: CafeLeaderboardCategory
  totalCards: number
  totalSets: number
}) {
  return (
    <li className={entry.rank <= 3 ? `cafe-rank-${entry.rank}` : undefined}>
      <span className="cafe-rank-mark">{rankMark(entry.rank)}</span>
      <span className="cafe-avatar-fallback" aria-hidden="true">
        {entry.display_name.slice(0, 1)}
      </span>
      <div className="cafe-rank-person">
        <strong>{entry.display_name}</strong>
        <small>{leaderboardDetail(category.key, entry)}</small>
      </div>
      <b>{leaderboardValue(category.key, entry, totalCards, totalSets)}</b>
    </li>
  )
}

function formatCapturedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo"
  }).format(date)
}
