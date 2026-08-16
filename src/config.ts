import type { EventKind } from './types'

/** Change ces deux valeurs et l'app entiere suit. */
export const PUPPY_NAME = 'Koda'

/** Au-dela de ce delai sans pipi ni caca, l'app passe en alerte "ca fait longtemps". */
export const OVERDUE_MINUTES = 180

export const KIND_META: Record<
  EventKind,
  { label: string; emoji: string; color: string; quick: boolean }
> = {
  pipi: { label: 'Pipi', emoji: '💦', color: '#facc15', quick: true },
  caca: { label: 'Caca', emoji: '💩', color: '#b07d4e', quick: true },
  repas: { label: 'Repas', emoji: '🍖', color: '#fb7185', quick: false },
  promenade: { label: 'Promenade', emoji: '🦮', color: '#4ade80', quick: false },
  dodo: { label: 'Dodo', emoji: '😴', color: '#818cf8', quick: false },
}

/** Les deux types qui declenchent l'alerte de sortie. */
export const RELIEF_KINDS: EventKind[] = ['pipi', 'caca']
