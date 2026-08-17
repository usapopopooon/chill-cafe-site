import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter
} from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { registerSW } from "virtual:pwa-register"
import { App } from "@/app"
import {
  CafeCardRoutePage,
  CafeCollectionRoutePage,
  CafeProfileRoutePage,
  CafeRankingsRoutePage
} from "@/features/cafe-collection/lazy-routes"
import { MemberRoutePage } from "@/features/member/lazy-route"
import "./index.css"

const normalizeDays = (value: unknown) => {
  const days = Number(value ?? 30)

  if (!Number.isFinite(days)) {
    return 30
  }

  return Math.min(3650, Math.max(1, Math.round(days)))
}

const rootRoute = createRootRoute({
  component: () => <Outlet />
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: App
})

const memberRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/u/$userId/level",
  validateSearch: (search) => ({
    days: normalizeDays(search.days)
  }),
  component: () => {
    const { userId } = memberRoute.useParams()
    const { days } = memberRoute.useSearch()

    return <MemberRoutePage userId={userId} days={days} />
  }
})

const cafeCollectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cafe-collection",
  component: CafeCollectionRoutePage
})

const cafeRankingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cafe-collection/rankings",
  component: CafeRankingsRoutePage
})

const cafeProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cafe-collection/profile",
  validateSearch: (search) => ({
    id: typeof search.id === "string" ? search.id : ""
  }),
  component: () => {
    const { id } = cafeProfileRoute.useSearch()
    return <CafeProfileRoutePage profileId={id} />
  }
})

const cafeCardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cafe-collection/cards/$cardKey",
  component: () => {
    const { cardKey } = cafeCardRoute.useParams()
    return <CafeCardRoutePage cardKey={cardKey} />
  }
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  memberRoute,
  cafeCollectionRoute,
  cafeRankingsRoute,
  cafeProfileRoute,
  cafeCardRoute
])
const routerBasepath =
  import.meta.env.BASE_URL === "/" ? "/" : import.meta.env.BASE_URL.replace(/\/$/, "")
const router = createRouter({ routeTree, basepath: routerBasepath })
const queryClient = new QueryClient()

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

registerSW({ immediate: true })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)
