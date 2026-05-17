import type { Meta, StoryObj } from "@storybook/react-vite"
import { Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "予約する"
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost"]
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"]
    }
  }
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Coffee className="size-4" />
        コーヒーを見る
      </>
    )
  }
}

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "アクセス"
  }
}
