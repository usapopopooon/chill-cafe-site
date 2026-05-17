import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
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

describe("App", () => {
  it("renders the Discord server widget", () => {
    renderApp()

    expect(screen.getByRole("heading", { level: 1, name: "🍭CHILLカフェ" })).toBeInTheDocument()
    expect(
      screen.getAllByText("雑談・作業・ゲーム・お酒、まったりいろんなチルをするためのサーバー。")
    ).toHaveLength(2)
    expect(screen.getAllByRole("link", { name: "Join Server" })[0]).toHaveAttribute(
      "href",
      "https://discord.com/servers/chillkahue-1168847276291137586"
    )
    expect(screen.getByTitle("Discord server widget")).toHaveAttribute(
      "src",
      "https://discord.com/widget?id=1168847276291137586&theme=dark"
    )
  })
})
