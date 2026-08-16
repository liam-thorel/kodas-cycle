import { KIND_META } from '../config'
import { EVENT_KINDS, type EventKind } from '../types'

type Props = {
  onLog: (kind: EventKind) => void
  justLogged: EventKind | null
}

/**
 * Le geste principal : un tap = un evenement horodate a maintenant.
 * Pipi et caca en grand, le reste en rang secondaire.
 */
export function QuickLog({ onLog, justLogged }: Props) {
  const primary = EVENT_KINDS.filter((kind) => KIND_META[kind].quick)
  const secondary = EVENT_KINDS.filter((kind) => !KIND_META[kind].quick)

  return (
    <section className="quick">
      <div className="quick-primary">
        {primary.map((kind) => (
          <QuickButton key={kind} kind={kind} onLog={onLog} flash={justLogged === kind} large />
        ))}
      </div>
      <div className="quick-secondary">
        {secondary.map((kind) => (
          <QuickButton key={kind} kind={kind} onLog={onLog} flash={justLogged === kind} />
        ))}
      </div>
    </section>
  )
}

function QuickButton({
  kind,
  onLog,
  flash,
  large = false,
}: {
  kind: EventKind
  onLog: (kind: EventKind) => void
  flash: boolean
  large?: boolean
}) {
  const meta = KIND_META[kind]
  return (
    <button
      type="button"
      className={`log-btn${large ? ' log-btn-lg' : ''}${flash ? ' log-btn-flash' : ''}`}
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
