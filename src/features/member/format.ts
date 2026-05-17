export function formatNumber(value: number): string {
  return value.toLocaleString()
}

export function formatSeconds(totalSeconds: number): string {
  let total = Math.round(totalSeconds)

  if (total < 0) {
    total = 0
  }

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

export function formatHoursDecimal(totalSeconds: number): number {
  return Math.round((totalSeconds / 3600) * 100) / 100
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)

  return `${date.getMonth() + 1}/${date.getDate()}`
}
