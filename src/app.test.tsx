import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { App } from "@/app"

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}

function mockCatalog(totalCards: number, totalSets = 11) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          total_cards: totalCards,
          sets: Array.from({ length: totalSets }, (_, index) => ({ key: `set-${index}` }))
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      )
    )
  )
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("App", () => {
  it("renders the Discord server widget", () => {
    mockCatalog(154)
    renderApp()

    expect(screen.getByRole("heading", { level: 1, name: "🍭CHILLカフェ" })).toBeInTheDocument()
    expect(
      screen.getAllByText("雑談・作業・ゲーム・お酒、まったりいろんなチルをするためのサーバー。")
    ).toHaveLength(2)
    expect(screen.getAllByRole("link", { name: "Join Server" })[0]).toHaveAttribute(
      "href",
      "https://discord.com/invite/chill-cafe"
    )
    expect(screen.getByTitle("Discord server widget")).toHaveAttribute(
      "src",
      "https://discord.com/widget?id=1168847276291137586&theme=dark"
    )
  })

  it("shows the card count returned by the level-bot catalog", async () => {
    mockCatalog(211, 17)
    renderApp()

    expect(
      await screen.findByRole("heading", {
        name: "出がらしから幻の茶葉まで、211種のカフェ図鑑。"
      })
    ).toBeInTheDocument()
    expect(screen.getByText("211")).toBeInTheDocument()
    expect(screen.getByText("常設カード")).toBeInTheDocument()
    expect(screen.getByText("17")).toBeInTheDocument()
    expect(screen.getByText("セットメニュー")).toBeInTheDocument()
  })
})
