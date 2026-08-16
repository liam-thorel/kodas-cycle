import { KIND_META } from '../config'
import { MINUTES_PER_DAY, stagger, type Day } from '../lib/timeline'
import { formatSpan, formatTime } from '../lib/time'

/** Hauteur du rail en pixels : 24 h tiennent dedans, ~23 px par heure. */
const RAIL_HEIGHT = 552
/** Ecart vertical minimal entre deux etiquettes pour qu'elles restent lisibles. */
const LABEL_GAP = 22

const HOUR_MARKS = [0, 3, 6, 9, 12, 15, 18, 21]

function toPx(minutes: number): number {
  return (minutes / MINUTES_PER_DAY) * RAIL_HEIGHT
}

/**
 * Une journee de 24 h en vue verticale : les durees en barres a gauche,
 * les evenements ponctuels en points etiquetes a droite.
 */
export function DayTimeline({ day, now }: { day: Day; now: number }) {
  const nowMinutes =
    new Date(now).toDateString() === day.date.toDateString()
      ? (now - day.date.getTime()) / 60_000
      : null

  const labelTops = stagger(
    day.instants.map((event) => toPx((new Date(event.happenedAt).getTime() - day.date.getTime()) / 60_000)),
    LABEL_GAP,
  )

  return (
    <div className="rail" style={{ height: RAIL_HEIGHT }}>
      {HOUR_MARKS.map((hour) => (
        <div key={hour} className="rail-hour" style={{ top: toPx(hour * 60) }}>
          <span className="rail-hour-label">{String(hour).padStart(2, '0')}h</span>
          <span className="rail-hour-line" />
        </div>
      ))}

      {nowMinutes !== null && (
        <div className="rail-now" style={{ top: toPx(nowMinutes) }}>
          <span className="rail-now-line" />
        </div>
      )}

      <div className="rail-bars">
        {day.bars.map((bar) => {
          const meta = KIND_META[bar.event.kind]
          const top = toPx(bar.startMin)
          const height = Math.max(4, toPx(bar.endMin - bar.startMin))
          const classes = [
            'bar',
            bar.running ? 'bar-running' : '',
            bar.continuesBefore ? 'bar-from-before' : '',
            bar.continuesAfter ? 'bar-to-after' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <div
              key={`${bar.event.id}-${bar.startMin}`}
              className={classes}
              style={{ top, height, '--accent': meta.color } as React.CSSProperties}
              title={`${meta.label} ${formatTime(bar.event.happenedAt)}${
                bar.event.endedAt ? ` → ${formatTime(bar.event.endedAt)}` : ' (en cours)'
              }`}
            >
              <span className="bar-emoji" aria-hidden="true">
                {meta.emoji}
              </span>
            </div>
          )
        })}
      </div>

      <div className="rail-instants">
        {day.instants.map((event, index) => {
          const meta = KIND_META[event.kind]
          const realTop = toPx((new Date(event.happenedAt).getTime() - day.date.getTime()) / 60_000)
          return (
            <div key={event.id} className="mark" style={{ '--accent': meta.color } as React.CSSProperties}>
              <span className="mark-dot" style={{ top: realTop }} />
              <span className="mark-label" style={{ top: labelTops[index] }}>
                <span aria-hidden="true">{meta.emoji}</span>
                <span className="mark-time">{formatTime(event.happenedAt)}</span>
                <span className="mark-name">{meta.label}</span>
              </span>
            </div>
          )
        })}
      </div>

      {day.bars.length === 0 && day.instants.length === 0 && (
        <p className="rail-empty muted">Rien ce jour-là</p>
      )}
    </div>
  )
}

/** Total du temps passe par type a duree, affiche sous la timeline. */
export function DayDurations({ day, now }: { day: Day; now: number }) {
  const totals = new Map<string, number>()
  for (const bar of day.bars) {
    const minutes = bar.endMin - bar.startMin
    totals.set(bar.event.kind, (totals.get(bar.event.kind) ?? 0) + minutes)
  }
  if (totals.size === 0) return null

  return (
    <div className="day-totals">
      {[...totals.entries()].map(([kind, minutes]) => {
        const meta = KIND_META[kind as keyof typeof KIND_META]
        return (
          <span key={kind} className="day-total" style={{ '--accent': meta.color } as React.CSSProperties}>
            <span aria-hidden="true">{meta.emoji}</span> {formatSpan(minutes * 60_000)}
          </span>
        )
      })}
      {day.bars.some((bar) => bar.running) && <span className="muted">(en cours, à {formatTime(new Date(now).toISOString())})</span>}
    </div>
  )
}
