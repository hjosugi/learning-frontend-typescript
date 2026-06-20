import { FormEvent, useMemo, useState } from 'react'
import { Palette, Plus, Star, Trash2 } from 'lucide-react'
import { initialColors } from './initialColors'
import './styles.css'

type ColorItem = {
  id: string
  title: string
  hex: string
  rating: number
}

type ColorDraft = Pick<ColorItem, 'title' | 'hex'>

const emptyDraft: ColorDraft = {
  title: '',
  hex: '#3b82f6',
}

function App() {
  const [colors, setColors] = useState<ColorItem[]>(initialColors)
  const [draft, setDraft] = useState<ColorDraft>(emptyDraft)

  const averageRating = useMemo(() => {
    if (colors.length === 0) {
      return '0.0'
    }

    const total = colors.reduce((sum, color) => sum + color.rating, 0)
    return (total / colors.length).toFixed(1)
  }, [colors])

  function addColor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const title = draft.title.trim()
    if (!title) {
      return
    }

    setColors((current) => [
      {
        id: crypto.randomUUID(),
        title,
        hex: draft.hex,
        rating: 0,
      },
      ...current,
    ])
    setDraft(emptyDraft)
  }

  function rateColor(id: string, rating: number) {
    setColors((current) => current.map((color) => (color.id === id ? { ...color, rating } : color)))
  }

  function removeColor(id: string) {
    setColors((current) => current.filter((color) => color.id !== id))
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">
          <Palette size={25} strokeWidth={2.1} />
        </div>
        <div>
          <h1>React Color Lab</h1>
          <p>
            {colors.length} colors · average rating {averageRating}/5
          </p>
        </div>
      </header>

      <form className="color-form" onSubmit={addColor}>
        <label>
          <span>Name</span>
          <input
            name="title"
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            placeholder="e.g. winter lake"
            value={draft.title}
          />
        </label>
        <label>
          <span>Color</span>
          <input
            aria-label="Color value"
            className="color-input"
            name="hex"
            onChange={(event) => setDraft((current) => ({ ...current, hex: event.target.value }))}
            type="color"
            value={draft.hex}
          />
        </label>
        <button type="submit" disabled={!draft.title.trim()} aria-label="Add color" title="Add color">
          <Plus size={19} />
        </button>
      </form>

      <section className="color-grid" aria-label="Colors">
        {colors.length === 0 ? (
          <p className="empty-state">No colors listed.</p>
        ) : (
          colors.map((color) => <ColorCard key={color.id} color={color} onRate={rateColor} onRemove={removeColor} />)
        )}
      </section>
    </main>
  )
}

type ColorCardProps = {
  color: ColorItem
  onRate: (id: string, rating: number) => void
  onRemove: (id: string) => void
}

function ColorCard({ color, onRate, onRemove }: ColorCardProps) {
  return (
    <article className="color-card">
      <div className="swatch" style={{ backgroundColor: color.hex }} />
      <div className="card-body">
        <div>
          <h2>{color.title}</h2>
          <p>{color.hex}</p>
        </div>
        <button type="button" onClick={() => onRemove(color.id)} aria-label={`Remove ${color.title}`} title="Remove color">
          <Trash2 size={18} />
        </button>
      </div>
      <StarRating rating={color.rating} onRate={(rating) => onRate(color.id, rating)} />
    </article>
  )
}

type StarRatingProps = {
  rating: number
  total?: number
  onRate: (rating: number) => void
}

function StarRating({ rating, total = 5, onRate }: StarRatingProps) {
  return (
    <div className="rating" aria-label={`${rating} of ${total} stars`}>
      {Array.from({ length: total }, (_, index) => {
        const value = index + 1
        const selected = value <= rating

        return (
          <button
            key={value}
            type="button"
            className={selected ? 'selected' : ''}
            onClick={() => onRate(value)}
            aria-label={`Rate ${value} of ${total}`}
            title={`Rate ${value}`}
          >
            <Star size={18} fill={selected ? 'currentColor' : 'none'} />
          </button>
        )
      })}
      <span>{rating}/5</span>
    </div>
  )
}

export default App

