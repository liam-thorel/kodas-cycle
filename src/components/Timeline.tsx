import { KIND_META, isDurationKind } from '../config'
import { formatDayLabel, formatSpan, formatTime } from '../lib/time'
import { buildDays, durationMs } from '../lib/timeline'
import { DayDurations, DayTimeline } from './DayTimeline'
import type { StoredEvent } from '../lib/storage'

type Props = {
  events: StoredEvent[]
  now: number
  onRemove: (id: string) => void
  onStop: (event: StoredEvent) => void
}

/** Le journal : une timeline visuelle par journee, suivie du detail de la journee. */
export function Timeline({ events, now, onRemove, onStop }: Props) {
  if (events.length === 0) {
    return <p className="empty muted">Rien de noté pour l'instant.</p>
  }

  const days = buildDays(events, now)

  return (
    <div className="timeline">
      {days.map((day) => (
        <section key={day.key} className="day">
          <h3 className="day-title">
            {formatDayLabel(day.date.toISOString())}
            <span className="day-count">{day.entries.length}</span>
          </h3>

          <DayTimeline day={day} now={now} />
          <DayDurations day={day} now={now} />

          <ul className="day-list">
            {day.entries.map((event) => (
              <Row key={event.id} event={event} now={now} onRemove={onRemove} onStop={onStop} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Row({
  event,
  now,
  onRemove,
  onStop,
}: {
  event: StoredEvent
  now: number
  onRemove: (id: string) => void
  onStop: (event: StoredEvent) => void
}) {
  const meta = KIND_META[event.kind]
  // Ecart notable entre le moment vecu et la saisie => c'est un rattrapage.
  const backdated =
    new Date(event.createdAt).getTime() - new Date(event.happenedAt).getTime() > 5 * 60_000
  const running = isDurationKind(event.kind) && event.endedAt === null
  const length = durationMs(event, now)

  return (
    <li className="row" style={{ '--accent': meta.color } as React.CSSProperties}>
      <span className="row-emoji" aria-hidden="true">
        {meta.emoji}
      </span>
      <span className="row-main">
        <span className="row-title">
          {meta.label}
          {length !== null && <span className="row-length">{formatSpan(length)}</span>}
          {running && <span className="tag tag-running">en cours</span>}
          {backdated && (
            <span className="tag" title="Saisi après coup">
              après coup
            </span>
          )}
          {event.pending === 'upsert' && (
            <span className="tag tag-pending" title="Pas encore synchronisé">
              en attente
            </span>
          )}
        </span>
        {event.note && <span className="row-note muted">{event.note}</span>}
        <span className="row-meta muted">par {event.author}</span>
      </span>

      <span className="row-time">
        {formatTime(event.happenedAt)}
        {event.endedAt && <span className="row-time-end">→ {formatTime(event.endedAt)}</span>}
      </span>

      {running ? (
        <button type="button" className="row-stop" onClick={() => onStop(event)}>
          Terminer
        </button>
      ) : (
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
      )}
    </li>
  )
}
