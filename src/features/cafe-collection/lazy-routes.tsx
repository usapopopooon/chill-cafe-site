import { Suspense, lazy } from "react"

const CafeCollectionPage = lazy(async () => {
  const page = await import("@/features/cafe-collection/catalog-page")
  return { default: page.CafeCollectionPage }
})
const CafeRankingsPage = lazy(async () => {
  const page = await import("@/features/cafe-collection/rankings-page")
  return { default: page.CafeRankingsPage }
})
const CafeCardDetailPage = lazy(async () => {
  const page = await import("@/features/cafe-collection/card-detail-page")
  return { default: page.CafeCardDetailPage }
})

function CafeRouteFallback() {
  return (
    <main className="grid min-h-screen place-content-center bg-[#f7f0e2] px-5 text-center text-[#392f28]">
      <span className="text-5xl" aria-hidden="true">
        ☕
      </span>
      <p className="mt-4 text-sm font-bold" role="status">
        カフェ台帳を開いています…
      </p>
    </main>
  )
}

export function CafeCollectionRoutePage() {
  return (
    <Suspense fallback={<CafeRouteFallback />}>
      <CafeCollectionPage />
    </Suspense>
  )
}

export function CafeRankingsRoutePage() {
  return (
    <Suspense fallback={<CafeRouteFallback />}>
      <CafeRankingsPage />
    </Suspense>
  )
}

export function CafeCardRoutePage({ cardKey }: { cardKey: string }) {
  return (
    <Suspense fallback={<CafeRouteFallback />}>
      <CafeCardDetailPage cardKey={cardKey} />
    </Suspense>
  )
}
