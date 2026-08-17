import { ArrowLeft, BookOpen, Coffee, Trophy } from "lucide-react"
import type { ReactNode } from "react"
import "@/features/cafe-collection/cafe-collection.css"

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`
const sitePath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`

export function CafeShell({ children }: { children: ReactNode }) {
  return (
    <div className="cafe-collection-page min-h-screen">
      <header className="cafe-site-header">
        <div className="cafe-site-header-inner">
          <a href={sitePath("cafe-collection/")} className="cafe-brand">
            <img src={assetUrl("server-icon.png")} alt="" aria-hidden="true" />
            <span>
              <small>CHILLカフェ</small>
              カフェ・コレクション
            </span>
          </a>
          <nav aria-label="カフェ・コレクション">
            <a href={sitePath("cafe-collection/")}>
              <BookOpen aria-hidden="true" />
              図鑑
            </a>
            <a href={sitePath("cafe-collection/rankings/")}>
              <Trophy aria-hidden="true" />
              ランキング
            </a>
            <a href={sitePath("")} className="cafe-home-link">
              <ArrowLeft aria-hidden="true" />
              サーバー紹介
            </a>
          </nav>
        </div>
      </header>
      {children}
      <footer className="cafe-site-footer">
        <Coffee aria-hidden="true" />
        <p>カードはDiscordのカフェカウンターで引けます。</p>
        <a href="https://discord.com/invite/chill-cafe" target="_blank" rel="noreferrer">
          CHILLカフェへ
        </a>
      </footer>
    </div>
  )
}

export function CafeLoading({ label = "カフェ台帳を開いています…" }: { label?: string }) {
  return (
    <div className="cafe-state" aria-live="polite" aria-busy="true">
      <span className="cafe-loading-cup" aria-hidden="true">
        ☕
      </span>
      <p>{label}</p>
    </div>
  )
}

export function CafeError({ message }: { message: string }) {
  return (
    <div className="cafe-state cafe-error" role="alert">
      <span aria-hidden="true">🫖</span>
      <h1>台帳を開けませんでした</h1>
      <p>{message}</p>
      <button type="button" onClick={() => window.location.reload()}>
        もう一度読み込む
      </button>
    </div>
  )
}
