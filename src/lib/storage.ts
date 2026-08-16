import type { PuppyEvent } from '../types'

const EVENTS_KEY = 'kodas-cycle:events:v1'
const AUTHOR_KEY = 'kodas-cycle:author:v1'

/**
 * Un evenement tel qu'il vit sur l'appareil. `pending` marque les ecritures
 * qui n'ont pas encore atteint Supabase : elles sont rejouees a la reconnexion,
 * ce qui rend l'app utilisable dans le jardin sans reseau.
 */
export type StoredEvent = PuppyEvent & { pending?: 'insert' | 'delete' }

export function readCache(): StoredEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StoredEvent[]) : []
  } catch {
    return []
  }
}

export function writeCache(events: StoredEvent[]): void {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
  } catch {
    // Quota plein ou storage bloque : l'app continue avec l'etat en memoire.
  }
}

export function readAuthor(): string | null {
  try {
    return localStorage.getItem(AUTHOR_KEY)
  } catch {
    return null
  }
}

export function writeAuthor(author: string): void {
  try {
    localStorage.setItem(AUTHOR_KEY, author)
  } catch {
    // idem
  }
}

/**
 * Le plus recent en premier. A egalite de `happenedAt` — deux taps dans la meme
 * milliseconde — la saisie la plus recente passe devant.
 */
export function sortEvents(events: StoredEvent[]): StoredEvent[] {
  return [...events].sort((a, b) => {
    const byHappened = new Date(b.happenedAt).getTime() - new Date(a.happenedAt).getTime()
    if (byHappened !== 0) return byHappened
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
