import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowRight,
  Gift,
  Images,
  Layers3,
  Maximize2,
  Percent,
  Sparkles
} from "lucide-react"
import { getCafeCardImageUrl, getCafeCatalog } from "@/features/cafe-collection/api"
import { CafeError, CafeLoading, CafeShell } from "@/features/cafe-collection/cafe-shell"
import { DEFAULT_CAFE_RULES, RARITY_DETAILS } from "@/features/cafe-collection/presentation"
import type { CafeCard } from "@/features/cafe-collection/types"
import { usePageMeta } from "@/features/cafe-collection/use-page-meta"

const sitePath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`

export function CafeCardDetailPage({ cardKey }: { cardKey: string }) {
  const catalogQuery = useQuery({
    queryKey: ["cafe-collection", "catalog"],
    queryFn: getCafeCatalog,
    staleTime: 60 * 60 * 1000
  })
  const card = catalogQuery.data?.cards.find((item) => item.key === cardKey)
  usePageMeta({
    title: card ? `${card.name} | カフェ・コレクション` : "カード詳細 | カフェ・コレクション",
    description: card?.description ?? "CHILLカフェのカフェ・コレクションカード詳細。",
    canonicalPath: `cafe-collection/cards/${encodeURIComponent(cardKey)}`,
    imageUrl: card ? getCafeCardImageUrl(card.image_url) : undefined,
    imageAlt: card ? `${card.name}のカフェ・コレクションカード` : undefined,
    imageType: card ? "image/jpeg" : undefined,
    imageWidth: card ? 768 : undefined,
    imageHeight: card ? 768 : undefined,
    ogType: card ? "article" : undefined
  })

  if (catalogQuery.isLoading) {
    return (
      <CafeShell>
        <CafeLoading label="カードを探しています…" />
      </CafeShell>
    )
  }
  if (catalogQuery.isError) {
    return (
      <CafeShell>
        <CafeError message="カード図鑑を読み込めませんでした。" />
      </CafeShell>
    )
  }
  if (!catalogQuery.data || !card) {
    return (
      <CafeShell>
        <main className="cafe-not-found">
          <span aria-hidden="true">☕</span>
          <h1>そのカードは見つかりませんでした</h1>
          <a href={sitePath("cafe-collection/")}>図鑑へ戻る</a>
        </main>
      </CafeShell>
    )
  }

  const cardIndex = catalogQuery.data.cards.findIndex((item) => item.key === card.key)
  const previous = catalogQuery.data.cards[cardIndex - 1]
  const next = catalogQuery.data.cards[cardIndex + 1]
  const relatedSets = catalogQuery.data.sets.filter((item) =>
    item.required_card_keys.includes(card.key)
  )
  const cardsByKey = new Map(catalogQuery.data.cards.map((item) => [item.key, item]))
  const setRelatedCards = relatedSets.flatMap((set) =>
    set.required_card_keys
      .map((key) => cardsByKey.get(key))
      .filter((item): item is CafeCard => Boolean(item))
  )
  const relatedCards = [
    ...setRelatedCards,
    ...catalogQuery.data.cards.filter((item) => item.rarity === card.rarity)
  ]
    .filter(
      (item, index, items) =>
        item.key !== card.key &&
        items.findIndex((candidate) => candidate.key === item.key) === index
    )
    .slice(0, 6)
  const imageUrl = getCafeCardImageUrl(card.image_url)
  const rules = catalogQuery.data.rules ?? DEFAULT_CAFE_RULES

  return (
    <CafeShell>
      <main className="cafe-detail-main">
        <a href={sitePath("cafe-collection/")} className="cafe-back-link">
          <ArrowLeft aria-hidden="true" />
          全カード図鑑へ
        </a>

        <article className="cafe-card-detail">
          <div className="cafe-detail-image">
            <a href={imageUrl} target="_blank" rel="noreferrer">
              <img src={imageUrl} alt={card.name} width="768" height="768" />
              <span>
                <Maximize2 aria-hidden="true" />
                カード画像を大きく見る
              </span>
            </a>
          </div>
          <div className="cafe-detail-copy">
            <div className="cafe-detail-labels">
              <span
                className="cafe-rarity-badge"
                style={
                  { "--rarity-color": RARITY_DETAILS[card.rarity].color } as React.CSSProperties
                }
              >
                {card.rarity} · {RARITY_DETAILS[card.rarity].label}
              </span>
              <span>{card.is_food ? "食べ物" : "飲み物"}</span>
            </div>
            <p className="cafe-kicker">Collection no. {String(cardIndex + 1).padStart(3, "0")}</p>
            <h1>{card.name}</h1>
            <p className="cafe-detail-description">{card.description}</p>

            <dl className="cafe-card-facts">
              <div>
                <dt>
                  <Percent aria-hidden="true" />
                  カード別基準確率
                </dt>
                <dd>{formatPercent(card.base_draw_rate_percent)}</dd>
              </div>
              <div>
                <dt>
                  <Sparkles aria-hidden="true" />
                  {card.rarity}全体の確率
                </dt>
                <dd>{formatPercent(catalogQuery.data.rarity_rates_percent[card.rarity])}</dd>
              </div>
              <div>
                <dt>
                  <Gift aria-hidden="true" />
                  獲得XP
                </dt>
                <dd>{card.draw_reward_xp.toLocaleString("ja-JP")} XP</dd>
              </div>
              <div>
                <dt>
                  <Layers3 aria-hidden="true" />
                  重複交換
                </dt>
                <dd>{card.exchange_xp.toLocaleString("ja-JP")} XP / 枚</dd>
              </div>
            </dl>

            <div className="cafe-probability-note">
              <Sparkles aria-hidden="true" />
              <p>
                カード別基準確率は通常時の目安です。未収集カードは同じレアリティ内で
                <strong>{rules.unowned_weight_multiplier}倍</strong>
                優遇されるため、実際のカード別確率は所持状況によって変わります。
              </p>
            </div>
          </div>
        </article>

        {relatedSets.length > 0 && (
          <section className="cafe-related-sets">
            <p className="cafe-kicker">Set menus</p>
            <h2>このカードを使うセット</h2>
            <div>
              {relatedSets.map((item) => (
                <article key={item.key}>
                  <div>
                    <span aria-hidden="true">🍽️</span>
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <small>{item.required_card_keys.length}枚で完成</small>
                    </div>
                  </div>
                  <ul>
                    {item.required_card_keys.map((requiredKey) => {
                      const requiredCard = cardsByKey.get(requiredKey)
                      if (!requiredCard) return null
                      return (
                        <li key={requiredCard.key}>
                          <a href={sitePath(`cafe-collection/cards/${requiredCard.key}/`)}>
                            <img
                              src={getCafeCardImageUrl(requiredCard.image_url)}
                              alt=""
                              width="768"
                              height="768"
                              loading="lazy"
                            />
                            <span>{requiredCard.name}</span>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        )}

        {relatedCards.length > 0 && (
          <section className="cafe-related-cards">
            <div className="cafe-section-heading">
              <div>
                <p className="cafe-kicker">More from the archive</p>
                <h2>あわせて眺めたいカード</h2>
              </div>
              <p>
                <Images aria-hidden="true" />
                同じセット・レアリティから
              </p>
            </div>
            <div>
              {relatedCards.map((item) => (
                <a
                  href={sitePath(`cafe-collection/cards/${item.key}/`)}
                  key={item.key}
                  className="cafe-related-card"
                >
                  <img
                    src={getCafeCardImageUrl(item.image_url)}
                    alt=""
                    width="768"
                    height="768"
                    loading="lazy"
                  />
                  <span>{item.rarity}</span>
                  <strong>{item.name}</strong>
                </a>
              ))}
            </div>
          </section>
        )}

        <nav className="cafe-card-pagination" aria-label="前後のカード">
          {previous ? (
            <a href={sitePath(`cafe-collection/cards/${previous.key}/`)}>
              <img
                src={getCafeCardImageUrl(previous.image_url)}
                alt=""
                width="768"
                height="768"
                loading="lazy"
              />
              <ArrowLeft aria-hidden="true" />
              <span>
                <small>前のカード</small>
                {previous.name}
              </span>
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a href={sitePath(`cafe-collection/cards/${next.key}/`)}>
              <span>
                <small>次のカード</small>
                {next.name}
              </span>
              <ArrowRight aria-hidden="true" />
              <img
                src={getCafeCardImageUrl(next.image_url)}
                alt=""
                width="768"
                height="768"
                loading="lazy"
              />
            </a>
          ) : (
            <span />
          )}
        </nav>
      </main>
    </CafeShell>
  )
}

function formatPercent(value: number | undefined) {
  return typeof value === "number" ? `${value.toFixed(2)}%` : "準備中"
}
