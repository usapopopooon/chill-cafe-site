import { useEffect, useMemo, useRef } from "react"
import type {
  SocialGraph,
  SocialGraphEdge,
  SocialGraphNode,
  UserProfile
} from "@/features/member/types"

interface MemberSocialGraphProps {
  graph: SocialGraph
  profile: UserProfile
}

interface DrawNode extends SocialGraphNode {
  x: number
  y: number
  radius: number
  distance: number
  seed: number
  tone: NodeTone
}

type NodeTone = "voice" | "text" | "received" | "given"

const NODE_TONES: Record<NodeTone, { label: string; color: string; glow: string }> = {
  voice: {
    label: "通話",
    color: "#5eead4",
    glow: "rgba(94,234,212,0.28)"
  },
  text: {
    label: "発言",
    color: "#93c5fd",
    glow: "rgba(147,197,253,0.26)"
  },
  received: {
    label: "反応される",
    color: "#f9a8d4",
    glow: "rgba(249,168,212,0.25)"
  },
  given: {
    label: "反応する",
    color: "#fde68a",
    glow: "rgba(253,230,138,0.24)"
  }
}

function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededUnit(seed: number): number {
  const next = Math.sin(seed * 12.9898) * 43758.5453
  return next - Math.floor(next)
}

function pairKey(userA: string, userB: string) {
  return [userA, userB].sort().join(":")
}

function edgeOtherUserId(edge: SocialGraphEdge, userId: string) {
  if (edge.source_user_id === userId) return edge.target_user_id
  if (edge.target_user_id === userId) return edge.source_user_id
  return null
}

function getDistances(edges: SocialGraphEdge[], startUserId: string) {
  const adjacency = new Map<string, string[]>()
  for (const edge of edges) {
    const source = edge.source_user_id
    const target = edge.target_user_id
    adjacency.set(source, [...(adjacency.get(source) ?? []), target])
    adjacency.set(target, [...(adjacency.get(target) ?? []), source])
  }

  const distances = new Map<string, number>([[startUserId, 0]])
  const queue = [startUserId]
  for (let index = 0; index < queue.length; index += 1) {
    const userId = queue[index]
    const distance = distances.get(userId) ?? 0
    for (const nextUserId of adjacency.get(userId) ?? []) {
      if (distances.has(nextUserId)) continue
      distances.set(nextUserId, distance + 1)
      queue.push(nextUserId)
    }
  }
  return distances
}

function nodeAlpha(distance: number) {
  if (distance === 0) return 1
  if (distance === 1) return 0.86
  if (distance === 2) return 0.42
  return 0.2
}

function edgeAlpha(distance: number) {
  if (distance === 0) return 0.54
  if (distance === 1) return 0.26
  if (distance === 2) return 0.12
  return 0.06
}

function nodeTone(node: SocialGraphNode): NodeTone {
  const voiceScore = node.voice_seconds / 120
  const scores: Array<[NodeTone, number]> = [
    ["voice", voiceScore],
    ["text", node.message_count],
    ["received", node.reactions_received],
    ["given", node.reactions_given]
  ]
  return scores.sort((left, right) => right[1] - left[1])[0][0]
}

