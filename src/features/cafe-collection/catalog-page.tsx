import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Search, Sparkles, Trophy, Utensils } from "lucide-react"
import { useMemo, useState } from "react"
import { getCafeCardImageUrl, getCafeCatalog } from "@/features/cafe-collection/api"
import { CafeError, CafeLoading, CafeShell } from "@/features/cafe-collection/cafe-shell"
import { RARITIES, RARITY_DETAILS } from "@/features/cafe-collection/presentation"
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
              <a href={sitePath("cafe-collection/rankings/")} className="cafe-secondary-link">
                <Trophy aria-hidden="true" />
                ランキング
              </a>
            </div>
          </div>
          <div className="cafe-hero-ledger" aria-label="図鑑の概要">
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
        <span>
          詳細を見る
          <ArrowRight aria-hidden="true" />
        </span>
      </div>
    </a>
  )
}
