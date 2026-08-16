import type { PuppyEvent } from '../types'

const EVENTS_KEY = 'kodas-cycle:events:v1'
const AUTHOR_KEY = 'kodas-cycle:author:v1'

/**
 * Un evenement tel qu'il vit sur l'appareil. `pending` marque les ecritures
 * qui n'ont pas encore atteint Supabase : elles sont rejouees a la reconnexion,
 * ce qui rend l'app utilisable dans le jardin sans reseau.
 *
 * `upsert` couvre la creation et la modification (terminer une promenade),
 * les deux se resolvant en un seul upsert cote serveur.
 */
export type StoredEvent = PuppyEvent & { pending?: 'upsert' | 'delete' }

export function readCache(): StoredEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // `endedAt` est arrive apres la v1 : les entrees d'avant n'en ont pas.
    return (parsed as StoredEvent[]).map((event) => ({ ...event, endedAt: event.endedAt ?? null }))
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
