import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function App() {
  const [names, setNames] = useState([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('')
  const [statusError, setStatusError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadNames() {
      const { data, error } = await supabase
        .from('names')
        .select('id, name, created_at')
        .order('created_at', { ascending: true })

      if (!isMounted) return
      if (error) {
        setStatus('Could not load the wall — please refresh.')
        setStatusError(true)
      } else {
        setNames(data)
      }
      setLoading(false)
    }

    loadNames()

    // Realtime: broadcasts every INSERT on this table, so a name someone
    // else adds appears here instantly with no refresh.
    const channel = supabase
      .channel('names-wall')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'names' },
        (payload) => {
          setNames((current) => {
            if (current.some((n) => n.id === payload.new.id)) return current
            return [...current, payload.new]
          })
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const name = input.trim()
    if (!name) return

    setSubmitting(true)
    setStatus('Adding your name...')
    setStatusError(false)

    const { error } = await supabase.from('names').insert({ name })

    if (error) {
      setStatus('Could not save — please try again.')
      setStatusError(true)
    } else {
      // No local list update here: the realtime subscription above adds
      // it for us, the same way it does for everyone else watching.
      setStatus('Added! Everyone sees it live.')
      setInput('')
    }
    setSubmitting(false)
  }

  return (
    <div className="wrap">
      <div className="plaque">
        <h1 className="title">ASTHIKA SAMAJ - Wall of Names</h1>
        <p className="subtitle">Everyone who's been here, engraved below</p>
        <div className="divider" />

        {loading ? (
          <p className="empty">Loading the wall...</p>
        ) : names.length === 0 ? (
          <p className="empty">Be the first to sign the wall.</p>
        ) : (
          <ul className="names">
            {names.map((n) => (
              <li key={n.id}>{n.name}</li>
            ))}
          </ul>
        )}

        <div className="count">
          {names.length > 0 &&
            `${names.length} ${names.length === 1 ? 'name' : 'names'} on the wall`}
        </div>
      </div>

      <div className="signup">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            maxLength={40}
            placeholder="Your name"
            autoComplete="off"
            required
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={submitting}
          />
          <button type="submit" disabled={submitting}>
            Add my name
          </button>
        </form>
        <div className={`msg ${statusError ? 'error' : ''}`}>{status}</div>
      </div>
    </div>
  )
}
