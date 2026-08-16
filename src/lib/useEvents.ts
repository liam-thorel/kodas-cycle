import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase, isSyncConfigured } from './supabase'
import { readCache, writeCache, sortEvents, type StoredEvent } from './storage'
import type { NewEvent, PuppyEvent, SyncStatus } from '../types'

const TABLE = 'events'

type Row = {
  id: string
  kind: string
  happened_at: string
  ended_at: string | null
  author: string
  note: string | null
  created_at: string
}

function rowToEvent(row: Row): PuppyEvent {
  return {
    id: row.id,
    kind: row.kind as PuppyEvent['kind'],
    happenedAt: row.happened_at,
    endedAt: row.ended_at,
    author: row.author,
    note: row.note,
    createdAt: row.created_at,
  }
}

function eventToRow(event: PuppyEvent): Row {
  return {
    id: event.id,
    kind: event.kind,
    happened_at: event.happenedAt,
    ended_at: event.endedAt,
    author: event.author,
    note: event.note,
    created_at: event.createdAt,
  }
}

/**
 * Source unique des evenements. Le cache local est toujours la verite affichee ;
 * Supabase, quand il est configure, s'y superpose et diffuse aux deux telephones.
 */
export function useEvents() {
  const [events, setEvents] = useState<StoredEvent[]>(() => sortEvents(readCache()))
  const [status, setStatus] = useState<SyncStatus>(isSyncConfigured ? 'connecting' : 'local')
  const eventsRef = useRef(events)

  const commit = useCallback((next: StoredEvent[]) => {
    const sorted = sortEvents(next)
    eventsRef.current = sorted
    setEvents(sorted)
    writeCache(sorted)
  }, [])

  /** Rejoue les ecritures en attente, puis recharge l'etat distant. */
  const sync = useCallback(async () => {
    if (!supabase) return
    const pending = eventsRef.current.filter((e) => e.pending)

    try {
      const upserts = pending.filter((e) => e.pending === 'upsert')
      if (upserts.length > 0) {
        const { error } = await supabase.from(TABLE).upsert(upserts.map(eventToRow))
        if (error) throw error
      }

      const deletes = pending.filter((e) => e.pending === 'delete')
      if (deletes.length > 0) {
        // Supprimer une ligne jamais parvenue au serveur est sans effet : pas
        // besoin de distinguer les suppressions d'entrees encore locales.
        const { error } = await supabase
          .from(TABLE)
          .delete()
          .in(
            'id',
            deletes.map((e) => e.id),
          )
        if (error) throw error
      }

      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('happened_at', { ascending: false })
        .limit(1000)
      if (error) throw error

      const remote = (data as Row[]).map(rowToEvent)
      const stillPending = eventsRef.current.filter((e) => e.pending && !pending.includes(e))
      const pendingIds = new Set(stillPending.map((e) => e.id))
      commit([...remote.filter((e) => !pendingIds.has(e.id)), ...stillPending])
      setStatus('live')
    } catch {
      // Hors ligne ou table absente : on garde l'etat local, on reessaiera.
      setStatus('error')
    }
  }, [commit])

  useEffect(() => {
    const client = supabase
    if (!client) return
    void sync()

    const channel = client
      .channel('events-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => {
        void sync()
      })
      .subscribe()

    const onFocus = () => void sync()
    window.addEventListener('focus', onFocus)
    window.addEventListener('online', onFocus)
    const interval = window.setInterval(onFocus, 60_000)

    return () => {
      void client.removeChannel(channel)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('online', onFocus)
      window.clearInterval(interval)
    }
  }, [sync])

  const addEvent = useCallback(
    (input: NewEvent) => {
      const event: StoredEvent = {
        id: crypto.randomUUID(),
        kind: input.kind,
        happenedAt: input.happenedAt,
        endedAt: input.endedAt ?? null,
        author: input.author,
        note: input.note?.trim() ? input.note.trim() : null,
        createdAt: new Date().toISOString(),
        ...(isSyncConfigured ? { pending: 'upsert' as const } : {}),
      }
      commit([...eventsRef.current, event])
      void sync()
      return event
    },
    [commit, sync],
  )

  /** Modification ciblee : sert surtout a poser la fin d'une promenade ou d'un dodo. */
  const patchEvent = useCallback(
    (id: string, patch: Partial<Pick<PuppyEvent, 'endedAt' | 'happenedAt' | 'note'>>) => {
      commit(
        eventsRef.current.map((e) =>
          e.id === id
            ? { ...e, ...patch, ...(isSyncConfigured ? { pending: 'upsert' as const } : {}) }
            : e,
        ),
      )
      void sync()
    },
    [commit, sync],
  )

  const removeEvent = useCallback(
    (id: string) => {
      if (!isSyncConfigured) {
        commit(eventsRef.current.filter((e) => e.id !== id))
        return
      }
      commit(eventsRef.current.map((e) => (e.id === id ? { ...e, pending: 'delete' } : e)))
      void sync()
    },
    [commit, sync],
  )

  const visible = events.filter((e) => e.pending !== 'delete')

  return { events: visible, status, addEvent, patchEvent, removeEvent, refresh: sync }
}
