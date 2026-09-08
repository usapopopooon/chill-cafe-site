import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { ProfileHeader } from "@/features/member/member-page"
import type { UserProfile } from "@/features/member/types"

const profile: UserProfile = {
  user_id: "2001",
  display_name: "うさぽ",
  avatar_url: null,
  cafe_collection_profile_id: "0123456789abcdef01234567",
  total_messages: 10,
  total_voice_seconds: 20,
  total_reactions_received: 30,
  total_reactions_given: 40,
  rank_messages: 1,
  rank_voice: 2,
  rank_reactions_received: 3,
  rank_reactions_given: 4,
  daily: [],
  top_channels: []
}

afterEach(cleanup)

describe("ProfileHeader", () => {
  it("links Cafe Collection participants to their own shelf", () => {
    render(<ProfileHeader profile={profile} days={30} />)

    expect(screen.getByRole("link", { name: "うさぽさんのカフェ棚を見る" })).toHaveAttribute(
      "href",
      "/cafe-collection/profile/?id=0123456789abcdef01234567"
    )
  })

  it("does not show a shelf link for nonparticipants", () => {
    render(<ProfileHeader profile={{ ...profile, cafe_collection_profile_id: null }} days={30} />)

    expect(screen.queryByRole("link", { name: /カフェ棚を見る/ })).not.toBeInTheDocument()
  })
})
