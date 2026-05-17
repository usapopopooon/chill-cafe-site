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
import { MemberPage } from "@/features/member/member-page"
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
  path: "/members/$userId",
  validateSearch: (search) => ({
    days: normalizeDays(search.days)
  }),
  component: () => {
    const { userId } = memberRoute.useParams()
    const { days } = memberRoute.useSearch()

    return <MemberPage userId={userId} days={days} />
  }
})

const memberAliasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/u/$userId",
  validateSearch: (search) => ({
    days: normalizeDays(search.days)
  }),
  component: () => {
    const { userId } = memberAliasRoute.useParams()
    const { days } = memberAliasRoute.useSearch()

    return <MemberPage userId={userId} days={days} />
  }
})

const routeTree = rootRoute.addChildren([indexRoute, memberRoute, memberAliasRoute])
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
