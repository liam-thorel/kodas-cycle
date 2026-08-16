import { useEffect, useState } from 'react'
import { AuthorGate } from './components/AuthorGate'
import { ManualEntry } from './components/ManualEntry'
import { QuickLog } from './components/QuickLog'
import { ReliefBanner } from './components/ReliefBanner'
import { Stats } from './components/Stats'
import { Timeline } from './components/Timeline'
import { DURATION_KINDS, PUPPY_NAME } from './config'
import { readAuthor, writeAuthor, type StoredEvent } from './lib/storage'
import { reliefStatus } from './lib/stats'
import { useEvents } from './lib/useEvents'
import type { EventKind, SyncStatus } from './types'

type Tab = 'journal' | 'stats'

export function App() {
  const [author, setAuthor] = useState<string | null>(() => readAuthor())
  const [tab, setTab] = useState<Tab>('journal')
  const [justLogged, setJustLogged] = useState<EventKind | null>(null)
  const { events, status, addEvent, patchEvent, removeEvent } = useEvents()
  // Fait avancer les durees affichees sans attendre une action de l'utilisateur.
  // Un chrono de promenade doit bouger tout seul, d'ou le pas de 15 s.
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!justLogged) return
    const id = window.setTimeout(() => setJustLogged(null), 1200)
    return () => window.clearTimeout(id)
  }, [justLogged])

  if (!author) {
    return (
      <AuthorGate
        onPick={(name) => {
          writeAuthor(name)
          setAuthor(name)
        }}
      />
    )
  }

  const relief = reliefStatus(events, now)

  // Les durees ouvertes, par type : elles pilotent l'etat des boutons.
  const running: Partial<Record<EventKind, StoredEvent>> = {}
  for (const event of events) {
    if (DURATION_KINDS.includes(event.kind) && event.endedAt === null && !running[event.kind]) {
      running[event.kind] = event
    }
  }

  function startDuration(kind: EventKind) {
    const already = running[kind]
    // Deux "démarrer" d'affilee laisseraient une duree ouverte pour toujours :
    // on ferme la precedente avant d'en ouvrir une nouvelle.
    if (already) patchEvent(already.id, { endedAt: new Date().toISOString() })
    addEvent({ kind, happenedAt: new Date().toISOString(), author: author! })
    setNow(Date.now())
  }

  function stopDuration(event: StoredEvent) {
    patchEvent(event.id, { endedAt: new Date().toISOString() })
    setNow(Date.now())
  }

  return (
    <div className="app">
      <header className="app-head">
        <div>
          <h1 className="app-title">{PUPPY_NAME}</h1>
          <p className="app-sub muted">
            connecté en tant que {author}
            <button
              type="button"
              className="linkish"
              onClick={() => {
                const next = prompt('Ton prénom', author)?.trim()
                if (next) {
                  writeAuthor(next)
                  setAuthor(next)
                }
              }}
            >
              changer
            </button>
          </p>
        </div>
        <SyncBadge status={status} />
      </header>

      <ReliefBanner last={relief.last} elapsedMs={relief.elapsedMs} overdue={relief.overdue} />

      <QuickLog
        justLogged={justLogged}
        now={now}
        running={running}
        onLog={(kind) => {
          addEvent({ kind, happenedAt: new Date().toISOString(), author })
          setJustLogged(kind)
          setNow(Date.now())
        }}
        onStart={startDuration}
        onStop={stopDuration}
      />

      <ManualEntry author={author} onSubmit={addEvent} />

      <nav className="tabs">
        <button
          type="button"
          className={tab === 'journal' ? 'tab tab-on' : 'tab'}
          onClick={() => setTab('journal')}
        >
          Journal
        </button>
        <button
          type="button"
          className={tab === 'stats' ? 'tab tab-on' : 'tab'}
          onClick={() => setTab('stats')}
        >
          Statistiques
        </button>
      </nav>

      {tab === 'journal' ? (
        <Timeline events={events} now={now} onRemove={removeEvent} onStop={stopDuration} />
      ) : (
        <Stats events={events} now={now} />
      )}
    </div>
  )
}

const SYNC_LABEL: Record<SyncStatus, { text: string; title: string }> = {
  local: {
    text: 'local',
    title: "Supabase n'est pas configuré : les données restent sur cet appareil.",
  },
  connecting: { text: 'connexion…', title: 'Connexion à Supabase en cours.' },
  live: { text: 'synchronisé', title: 'Les entrées sont partagées en temps réel.' },
  error: { text: 'hors ligne', title: 'Écritures conservées ici, renvoyées au retour du réseau.' },
}

function SyncBadge({ status }: { status: SyncStatus }) {
  const label = SYNC_LABEL[status]
  return (
    <span className={`sync sync-${status}`} title={label.title}>
      <span className="sync-dot" aria-hidden="true" />
      {label.text}
    </span>
  )
}
