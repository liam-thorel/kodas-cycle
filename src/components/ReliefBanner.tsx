import { OVERDUE_MINUTES, PUPPY_NAME } from '../config'
import { formatDuration, formatTime } from '../lib/time'
import type { PuppyEvent } from '../types'

type Props = {
  last: PuppyEvent | null
  elapsedMs: number | null
  overdue: boolean
}

/** L'info la plus utile de l'app : ca fait combien de temps ? */
export function ReliefBanner({ last, elapsedMs, overdue }: Props) {
  if (!last || elapsedMs === null) {
    return (
      <section className="banner">
        <p className="banner-label">Dernière sortie</p>
        <p className="banner-value">Aucune entrée</p>
        <p className="banner-sub muted">Appuie sur un bouton ci-dessous pour commencer.</p>
      </section>
    )
  }

  return (
    <section className={overdue ? 'banner banner-overdue' : 'banner'}>
      <p className="banner-label">Dernière sortie</p>
      <p className="banner-value">{formatDuration(elapsedMs)}</p>
      <p className="banner-sub muted">
        {last.kind === 'caca' ? '💩 Caca' : '💦 Pipi'} à {formatTime(last.happenedAt)} · noté par{' '}
        {last.author}
      </p>
      {overdue && (
        <p className="banner-alert">
          Plus de {formatDuration(OVERDUE_MINUTES * 60_000)} sans sortie — {PUPPY_NAME} a
          probablement besoin d'aller dehors.
        </p>
      )}
    </section>
  )
}