function buildDrawNodes(graph: SocialGraph, profile: UserProfile) {
  const nodesById = new Map(graph.nodes.map((node) => [node.user_id, node]))
  const centerNode: SocialGraphNode = nodesById.get(profile.user_id) ?? {
    user_id: profile.user_id,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    weight:
      profile.total_messages +
      profile.total_reactions_received +
      profile.total_reactions_given +
      profile.total_voice_seconds / 600,
    message_count: profile.total_messages,
    voice_seconds: profile.total_voice_seconds,
    reactions_received: profile.total_reactions_received,
    reactions_given: profile.total_reactions_given
  }
  nodesById.set(profile.user_id, centerNode)

  const distances = getDistances(graph.edges, profile.user_id)
  for (const userId of Array.from(nodesById.keys())) {
    if (userId !== profile.user_id && !distances.has(userId)) {
      nodesById.delete(userId)
    }
  }

  const maxWeight = Math.max(1, ...Array.from(nodesById.values()).map((node) => node.weight))
  const edgeWeights = new Map<string, number>()
  for (const edge of graph.edges) {
    edgeWeights.set(pairKey(edge.source_user_id, edge.target_user_id), edge.weight)
  }

  const sortedNodes = Array.from(nodesById.values()).sort((left, right) => {
    const leftDistance = distances.get(left.user_id) ?? 99
    const rightDistance = distances.get(right.user_id) ?? 99
    if (leftDistance !== rightDistance) return leftDistance - rightDistance
    const leftStrength = edgeWeights.get(pairKey(profile.user_id, left.user_id)) ?? 0
    const rightStrength = edgeWeights.get(pairKey(profile.user_id, right.user_id)) ?? 0
    return rightStrength - leftStrength || right.weight - left.weight
  })

  const ringIndexes = new Map<number, number>()
  const ringCounts = new Map<number, number>()
  for (const node of sortedNodes) {
    const distance = distances.get(node.user_id) ?? 3
    ringCounts.set(distance, (ringCounts.get(distance) ?? 0) + 1)
  }

  return sortedNodes.map((node): DrawNode => {
    const distance = distances.get(node.user_id) ?? 3
    if (node.user_id === profile.user_id) {
      return {
        ...node,
        x: 0.5,
        y: 0.5,
        radius: 34,
        distance: 0,
        seed: hashString(`${node.user_id}:center`),
        tone: nodeTone(node)
      }
    }

    const ringIndex = ringIndexes.get(distance) ?? 0
    ringIndexes.set(distance, ringIndex + 1)
    const seed = hashString(`${node.user_id}:${graph.days}`)
    const countOnRing = ringCounts.get(distance) ?? 1
    const angle = (Math.PI * 2 * ringIndex) / Math.max(countOnRing, 1) + seededUnit(seed) * 0.38
    const ring = distance === 1 ? 0.24 : distance === 2 ? 0.36 : 0.44
    const verticalSquash = distance === 1 ? 0.72 : 0.66

    return {
      ...node,
      x: 0.5 + Math.cos(angle) * ring,
      y: 0.5 + Math.sin(angle) * ring * verticalSquash,
      radius: 16 + Math.sqrt(node.weight / maxWeight) * 13,
      distance,
      seed,
      tone: nodeTone(node)
    }
  })
}

