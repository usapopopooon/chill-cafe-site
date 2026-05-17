export function formatNumber(value: number): string {
  return value.toLocaleString("ja-JP")
}

export function formatSeconds(totalSeconds: number): string {
  const total = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }

  return `${seconds}s`
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return dateString
  }

  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function formatRank(rank: number | null): string {
  return rank ? `#${formatNumber(rank)}` : "-"
}
