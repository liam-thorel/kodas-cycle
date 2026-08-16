export const EVENT_KINDS = ['pipi', 'caca', 'repas', 'promenade', 'dodo'] as const

export type EventKind = (typeof EVENT_KINDS)[number]

export type PuppyEvent = {
  id: string
  kind: EventKind
  /** Debut de l'evenement (ISO 8601, UTC). Pour un instant, c'est le moment. */
  happenedAt: string
  /**
   * Fin, pour les types a duree (promenade, dodo). `null` sur un type
   * instantane, ou sur une duree encore en cours.
   */
  endedAt: string | null
  /** Prenom de la personne qui a saisi l'entree. */
  author: string
  note: string | null
  /** Quand l'entree a ete saisie, pour distinguer temps reel et rattrapage. */
  createdAt: string
}

export type NewEvent = {
  kind: EventKind
  happenedAt: string
  endedAt?: string | null
  author: string
  note?: string | null
}

export type SyncStatus = 'local' | 'connecting' | 'live' | 'error'

/** Une duree ouverte : demarree, pas encore terminee. */
export function isRunning(event: PuppyEvent, durationKinds: readonly EventKind[]): boolean {
  return durationKinds.includes(event.kind) && event.endedAt === null
}
