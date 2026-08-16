export const EVENT_KINDS = ['pipi', 'caca', 'repas', 'promenade', 'dodo'] as const

export type EventKind = (typeof EVENT_KINDS)[number]

export type PuppyEvent = {
  id: string
  kind: EventKind
  /** Quand l'evenement s'est reellement produit (ISO 8601, UTC). */
  happenedAt: string
  /** Prenom de la personne qui a saisi l'entree. */
  author: string
  note: string | null
  /** Quand l'entree a ete saisie, pour distinguer temps reel et rattrapage. */
  createdAt: string
}

export type NewEvent = {
  kind: EventKind
  happenedAt: string
  author: string
  note?: string | null
}

export type SyncStatus = 'local' | 'connecting' | 'live' | 'error'
