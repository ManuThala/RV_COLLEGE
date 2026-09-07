export function shuffle<T>(items: T[]): T[] {
  const clone = [...items]
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[clone[i], clone[j]] = [clone[j], clone[i]]
  }
  return clone
}

export function pickRandom<T>(items: T[], avoid?: T): T {
  const safeItems = avoid === undefined ? items : items.filter((item) => item !== avoid)
  return safeItems[Math.floor(Math.random() * safeItems.length)]
}

export function randomItem<T>(items: T[]): T | undefined {
  if (!items.length) return undefined
  return items[Math.floor(Math.random() * items.length)]
}
