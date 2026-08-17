import { useQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Coins,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Utensils
} from "lucide-react"
import { useMemo, useState } from "react"
import { getCafeCardImageUrl, getCafeCatalog } from "@/features/cafe-collection/api"
import { CafeError, CafeLoading, CafeShell } from "@/features/cafe-collection/cafe-shell"
import {
  DEFAULT_CAFE_RULES,
  RARITIES,
  RARITY_DETAILS
} from "@/features/cafe-collection/presentation"
import type { CafeCard, CafeRarity } from "@/features/cafe-collection/types"
import { usePageMeta } from "@/features/cafe-collection/use-page-meta"

type KindFilter = "all" | "drink" | "food"

const sitePath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`

export function CafeCollectionPage() {
  usePageMeta({
    title: "カフェ・コレクション図鑑 | CHILLカフェ",
    description:
      "CHILLカフェで集められる全120種のカード図鑑。歴史的な飲み物や食べ物、喫茶店の名品を紹介します。",
    canonicalPath: "cafe-collection"
  })
  const catalogQuery = useQuery({
    queryKey: ["cafe-collection", "catalog"],
    queryFn: getCafeCatalog,
    staleTime: 60 * 60 * 1000
  })
  const [query, setQuery] = useState("")
  const [rarity, setRarity] = useState<CafeRarity | "all">("all")
  const [kind, setKind] = useState<KindFilter>("all")

  const visibleCards = useMemo(() => {
    if (!catalogQuery.data) return []
    const normalizedQuery = query.trim().toLocaleLowerCase("ja")
    return catalogQuery.data.cards.filter((card) => {
      const matchesQuery =
        !normalizedQuery ||
        `${card.name} ${card.description}`.toLocaleLowerCase("ja").includes(normalizedQuery)
      const matchesRarity = rarity === "all" || card.rarity === rarity
      const matchesKind = kind === "all" || (kind === "food" ? card.is_food : !card.is_food)
      return matchesQuery && matchesRarity && matchesKind
    })
  }, [catalogQuery.data, kind, query, rarity])

  if (catalogQuery.isLoading) {
    return (
      <CafeShell>
        <CafeLoading />
      </CafeShell>
    )
  }

  if (catalogQuery.isError || !catalogQuery.data) {
    return (
      <CafeShell>
        <CafeError message="少し時間をおいて、もう一度お試しください。" />
      </CafeShell>
    )
  }

  const catalog = catalogQuery.data
  const rules = catalog.rules ?? DEFAULT_CAFE_RULES
  const heroCards = ["k-pan", "scone", "hon-gyokuro"]
    .map((key) => catalog.cards.find((card) => card.key === key))
    .filter((card): card is CafeCard => Boolean(card))
  const showcaseCards = heroCards.length === 3 ? heroCards : catalog.cards.slice(0, 3)
  const cardsByKey = new Map(catalog.cards.map((card) => [card.key, card]))
  const minimumRewardXp = Math.min(...catalog.cards.map((card) => card.draw_reward_xp))
  const maximumRewardXp = Math.max(...catalog.cards.map((card) => card.draw_reward_xp))

  return (
    <CafeShell>
      <main>
        <section className="cafe-hero">
          <div className="cafe-hero-copy">
            <p className="cafe-kicker">The permanent cafe archive</p>
            <h1>
              一杯とひと皿の、
              <br />
              ちいさな博物館。
            </h1>
            <p className="cafe-hero-lead">
              出がらしから幻の茶葉まで。Discordのカフェカウンターで出会える品々を、
              由来や小話と一緒に眺められる常設図鑑です。
            </p>
            <div className="cafe-hero-actions">
              <a href="#catalog" className="cafe-primary-link">
                図鑑を見る
                <ArrowRight aria-hidden="true" />
              </a>
              <a href="#guide" className="cafe-secondary-link">
                <BookOpen aria-hidden="true" />
                遊び方・確率
              </a>
              <a href={sitePath("cafe-collection/rankings/")} className="cafe-secondary-link">
                <Trophy aria-hidden="true" />
                ランキング
              </a>
            </div>
          </div>
          <div className="cafe-hero-showcase" aria-label="図鑑のカード見本と概要">
            <div className="cafe-hero-card-fan">
              {showcaseCards.map((card) => (
                <a href={sitePath(`cafe-collection/cards/${card.key}/`)} key={card.key}>
                  <img
                    src={getCafeCardImageUrl(card.image_url)}
                    alt={`${card.name}のカードを見る`}
                    width="768"
                    height="768"
                  />
                  <span>{card.name}</span>
                </a>
              ))}
            </div>
            <div className="cafe-hero-ledger">
              <span className="cafe-ledger-clip" aria-hidden="true" />
              <p>COLLECTION LEDGER</p>
              <strong>{catalog.total_cards}</strong>
              <span>常設カード</span>
              <dl>
                <div>
                  <dt>食べ物</dt>
                  <dd>{catalog.food_cards}種</dd>
                </div>
                <div>
                  <dt>飲み物</dt>
                  <dd>{catalog.total_cards - catalog.food_cards}種</dd>
                </div>
                <div>
                  <dt>セット</dt>
                  <dd>{catalog.sets.length}組</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="cafe-rarity-strip" aria-label="レアリティ別の基本排出率">
          {RARITIES.map((item) => (
            <div
              key={item}
              style={{ "--rarity-color": RARITY_DETAILS[item].color } as React.CSSProperties}
            >
              <span>{item}</span>
              <strong>{catalog.rarity_rates_percent[item]}%</strong>
              <small>{catalog.rarity_counts[item]}種</small>
            </div>
          ))}
          <p>基本排出率。未収集優遇や救済時は、同じレアリティ内の内訳が変わります。</p>
        </section>

        <section id="guide" className="cafe-guide-section">
          <div className="cafe-section-heading">
            <div>
              <p className="cafe-kicker">How to collect</p>
              <h2>遊び方と大事なルール</h2>
            </div>
            <p>Discordのカフェカウンターから参加できます</p>
          </div>
          <div className="cafe-guide-grid">
            <article>
              <Clock3 aria-hidden="true" />
              <div>
                <h3>毎日{rules.free_draws_per_day}枚は無料</h3>
                <p>
                  無料分は日本時間0時に更新。2枚目以降は
                  <strong>{rules.paid_draw_cost_xp} XP</strong>で、1時間
                  {rules.hourly_draw_limit}枚まで。1日の合計上限はありません。
                </p>
              </div>
            </article>
            <article>
              <Coins aria-hidden="true" />
              <div>
                <h3>引くたびXPは黒字</h3>
                <p>
                  1枚につき
                  <strong>
                    {minimumRewardXp}〜{maximumRewardXp} XP
                  </strong>
                  を獲得。 有料分を差し引いても最低+
                  {minimumRewardXp - rules.paid_draw_cost_xp} XPです。
                </p>
              </div>
            </article>
            <article>
              <Sparkles aria-hidden="true" />
              <div>
                <h3>未収集カードを優遇</h3>
                <p>
                  同じレアリティ内では未収集が
                  <strong>{rules.unowned_weight_multiplier}倍</strong>出やすくなります。
                  {rules.endgame_pity_min_collected}種以降、NEWなしが
                  {rules.endgame_pity_duplicate_draws}回続くと次は未所持確定です。
                </p>
              </div>
            </article>
            <article>
              <ShieldCheck aria-hidden="true" />
              <div>
                <h3>最初の1枚は必ず残る</h3>
                <p>
                  XP・カフェメダルへ交換できるのは重複した2枚目以降だけ。
                  最初の1枚が一括交換で消えることはありません。
                </p>
              </div>
            </article>
          </div>
          <div className="cafe-mastery-path" aria-label="カード熟練度の段階">
            <span>同じカードを集めると熟練度アップ</span>
            <ol>
              {catalog.mastery_tiers.map((tier) => (
                <li key={tier.name}>
                  <b aria-hidden="true">{tier.emoji}</b>
                  <strong>{tier.name}</strong>
                  <small>累計{tier.minimum_count}枚〜</small>
                </li>
              ))}
            </ol>
          </div>
          <p className="cafe-personal-note">
            <ShieldCheck aria-hidden="true" />
            このページは公開図鑑です。自分の所持カード、現在XP、重複交換はDiscordの
            「自分の棚・重複交換」から確認してください。抽選結果はカフェ台帳に公開されます。
          </p>
        </section>

        <section className="cafe-set-section">
          <div className="cafe-section-heading">
            <div>
              <p className="cafe-kicker">Set menu archive</p>
              <h2>セットメニュー図鑑</h2>
            </div>
            <p>{catalog.sets.length}組の組み合わせ</p>
          </div>
          <div className="cafe-set-grid">
            {catalog.sets.map((set) => (
              <article className="cafe-set-card" key={set.key}>
                <div>
                  <span aria-hidden="true">🍽️</span>
                  <div>
                    <h3>{set.name}</h3>
                    <p>{set.description}</p>
                  </div>
                </div>
                <ul>
                  {set.required_card_keys.map((cardKey) => {
                    const card = cardsByKey.get(cardKey)
                    if (!card) return null
                    return (
                      <li key={card.key}>
                        <a href={sitePath(`cafe-collection/cards/${card.key}/`)}>
                          <img
                            src={getCafeCardImageUrl(card.image_url)}
                            alt=""
                            width="768"
                            height="768"
                            loading="lazy"
                          />
                          <span>{card.name}</span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="catalog" className="cafe-catalog-section">
          <div className="cafe-section-heading">
            <div>
              <p className="cafe-kicker">Complete catalog</p>
              <h2>全カード図鑑</h2>
            </div>
            <p>
              <Sparkles aria-hidden="true" />
              {visibleCards.length} / {catalog.total_cards}種を表示
            </p>
          </div>

          <div className="cafe-filters">
            <label className="cafe-search">
              <Search aria-hidden="true" />
              <span className="sr-only">カードを検索</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="名前や解説から探す"
              />
            </label>
            <div className="cafe-filter-row" aria-label="レアリティで絞り込む">
              <button
                type="button"
                aria-pressed={rarity === "all"}
                onClick={() => setRarity("all")}
              >
                すべて
              </button>
              {RARITIES.map((item) => (
                <button
                  type="button"
                  key={item}
                  aria-pressed={rarity === item}
                  onClick={() => setRarity(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="cafe-filter-row" aria-label="種類で絞り込む">
              {(
                [
                  ["all", "すべて"],
                  ["drink", "飲み物"],
                  ["food", "食べ物"]
                ] as const
              ).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={kind === value}
                  onClick={() => setKind(value)}
                >
                  {value === "food" && <Utensils aria-hidden="true" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {visibleCards.length ? (
            <div className="cafe-card-grid">
              {visibleCards.map((card) => (
                <CatalogCard key={card.key} card={card} />
              ))}
            </div>
          ) : (
            <div className="cafe-empty-result">
              <span aria-hidden="true">🫘</span>
              <h3>条件に合うカードがありません</h3>
              <p>検索語か絞り込みを変えてみてください。</p>
            </div>
          )}
        </section>
      </main>
    </CafeShell>
  )
}

function CatalogCard({ card }: { card: CafeCard }) {
  return (
    <a href={sitePath(`cafe-collection/cards/${card.key}/`)} className="cafe-catalog-card">
      <div className="cafe-card-image-wrap">
        <img
          src={getCafeCardImageUrl(card.image_url)}
          alt={card.name}
          width="768"
          height="768"
          loading="lazy"
        />
        <span
          className="cafe-rarity-badge"
          style={{ "--rarity-color": RARITY_DETAILS[card.rarity].color } as React.CSSProperties}
        >
          {card.rarity}
        </span>
        <span className="cafe-kind-badge">{card.is_food ? "食べ物" : "飲み物"}</span>
      </div>
      <div className="cafe-card-copy">
        <h3>{card.name}</h3>
        <p>{card.description}</p>
        <div className="cafe-card-quick-facts">
          <small>基準 {formatPercent(card.base_draw_rate_percent)}</small>
          <small>獲得 {card.draw_reward_xp.toLocaleString("ja-JP")} XP</small>
        </div>
        <span>
          詳細を見る
          <ArrowRight aria-hidden="true" />
        </span>
      </div>
    </a>
  )
}

function formatPercent(value: number | undefined) {
  return typeof value === "number" ? `${value.toFixed(2)}%` : "準備中"
}