export function MemberSocialGraph({ graph, profile }: MemberSocialGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawNodes = useMemo(() => buildDrawNodes(graph, profile), [graph, profile])
  const hasConnections = drawNodes.some((node) => node.user_id !== profile.user_id)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context || !hasConnections) return

    const el = canvas
    let width = 0
    let height = 0
    let frame = 0
    let animationId = 0
    const ctx = context
    const nodeById = new Map(drawNodes.map((node) => [node.user_id, node]))
    const drawEdges = graph.edges.filter(
      (edge) => nodeById.has(edge.source_user_id) && nodeById.has(edge.target_user_id)
    )
    const nodesByDepth = [...drawNodes].sort(
      (left, right) => right.distance - left.distance || left.radius - right.radius
    )
    const maxEdgeWeight = Math.max(1, ...drawEdges.map((edge) => edge.weight))
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    function resize() {
      const rect = el.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      width = Math.max(320, rect.width)
      height = Math.max(340, rect.height)
      el.width = Math.floor(width * dpr)
      el.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (motionQuery.matches) {
        drawFrame()
      }
    }

    function screenPosition(node: DrawNode) {
      if (node.distance === 0) {
        return { x: width * 0.5, y: height * 0.5 }
      }
      const drift = Math.sin(frame * 0.012 + node.seed) * 2.2
      const float = Math.cos(frame * 0.01 + node.seed) * 1.8
      return { x: node.x * width + drift, y: node.y * height + float }
    }

    function drawBackground() {
      ctx.fillStyle = "#080808"
      ctx.fillRect(0, 0, width, height)

      ctx.save()
      ctx.translate(width * 0.5, height * 0.5)
      ctx.strokeStyle = "rgba(255,255,255,0.06)"
      ctx.lineWidth = 1
      for (const radius of [0.24, 0.36, 0.44]) {
        ctx.beginPath()
        ctx.ellipse(0, 0, width * radius, height * radius * 0.68, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()

      ctx.save()
      ctx.globalAlpha = 0.12
      for (let index = 0; index < 28; index += 1) {
        const seed = index * 101
        const x = seededUnit(seed) * width
        const y = seededUnit(seed + 1) * height
        const radius = 0.6 + seededUnit(seed + 2) * 1.4
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = "#ffffff"
        ctx.fill()
      }
      ctx.restore()
    }

    function drawNode(node: DrawNode) {
      const position = screenPosition(node)
      const pulse = node.distance === 0 ? 0 : Math.sin(frame * 0.028 + node.seed) * 0.8
      const radius = node.radius + pulse
      const tone = NODE_TONES[node.tone]
      const gradient = ctx.createRadialGradient(
        position.x - radius * 0.28,
        position.y - radius * 0.32,
        radius * 0.12,
        position.x,
        position.y,
        radius
      )
      gradient.addColorStop(0, "rgba(255,255,255,0.92)")
      gradient.addColorStop(0.34, tone.color)
      gradient.addColorStop(1, "rgba(20,20,20,0.92)")

      ctx.save()
      ctx.globalAlpha = nodeAlpha(node.distance)
      ctx.beginPath()
      ctx.arc(position.x, position.y, radius + 8, 0, Math.PI * 2)
      ctx.fillStyle = tone.glow
      ctx.fill()

      ctx.beginPath()
      ctx.arc(position.x, position.y, radius + 2, 0, Math.PI * 2)
      ctx.strokeStyle = node.distance === 0 ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.38)"
      ctx.lineWidth = node.distance === 0 ? 2.2 : 1.1
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(position.x, position.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      ctx.beginPath()
      ctx.arc(position.x, position.y, radius * 0.42, 0, Math.PI * 2)
      ctx.strokeStyle = node.distance === 0 ? "rgba(8,8,8,0.42)" : "rgba(8,8,8,0.3)"
      ctx.lineWidth = Math.max(1, radius * 0.14)
      ctx.stroke()
      ctx.restore()
    }

    function drawFrame() {
      frame += 1
      drawBackground()

      for (const edge of drawEdges) {
        const source = nodeById.get(edge.source_user_id)!
        const target = nodeById.get(edge.target_user_id)!
        const sourcePosition = screenPosition(source)
        const targetPosition = screenPosition(target)
        const centerSide = edgeOtherUserId(edge, profile.user_id)
        const distance = centerSide ? 0 : Math.min(source.distance, target.distance)
        const strength = Math.min(edge.weight / maxEdgeWeight, 1)
        const alpha = Math.min(0.8, edgeAlpha(distance) + strength * 0.16)
        const bend = Math.sin(frame * 0.008 + source.seed + target.seed) * 7
        const midX = (sourcePosition.x + targetPosition.x) / 2
        const midY = (sourcePosition.y + targetPosition.y) / 2

        ctx.beginPath()
        ctx.moveTo(sourcePosition.x, sourcePosition.y)
        ctx.quadraticCurveTo(midX, midY + bend, targetPosition.x, targetPosition.y)
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`
        ctx.lineWidth = 0.7 + strength * 3
        ctx.lineCap = "round"
        ctx.stroke()
      }

      for (const node of nodesByDepth) {
        drawNode(node)
      }
    }

    function draw() {
      drawFrame()
      animationId = requestAnimationFrame(draw)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    if (motionQuery.matches) {
      drawFrame()
    } else {
      draw()
    }

    return () => {
      cancelAnimationFrame(animationId)
      observer.disconnect()
    }
  }, [drawNodes, graph.edges, hasConnections, profile.user_id])

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">つながりのかたち</h2>
        <p className="text-sm text-white/45">直近 {graph.days} 日・匿名表示</p>
      </div>
      <div className="h-[360px] overflow-hidden rounded-xl border bg-black sm:h-[460px]">
        {hasConnections ? (
          <canvas
            ref={canvasRef}
            className="block h-full w-full"
            aria-label="ユーザー中心の交流マップ"
          />
        ) : (
          <div className="grid h-full place-items-center px-6 text-center">
            <p className="text-sm text-white/45">この期間の交流データがありません。</p>
          </div>
        )}
      </div>
      {hasConnections ? (
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/45" aria-label="交流マップの凡例">
          <span>中心に近いほど関係が近く、線が太いほど交流が多いです。</span>
          {Object.entries(NODE_TONES).map(([key, tone]) => (
            <span key={key} className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: tone.color }}
                aria-hidden="true"
              />
              {tone.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}
