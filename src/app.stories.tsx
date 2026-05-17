import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { App } from "@/app"

const meta = {
  title: "Pages/App",
  component: App,
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false
          }
        }
      })

      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      )
    }
  ],
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof App>

export default meta

type Story = StoryObj<typeof meta>

export const Top: Story = {}
