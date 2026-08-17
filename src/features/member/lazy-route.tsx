import { Suspense, lazy } from "react"

const MemberPage = lazy(async () => {
  const page = await import("@/features/member/member-page")
  return { default: page.MemberPage }
})

export function MemberRoutePage({ userId, days }: { userId: string; days: number }) {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-content-center bg-[#fff5fa] px-5 text-center text-[#4a3342]">
          <span className="text-5xl" aria-hidden="true">
            📊
          </span>
          <p className="mt-4 text-sm font-bold" role="status">
            レベル記録を読み込んでいます…
          </p>
        </main>
      }
    >
      <MemberPage userId={userId} days={days} />
    </Suspense>
  )
}
