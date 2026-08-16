import { useState } from 'react'
import { PUPPY_NAME } from '../config'

/**
 * Premier ecran : qui es-tu ? Le prenom est stocke sur l'appareil et signe
 * ensuite chaque entree, pour savoir qui a note quoi.
 */
export function AuthorGate({ onPick }: { onPick: (author: string) => void }) {
  const [value, setValue] = useState('')
  const trimmed = value.trim()

  return (
    <div className="gate">
      <div className="gate-card">
        <div className="gate-emoji" aria-hidden="true">
          🐶
        </div>
        <h1>Le carnet de {PUPPY_NAME}</h1>
        <p className="muted">Ton prénom apparaîtra à côté de chaque entrée que tu notes.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (trimmed) onPick(trimmed)
          }}
        >
          <input
            className="input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ton prénom"
            autoComplete="given-name"
            autoFocus
            maxLength={24}
          />
          <button className="btn btn-primary" type="submit" disabled={!trimmed}>
            C'est parti
          </button>
        </form>
      </div>
    </div>
  )
}
