import { KIND_META } from '../config'
import { hourlyHistogram, summarize } from '../lib/stats'
import { formatSpan, formatElapsed } from '../lib/time'
import { EVENT_KINDS, type PuppyEvent } from '../types'

/** Vue d'ensemble : combien aujourd'hui, moyenne, et creneaux habituels. */
export function Stats({ events, now }: { events: PuppyEvent[]; now: number }) {
  const histogram = hourlyHistogram(events)
  const peak = Math.max(...histogram, 1)

  return (
    <div className="stats">
      <div className="stat-grid">
        {EVENT_KINDS.map((kind) => {
          const summary = summarize(events, kind, now)
          const meta = KIND_META[kind]
          return (
            <div key={kind} className="stat" style={{ '--accent': meta.color } as React.CSSProperties}>
              <div className="stat-head">
                <span aria-hidden="true">{meta.emoji}</span> {meta.label}
              </div>
              <div className="stat-value">{summary.today}</div>
              <div className="stat-sub muted">
                {summary.durationTodayMs !== null
                  ? `aujourd'hui · ${formatSpan(summary.durationTodayMs)} au total`
                  : "aujourd'hui"}
              </div>
              <div className="stat-foot muted">
                {summary.perDay !== null ? `≈ ${summary.perDay.toFixed(1)} / jour` : 'pas encore de moyenne'}
                <br />
                {summary.last ? `dernier ${formatElapsed(summary.last.happenedAt, now)}` : 'jamais noté'}
              </div>
            </div>
          )
        })}
      </div>

      <section className="card">
        <h3 className="card-title">Créneaux habituels (pipi + caca)</h3>
        {events.length === 0 ? (
          <p className="muted">Les habitudes apparaîtront après quelques jours de suivi.</p>
        ) : (
          <div className="histogram" role="img" aria-label="Répartition des sorties par heure de la journée">
            {histogram.map((count, hour) => (
              <div key={hour} className="hbar-wrap" title={`${hour}h : ${count}`}>
                <div className="hbar" style={{ height: `${(count / peak) * 100}%` }} />
                {hour % 6 === 0 && <span className="hbar-label">{hour}h</span>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
