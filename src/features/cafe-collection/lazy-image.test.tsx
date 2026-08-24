import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { CafeLazyImage } from "@/features/cafe-collection/lazy-image"

type ObserverCallback = IntersectionObserverCallback

class IntersectionObserverStub {
  static callback: ObserverCallback | undefined

  constructor(callback: ObserverCallback) {
    IntersectionObserverStub.callback = callback
  }

  disconnect = vi.fn()
  observe = vi.fn()
  takeRecords = vi.fn(() => [])
  unobserve = vi.fn()
  root = null
  rootMargin = "600px 0px"
  thresholds = [0]
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  IntersectionObserverStub.callback = undefined
})

it("sets the image URL only when the image approaches the viewport", () => {
  vi.stubGlobal("IntersectionObserver", IntersectionObserverStub)
  render(<CafeLazyImage src="https://example.com/card.jpg" alt="カード" width="768" height="768" />)

  const image = screen.getByRole("img", { name: "カード" })
  expect(image).not.toHaveAttribute("src")
  expect(image).toHaveAttribute("loading", "lazy")
  expect(image).toHaveAttribute("decoding", "async")

  act(() => {
    IntersectionObserverStub.callback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver
    )
  })

  expect(image).toHaveAttribute("src", "https://example.com/card.jpg")
})

it("loads normally when IntersectionObserver is unavailable", () => {
  vi.stubGlobal("IntersectionObserver", undefined)
  render(<CafeLazyImage src="https://example.com/card.jpg" alt="カード" />)

  expect(screen.getByRole("img", { name: "カード" })).toHaveAttribute(
    "src",
    "https://example.com/card.jpg"
  )
})
