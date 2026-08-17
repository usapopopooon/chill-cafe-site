import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, BookOpen, Layers3, Sparkles, Trophy } from "lucide-react"
import { useMemo, useState, type CSSProperties } from "react"
import {
  getCafeCardImageUrl,
  getCafeCatalog,
  getCafeCollectionProfile
} from "@/features/cafe-collection/api"
import { CafeError, CafeLoading, CafeShell } from "@/features/cafe-collection/cafe-shell"
import {
  LEADERBOARD_DETAILS,
  RARITIES,
  RARITY_DETAILS
} from "@/features/cafe-collection/presentation"
import type {
  CafeCatalog,
  CafeLeaderboardCategoryKey,
  CafeMasteryTier,
  CafeRarity
} from "@/features/cafe-collection/types"
import { usePageMeta } from "@/features/cafe-collection/use-page-meta"

type OwnershipFilter = "owned" | "missing" | "all"

const sitePath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`
const leaderboardKeys: CafeLeaderboardCategoryKey[] = [
  "collection",
  "mastery",
  "sets",
  "rare",
  "joke"
]

export function CafeProfilePage({ profileId }: { profileId: string }) {
  const profileQuery = useQuery({
    queryKey: ["cafe-collection", "profile", profileId],
    queryFn: () => getCafeCollectionProfile(profileId),
    enabled: Boolean(profileId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })
  const catalogQuery = useQuery({
    queryKey: ["cafe-collection", "catalog"],
    queryFn: getCafeCatalog,
    enabled: Boolean(profileId),
    staleTime: 60 * 60 * 1000
  })
  const [ownership, setOwnership] = useState<OwnershipFilter>("owned")
  const [rarity, setRarity] = useState<CafeRarity | "all">("all")

  const profileName = profileQuery.data?.display_name
  usePageMeta({
    title: profileName
      ? `${profileName}さんのコレクション | CHILLカフェ`
      : "個人コレクション | CHILLカフェ",
    description: profileName
      ? `${profileName}さんが集めたカフェ・コレクションと熟練度を確認できます。`
      : "ランキング参加者のカフェ・コレクションと熟練度を確認できます。",
    canonicalPath: "cafe-collection/profile"
  })

  const profile = profileQuery.data
  const catalog = catalogQuery.data
  const counts = useMemo(
    () => new Map(profile?.cards.map((card) => [card.card_key, card]) ?? []),
    [profile]
  )
  const visibleCards = useMemo(() => {
    if (!catalog) return []
    return catalog.cards.filter((card) => {
      const count = counts.get(card.key)?.count ?? 0
      const matchesOwnership =
        ownership === "all" || (ownership === "owned" ? count > 0 : count === 0)
      return matchesOwnership && (rarity === "all" || card.rarity === rarity)
    })
  }, [catalog, counts, ownership, rarity])

  if (!profileId) {
    return (
      <CafeShell>
        <CafeError message="ランキングから見たい人を選んでください。" />
      </CafeShell>
    )
  }
  if (profileQuery.isLoading || catalogQuery.isLoading) {
    return (
      <CafeShell>
        <CafeLoading label="個人のコレクションを開いています…" />
      </CafeShell>
    )
  }
  if (profileQuery.isError || catalogQuery.isError || !profile || !catalog) {
    return (
      <CafeShell>
        <CafeError message="このコレクションを読み込めませんでした。" />
      </CafeShell>
    )
  }

  const completedSetKeys = new Set(profile.completed_set_keys)
  const completionPercent = Math.min(100, (profile.collection_count / profile.total_cards) * 100)

  return (
    <CafeShell>
      <main className="cafe-profile-main">
        <a href={sitePath("cafe-collection/rankings/")} className="cafe-back-link">
          <ArrowLeft aria-hidden="true" />
          ランキングへ戻る
        </a>

        <header className="cafe-profile-hero">
          <ProfileAvatar
            displayName={profile.display_name}
            avatarUrl={profile.avatar_url ?? null}
          />
          <div className="cafe-profile-heading">
            <p className="cafe-kicker">Personal collection shelf</p>
            <h1>{profile.display_name}さんの棚</h1>
            <p>これまでに出会った一杯とひと皿。枚数に応じた熟練度も確認できます。</p>
            <div
              className="cafe-profile-progress"
              role="progressbar"
              aria-label="図鑑の収集率"
              aria-valuemin={0}
              aria-valuemax={profile.total_cards}
              aria-valuenow={profile.collection_count}
            >
              <span style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
        </header>

        <section className="cafe-profile-summary" aria-label="コレクション概要">
          <div>
            <BookOpen aria-hidden="true" />
            <span>収集</span>
            <strong>
              {profile.collection_count}/{profile.total_cards}種
            </strong>
          </div>
          <div>
            <Layers3 aria-hidden="true" />
            <span>累計抽選</span>
            <strong>{profile.total_draws.toLocaleString("ja-JP")}枚</strong>
          </div>
          <div>
            <Sparkles aria-hidden="true" />
            <span>熟練度</span>
            <strong>{profile.mastery_score.toLocaleString("ja-JP")} pt</strong>
          </div>
          <div>
            <Trophy aria-hidden="true" />
            <span>完成セット</span>
            <strong>
              {profile.completed_set_keys.length}/{profile.total_sets}組
            </strong>
          </div>
        </section>

        <section className="cafe-profile-ranks" aria-labelledby="profile-ranks-title">
          <div className="cafe-section-heading">
            <div>
              <p className="cafe-kicker">Leaderboard positions</p>
              <h2 id="profile-ranks-title">5部門の順位</h2>
            </div>
          </div>
          <div>
            {leaderboardKeys.map((key) => (
              <a href={sitePath(`cafe-collection/rankings/#ranking-${key}`)} key={key}>
                <span aria-hidden="true">{LEADERBOARD_DETAILS[key].emoji}</span>
                <small>{LEADERBOARD_DETAILS[key].title.replace("ランキング", "")}</small>
                <strong>{profile.ranks[key]}位</strong>
              </a>
            ))}
          </div>
        </section>

        <section className="cafe-profile-sets" aria-labelledby="profile-sets-title">
          <div className="cafe-section-heading">
            <div>
              <p className="cafe-kicker">Set menu progress</p>
              <h2 id="profile-sets-title">セットメニュー</h2>
            </div>
            <p>{profile.completed_set_keys.length}組完成</p>
          </div>
          <div className="cafe-profile-set-grid">
            {catalog.sets.map((set) => {
              const owned = set.required_card_keys.filter((key) => counts.has(key)).length
              const completed = completedSetKeys.has(set.key)
              return (
                <article className={completed ? "is-complete" : undefined} key={set.key}>
                  <span aria-hidden="true">{completed ? "✅" : "🍽️"}</span>
                  <div>
                    <h3>{set.name}</h3>
                    <p>{set.description}</p>
                  </div>
                  <strong>
                    {owned}/{set.required_card_keys.length}
                  </strong>
                </article>
              )
            })}
          </div>
        </section>

        <section className="cafe-profile-cards" aria-labelledby="profile-cards-title">
          <div className="cafe-section-heading">
            <div>
              <p className="cafe-kicker">Collected cards</p>
              <h2 id="profile-cards-title">カード棚</h2>
            </div>
            <p>{visibleCards.length}種を表示</p>
          </div>
          <div className="cafe-profile-filters" aria-label="カード棚の絞り込み">
            <div>
              {(
                [
                  ["owned", "収集済み"],
                  ["missing", "未発見"],
                  ["all", "すべて"]
                ] as const
              ).map(([value, label]) => (
                <button
                  type="button"
                  aria-pressed={ownership === value}
                  onClick={() => setOwnership(value)}
                  key={value}
                >
                  {label}
                </button>
              ))}
            </div>
            <div>
              <button
                type="button"
                aria-pressed={rarity === "all"}
                onClick={() => setRarity("all")}
              >
                全ランク
              </button>
              {RARITIES.map((item) => (
                <button
                  type="button"
                  aria-pressed={rarity === item}
                  onClick={() => setRarity(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          {visibleCards.length ? (
            <div className="cafe-profile-card-grid">
              {visibleCards.map((card) => {
                const owned = counts.get(card.key)
                const count = owned?.count ?? 0
                const lifetimeCount = owned?.lifetime_count ?? 0
                const mastery = currentMastery(catalog, lifetimeCount)
                return (
                  <a
                    href={sitePath(`cafe-collection/cards/${card.key}/`)}
                    className={count ? "is-owned" : "is-missing"}
                    style={{ "--rarity-color": RARITY_DETAILS[card.rarity].color } as CSSProperties}
                    key={card.key}
                  >
                    <div>
                      <img
                        src={getCafeCardImageUrl(card.image_url)}
                        alt=""
                        width="768"
                        height="768"
                        loading="lazy"
                      />
                      <span>{card.rarity}</span>
                    </div>
                    <h3>{card.name}</h3>
                    <small>
                      {count > 0 && mastery
                        ? `${mastery.emoji} ${mastery.name} · 所持${count} / 累計${lifetimeCount}枚`
                        : "未発見"}
                    </small>
                  </a>
                )
              })}
            </div>
          ) : (
            <p className="cafe-profile-empty">条件に合うカードはありません。</p>
          )}
        </section>
      </main>
    </CafeShell>
  )
}

function ProfileAvatar({
  displayName,
  avatarUrl
}: {
  displayName: string
  avatarUrl: string | null
}) {
  const [imageFailed, setImageFailed] = useState(false)

  if (!avatarUrl || imageFailed) {
    return (
      <span className="cafe-profile-avatar-fallback" aria-hidden="true">
        {displayName.slice(0, 1)}
      </span>
    )
  }

  return (
    <img
      className="cafe-profile-avatar"
      src={avatarUrl}
      alt={`${displayName}のDiscordアイコン`}
      width="112"
      height="112"
      referrerPolicy="no-referrer"
      onError={() => setImageFailed(true)}
    />
  )
}

function currentMastery(catalog: CafeCatalog, count: number): CafeMasteryTier | undefined {
  return [...catalog.mastery_tiers].reverse().find((tier) => count >= tier.minimum_count)
}
