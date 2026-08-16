/** Formatage court d'une heure : "14:32". */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

/** "Aujourd'hui", "Hier", sinon "lundi 12 août". */
export function formatDayLabel(iso: string): string {
  const date = startOfDay(new Date(iso))
  const today = startOfDay(new Date())
  const diffDays = Math.round((today.getTime() - date.getTime()) / 86_400_000)
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** Duree lisible depuis un instant passe : "il y a 2 h 15". */
export function formatElapsed(fromIso: string, now: number = Date.now()): string {
  return formatDuration(now - new Date(fromIso).getTime())
}

/**
 * Longueur mesuree : "2 h 15", "45 min", "0 min".
 * A distinguer de `formatDuration`, qui parle d'un temps ecoule et dit
 * "à l'instant" — formulation absurde pour un total ou un chrono.
 */
export function formatSpan(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60_000))
  if (minutes < 1) return '0 min'
  return formatDuration(ms)
}

/** Temps ecoule depuis un moment : "2 h 15", "45 min", "à l'instant". */
export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60_000))
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours < 24) return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, '0')}`
  const days = Math.floor(hours / 24)
  return days === 1 ? '1 jour' : `${days} jours`
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

/** Cle de regroupement par jour local, ex. "2026-08-16". */
export function dayKey(iso: string): string {
  const date = new Date(iso)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** ISO -> valeur pour <input type="datetime-local">, en heure locale. */
export function toDateTimeLocal(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

/** Valeur de <input type="datetime-local"> -> ISO UTC. */
export function fromDateTimeLocal(value: string): string {
  return new Date(value).toISOString()
}
