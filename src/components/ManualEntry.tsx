import { useState } from 'react'
import { KIND_META, isDurationKind } from '../config'
import { fromDateTimeLocal, toDateTimeLocal } from '../lib/time'
import { EVENT_KINDS, type EventKind, type NewEvent } from '../types'

type Props = {
  author: string
  onSubmit: (event: NewEvent) => void
}

/**
 * Saisie a posteriori : l'oubli est la norme avec un chiot, il faut pouvoir
 * noter "il a fait pipi il y a 40 minutes" une fois rentre, ou rattraper une
 * promenade entiere le soir.
 */
export function ManualEntry({ author, onSubmit }: Props) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<EventKind>('pipi')
  const [when, setWhen] = useState(() => toDateTimeLocal(new Date().toISOString()))
  const [until, setUntil] = useState('')
  const [note, setNote] = useState('')

  const hasDuration = isDurationKind(kind)
  const endBeforeStart = hasDuration && until !== '' && new Date(until) <= new Date(when)

  function reset() {
    setKind('pipi')
    setWhen(toDateTimeLocal(new Date().toISOString()))
    setUntil('')
    setNote('')
  }

  function shiftMinutes(minutes: number) {
    const base = when ? new Date(when) : new Date()
    setWhen(toDateTimeLocal(new Date(base.getTime() - minutes * 60_000).toISOString()))
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-ghost btn-block"
        onClick={() => {
          reset()
          setOpen(true)
        }}
      >
        ＋ Ajouter après coup
      </button>
    )
  }

  return (
    <form
      className="card manual"
      onSubmit={(e) => {
        e.preventDefault()
        if (!when || endBeforeStart) return
        onSubmit({
          kind,
          happenedAt: fromDateTimeLocal(when),
          endedAt: hasDuration && until ? fromDateTimeLocal(until) : null,
          author,
          note,
        })
        setOpen(false)
      }}
    >
      <div className="manual-kinds">
        {EVENT_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            className={`chip${k === kind ? ' chip-on' : ''}`}
            style={{ '--accent': KIND_META[k].color } as React.CSSProperties}
            onClick={() => setKind(k)}
          >
            {KIND_META[k].emoji} {KIND_META[k].label}
          </button>
        ))}
      </div>

      <label className="field">
        <span className="field-label">{hasDuration ? 'Début' : 'Quand ?'}</span>
        <input
          className="input"
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          required
        />
      </label>

      <div className="manual-shortcuts">
        {[10, 30, 60, 120].map((minutes) => (
          <button key={minutes} type="button" className="chip" onClick={() => shiftMinutes(minutes)}>
            −{minutes} min
          </button>
        ))}
      </div>

      {hasDuration && (
        <label className="field">
          <span className="field-label">Fin — laisse vide si c'est encore en cours</span>
          <input
            className="input"
            type="datetime-local"
            value={until}
            onChange={(e) => setUntil(e.target.value)}
          />
          {endBeforeStart && <span className="field-error">La fin doit être après le début.</span>}
        </label>
      )}

      <label className="field">
        <span className="field-label">Note (optionnel)</span>
        <input
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Mou, dans le salon, pendant la promenade…"
          maxLength={140}
        />
      </label>

      <div className="manual-actions">
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
          Annuler
        </button>
        <button type="submit" className="btn btn-primary" disabled={endBeforeStart}>
          Enregistrer
        </button>
      </div>
    </form>
  )
}
