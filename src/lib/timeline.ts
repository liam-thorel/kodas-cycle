import { isDurationKind } from '../config'
import { dayKey, startOfDay } from './time'
import type { StoredEvent } from './storage'

export const MINUTES_PER_DAY = 1440

/** Un morceau de duree contenu dans une seule journee. */
export type Bar = {
  event: StoredEvent
  /** Minutes depuis minuit, bornees a la journee affichee. */
  startMin: number
  endMin: number
  /** La duree deborde avant / apres cette journee (dodo a cheval sur minuit). */
  continuesBefore: boolean
  continuesAfter: boolean
  /** Duree encore ouverte : la fin affichee est "maintenant", pas une vraie fin. */
  running: boolean
}

export type Day = {
  key: string
  /** Minuit local de cette journee, pour l'intitule. */
  date: Date
  /** Evenements instantanes survenus ce jour-la. */
  instants: StoredEvent[]
  bars: Bar[]
  /** Entrees dont le debut tombe ce jour-la, pour la liste sous la timeline. */
  entries: StoredEvent[]
}

function minutesFromMidnight(time: number, dayStart: number): number {
  return (time - dayStart) / 60_000
}

/**
 * Regroupe les evenements par journee locale. Une duree qui traverse minuit
 * apparait dans chaque journee qu'elle touche, tronquee aux bornes du jour :
 * un dodo de 22 h a 7 h doit se voir des deux cotes.
 */
export function buildDays(events: StoredEvent[], now: number): Day[] {
  const days = new Map<string, Day>()

  const dayFor = (date: Date): Day => {
    const key = dayKey(date.toISOString())
    let day = days.get(key)
    if (!day) {
      day = { key, date: startOfDay(date), instants: [], bars: [], entries: [] }
      days.set(key, day)
    }
    return day
  }

  for (const event of events) {
    const start = new Date(event.happenedAt)
    dayFor(start).entries.push(event)

    if (!isDurationKind(event.kind)) {
      dayFor(start).instants.push(event)
      continue
    }

    const running = event.endedAt === null
    // Une duree ouverte se dessine jusqu'a maintenant ; si l'horloge est en
    // retard sur la saisie, on garde au moins une barre visible.
    const endTime = running ? Math.max(now, start.getTime()) : new Date(event.endedAt!).getTime()

    let cursor = startOfDay(start)
    while (cursor.getTime() <= endTime) {
      const dayStart = cursor.getTime()
      const dayEnd = startOfDay(new Date(dayStart + 36 * 3_600_000)).getTime() // +1 jour, DST-safe
      const segStart = Math.max(start.getTime(), dayStart)
      const segEnd = Math.min(endTime, dayEnd)
      const spanMinutes = (dayEnd - dayStart) / 60_000

      if (segEnd >= segStart) {
        dayFor(cursor).bars.push({
          event,
          startMin: (minutesFromMidnight(segStart, dayStart) / spanMinutes) * MINUTES_PER_DAY,
          endMin: (minutesFromMidnight(segEnd, dayStart) / spanMinutes) * MINUTES_PER_DAY,
          continuesBefore: start.getTime() < dayStart,
          continuesAfter: endTime > dayEnd,
          running,
        })
      }
      cursor = new Date(dayEnd)
    }
  }

  const ordered = [...days.values()].sort((a, b) => b.date.getTime() - a.date.getTime())
  for (const day of ordered) {
    day.instants.sort(
      (a, b) => new Date(a.happenedAt).getTime() - new Date(b.happenedAt).getTime(),
    )
    day.bars.sort((a, b) => a.startMin - b.startMin)
  }
  return ordered
}

/**
 * Decale vers le bas les etiquettes trop proches pour qu'elles restent lisibles,
 * sans jamais remonter au-dessus de leur position reelle de plus d'un cran.
 */
export function stagger(positions: number[], minGap: number): number[] {
  const out: number[] = []
  let previous = -Infinity
  for (const position of positions) {
    const placed = Math.max(position, previous + minGap)
    out.push(placed)
    previous = placed
  }
  return out
}

/** Duree effective d'un evenement en ms, `null` si ce n'est pas une duree. */
export function durationMs(event: StoredEvent, now: number): number | null {
  if (!isDurationKind(event.kind)) return null
  const start = new Date(event.happenedAt).getTime()
  const end = event.endedAt ? new Date(event.endedAt).getTime() : now
  return Math.max(0, end - start)
}
