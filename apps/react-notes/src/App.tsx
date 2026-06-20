import { FormEvent, useMemo, useState } from 'react'
import { Lightbulb, Plus, Trash2 } from 'lucide-react'
import './styles.css'

type Note = {
  id: string
  title: string
  content: string
}

type DraftNote = Pick<Note, 'title' | 'content'>

const emptyDraft: DraftNote = {
  title: '',
  content: '',
}

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [draft, setDraft] = useState<DraftNote>(emptyDraft)

  const canSubmit = draft.title.trim().length > 0 || draft.content.trim().length > 0
  const noteCountLabel = useMemo(() => `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`, [notes.length])

  function updateDraft(field: keyof DraftNote, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    setNotes((current) => [
      {
        id: crypto.randomUUID(),
        title: draft.title.trim() || 'Untitled',
        content: draft.content.trim(),
      },
      ...current,
    ])
    setDraft(emptyDraft)
  }

  function deleteNote(id: string) {
    setNotes((current) => current.filter((note) => note.id !== id))
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">
          <Lightbulb size={24} strokeWidth={2.2} />
        </div>
        <div>
          <h1>React Notes</h1>
          <p>{noteCountLabel}</p>
        </div>
      </header>

      <form className="note-form" onSubmit={addNote}>
        <input
          aria-label="Note title"
          name="title"
          onChange={(event) => updateDraft('title', event.target.value)}
          placeholder="Title"
          value={draft.title}
        />
        <textarea
          aria-label="Note content"
          name="content"
          onChange={(event) => updateDraft('content', event.target.value)}
          placeholder="Take a note..."
          rows={4}
          value={draft.content}
        />
        <button type="submit" disabled={!canSubmit} aria-label="Add note" title="Add note">
          <Plus size={20} />
        </button>
      </form>

      <section className="notes-grid" aria-label="Notes">
        {notes.length === 0 ? (
          <p className="empty-state">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <article className="note-card" key={note.id}>
              <div>
                <h2>{note.title}</h2>
                {note.content && <p>{note.content}</p>}
              </div>
              <button type="button" onClick={() => deleteNote(note.id)} aria-label={`Delete ${note.title}`} title="Delete note">
                <Trash2 size={18} />
              </button>
            </article>
          ))
        )}
      </section>
    </main>
  )
}

export default App

