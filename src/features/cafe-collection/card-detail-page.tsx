import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ArrowRight, Gift, Layers3, Sparkles } from "lucide-react"
import { getCafeCardImageUrl, getCafeCatalog } from "@/features/cafe-collection/api"
import { CafeError, CafeLoading, CafeShell } from "@/features/cafe-collection/cafe-shell"
import { RARITY_DETAILS } from "@/features/cafe-collection/presentation"
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

  return (
    <CafeShell>
      <main className="cafe-detail-main">
        <a href={sitePath("cafe-collection/")} className="cafe-back-link">
          <ArrowLeft aria-hidden="true" />
          全カード図鑑へ
        </a>

        <article className="cafe-card-detail">
          <div className="cafe-detail-image">
            <img
              src={getCafeCardImageUrl(card.image_url)}
              alt={card.name}
              width="768"
              height="768"
            />
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
                {card.rarity}の基本排出率は
                <strong>{catalogQuery.data.rarity_rates_percent[card.rarity]}%</strong>です。
                未収集カードの優遇により、同じレアリティ内のカード別確率は人によって変わります。
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
                  <span aria-hidden="true">🍽️</span>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <small>{item.required_card_keys.length}枚で完成</small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <nav className="cafe-card-pagination" aria-label="前後のカード">
          {previous ? (
            <a href={sitePath(`cafe-collection/cards/${previous.key}/`)}>
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
            </a>
          ) : (
            <span />
          )}
        </nav>
      </main>
    </CafeShell>
  )
}
