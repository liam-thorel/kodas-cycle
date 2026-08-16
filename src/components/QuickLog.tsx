import { KIND_META } from '../config'
import { formatSpan } from '../lib/time'
import type { StoredEvent } from '../lib/storage'
import { EVENT_KINDS, type EventKind } from '../types'

type Props = {
  /** Types instantanes : un tap = un evenement horodate a maintenant. */
  onLog: (kind: EventKind) => void
  /** Types a duree : demarrer, puis terminer. */
  onStart: (kind: EventKind) => void
  onStop: (event: StoredEvent) => void
  /** Les durees actuellement ouvertes, par type. */
  running: Partial<Record<EventKind, StoredEvent>>
  justLogged: EventKind | null
  now: number
}

export function QuickLog({ onLog, onStart, onStop, running, justLogged, now }: Props) {
  const primary = EVENT_KINDS.filter((kind) => KIND_META[kind].quick)
  const secondary = EVENT_KINDS.filter((kind) => !KIND_META[kind].quick)

  const render = (kind: EventKind, large: boolean) => {
    const meta = KIND_META[kind]
    const open = running[kind]

    if (meta.duration) {
      return (
        <DurationButton
          key={kind}
          kind={kind}
          open={open ?? null}
          now={now}
          onStart={() => onStart(kind)}
          onStop={() => open && onStop(open)}
        />
      )
    }
    return (
      <button
        key={kind}
        type="button"
        className={`log-btn${large ? ' log-btn-lg' : ''}${justLogged === kind ? ' log-btn-flash' : ''}`}
        style={{ '--accent': meta.color } as React.CSSProperties}
        onClick={() => onLog(kind)}
      >
        <span className="log-emoji" aria-hidden="true">
          {meta.emoji}
        </span>
        <span className="log-label">{meta.label}</span>
      </button>
    )
  }

  return (
    <section className="quick">
      <div className="quick-primary">{primary.map((kind) => render(kind, true))}</div>
      <div className="quick-secondary">{secondary.map((kind) => render(kind, false))}</div>
    </section>
  )
}

/**
 * Un seul bouton pour les deux gestes : il demarre quand rien n'est en cours,
 * et affiche le chrono puis termine quand une duree est ouverte.
 */
function DurationButton({
  kind,
  open,
  now,
  onStart,
  onStop,
}: {
  kind: EventKind
  open: StoredEvent | null
  now: number
  onStart: () => void
  onStop: () => void
}) {
  const meta = KIND_META[kind]
  const elapsed = open ? now - new Date(open.happenedAt).getTime() : 0

  return (
    <button
      type="button"
      className={`log-btn${open ? ' log-btn-running' : ''}`}
      style={{ '--accent': meta.color } as React.CSSProperties}
      onClick={open ? onStop : onStart}
      aria-label={open ? `Terminer ${meta.label}` : `Démarrer ${meta.label}`}
    >
      <span className="log-emoji" aria-hidden="true">
        {meta.emoji}
      </span>
      <span className="log-label">{meta.label}</span>
      {open ? (
        <span className="log-running">
          <span className="log-running-time">{formatSpan(elapsed)}</span>
          <span className="log-running-action">terminer</span>
        </span>
      ) : (
        <span className="log-hint">démarrer</span>
      )}
    </button>
  )
}
