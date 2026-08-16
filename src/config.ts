import type { EventKind } from './types'

/** Change ces deux valeurs et l'app entiere suit. */
export const PUPPY_NAME = 'Koda'

/** Au-dela de ce delai sans pipi ni caca, l'app passe en alerte "ca fait longtemps". */
export const OVERDUE_MINUTES = 180

export type KindMeta = {
  label: string
  emoji: string
  color: string
  /** Presente dans les gros boutons du haut. */
  quick: boolean
  /** Se mesure avec un debut et une fin, au lieu d'un simple horodatage. */
  duration: boolean
}

export const KIND_META: Record<EventKind, KindMeta> = {
  pipi: { label: 'Pipi', emoji: '💦', color: '#facc15', quick: true, duration: false },
  caca: { label: 'Caca', emoji: '💩', color: '#b07d4e', quick: true, duration: false },
  repas: { label: 'Repas', emoji: '🍖', color: '#fb7185', quick: false, duration: false },
  promenade: { label: 'Promenade', emoji: '🦮', color: '#4ade80', quick: false, duration: true },
  dodo: { label: 'Dodo', emoji: '😴', color: '#818cf8', quick: false, duration: true },
}

/** Les deux types qui declenchent l'alerte de sortie. */
export const RELIEF_KINDS: EventKind[] = ['pipi', 'caca']

/** Les types mesures en duree, derives de KIND_META pour rester en phase. */
export const DURATION_KINDS = (Object.keys(KIND_META) as EventKind[]).filter(
  (kind) => KIND_META[kind].duration,
)

export function isDurationKind(kind: EventKind): boolean {
  return KIND_META[kind].duration
}
