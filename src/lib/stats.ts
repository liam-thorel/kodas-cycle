import { RELIEF_KINDS, OVERDUE_MINUTES } from '../config'
import { dayKey } from './time'
import type { EventKind, PuppyEvent } from '../types'

export type KindSummary = {
  kind: EventKind
  last: PuppyEvent | null
  today: number
  perDay: number | null
}

/** Dernier evenement d'un type donne (la liste arrive deja triee, recent en tete). */
export function lastOf(events: PuppyEvent[], kinds: EventKind[]): PuppyEvent | null {
  return events.find((e) => kinds.includes(e.kind)) ?? null
}

export function countToday(events: PuppyEvent[], kind: EventKind): number {
  const today = dayKey(new Date().toISOString())
  return events.filter((e) => e.kind === kind && dayKey(e.happenedAt) === today).length
}

/**
 * Moyenne par jour sur les jours reellement observes, en excluant aujourd'hui
 * qui n'est pas termine et tirerait la moyenne vers le bas.
 */
export function averagePerDay(events: PuppyEvent[], kind: EventKind): number | null {
  const today = dayKey(new Date().toISOString())
  const byDay = new Map<string, number>()
  for (const event of events) {
    if (event.kind !== kind) continue
    const key = dayKey(event.happenedAt)
    if (key === today) continue
    byDay.set(key, (byDay.get(key) ?? 0) + 1)
  }
  if (byDay.size === 0) return null
  const total = [...byDay.values()].reduce((sum, n) => sum + n, 0)
  return total / byDay.size
}

export function summarize(events: PuppyEvent[], kind: EventKind): KindSummary {
  return {
    kind,
    last: lastOf(events, [kind]),
    today: countToday(events, kind),
    perDay: averagePerDay(events, kind),
  }
}

/** Temps ecoule depuis la derniere sortie, et si le seuil d'alerte est franchi. */
export function reliefStatus(events: PuppyEvent[], now: number = Date.now()) {
  const last = lastOf(events, RELIEF_KINDS)
  if (!last) return { last: null, elapsedMs: null, overdue: false }
  const elapsedMs = now - new Date(last.happenedAt).getTime()
  return { last, elapsedMs, overdue: elapsedMs > OVERDUE_MINUTES * 60_000 }
}

/**
 * Repartition horaire des sorties (24 seaux), pour reperer les creneaux habituels.
 */
export function hourlyHistogram(events: PuppyEvent[]): number[] {
  const buckets = new Array(24).fill(0)
  for (const event of events) {
    if (!RELIEF_KINDS.includes(event.kind)) continue
    buckets[new Date(event.happenedAt).getHours()] += 1
  }
  return buckets
}
