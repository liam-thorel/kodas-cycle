import { KIND_META } from '../config'
import { dayKey, formatDayLabel, formatTime } from '../lib/time'
import type { StoredEvent } from '../lib/storage'

type Props = {
  events: StoredEvent[]
  onRemove: (id: string) => void
}

/** Historique groupe par jour, le plus recent en haut. */
export function Timeline({ events, onRemove }: Props) {
  if (events.length === 0) {
    return <p className="empty muted">Rien de noté pour l'instant.</p>
  }

  const groups: { key: string; items: StoredEvent[] }[] = []
  for (const event of events) {
    const key = dayKey(event.happenedAt)
    const current = groups.at(-1)
    if (current?.key === key) current.items.push(event)
    else groups.push({ key, items: [event] })
  }

  return (
    <div className="timeline">
      {groups.map((group) => (
        <section key={group.key} className="day">
          <h3 className="day-title">
            {formatDayLabel(group.items[0].happenedAt)}
            <span className="day-count">{group.items.length}</span>
          </h3>
          <ul className="day-list">
            {group.items.map((event) => (
              <Row key={event.id} event={event} onRemove={onRemove} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Row({ event, onRemove }: { event: StoredEvent; onRemove: (id: string) => void }) {
  const meta = KIND_META[event.kind]
  // Ecart notable entre le moment vecu et la saisie => c'est un rattrapage.
  const backdated =
    new Date(event.createdAt).getTime() - new Date(event.happenedAt).getTime() > 5 * 60_000

  return (
    <li className="row" style={{ '--accent': meta.color } as React.CSSProperties}>
      <span className="row-emoji" aria-hidden="true">
        {meta.emoji}
      </span>
      <span className="row-main">
        <span className="row-title">
          {meta.label}
          {backdated && (
            <span className="tag" title="Saisi après coup">
              après coup
            </span>
          )}
          {event.pending === 'insert' && (
            <span className="tag tag-pending" title="Pas encore synchronisé">
              en attente
            </span>
          )}
        </span>
        {event.note && <span className="row-note muted">{event.note}</span>}
        <span className="row-meta muted">par {event.author}</span>
      </span>
      <span className="row-time">{formatTime(event.happenedAt)}</span>
      <button
        type="button"
        className="row-del"
        aria-label={`Supprimer ${meta.label} de ${formatTime(event.happenedAt)}`}
        onClick={() => {
          if (confirm(`Supprimer ce ${meta.label.toLowerCase()} ?`)) onRemove(event.id)
        }}
      >
        ×
      </button>
    </li>
  )
}
