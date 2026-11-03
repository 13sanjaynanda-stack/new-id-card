import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent, type PointerEvent } from 'react'
import maaAshapuraImage from '../maa ashapura photo.jpg'

type CardDetails = {
  name: string
  phone: string
  address: string
}

type CardElement = 'image' | 'organization' | 'details' | 'photo'
type Position = { left: number; top: number }
type CardLayout = Record<CardElement, Position>
type ActiveDrag = { element: CardElement; pointerId: number; x: number; y: number; left: number; top: number }

const defaultLayout: CardLayout = {
  image: { left: 5.69, top: 5.13 },
  organization: { left: 29.73, top: 14.59 },
  details: { left: 5.93, top: 36 },
  photo: { left: 75.91, top: 44.69 },
}

const layoutStorageKey = 'visiting-card-layout'
const elementSize: Record<CardElement, Position> = {
  image: { left: 20, top: 20 },
  organization: { left: 64, top: 14 },
  details: { left: 43, top: 64 },
  photo: { left: 20, top: 46 },
}

function isPosition(value: unknown): value is Position {
  if (typeof value !== 'object' || value === null) return false
  const position = value as Record<string, unknown>
  return typeof position.left === 'number' && Number.isFinite(position.left)
    && typeof position.top === 'number' && Number.isFinite(position.top)
}

function loadLayout(): CardLayout {
  try {
    const saved = localStorage.getItem(layoutStorageKey)
    if (!saved) return defaultLayout
    const parsed: unknown = JSON.parse(saved)
    if (typeof parsed !== 'object' || parsed === null) return defaultLayout

    const layout = parsed as Record<string, unknown>
    return {
      image: isPosition(layout.image) ? layout.image : defaultLayout.image,
      organization: isPosition(layout.organization) ? layout.organization : defaultLayout.organization,
      details: isPosition(layout.details) ? layout.details : defaultLayout.details,
      photo: isPosition(layout.photo) ? layout.photo : defaultLayout.photo,
    }
  } catch (error) {
    console.warn('Could not load the saved card layout.', error)
    return defaultLayout
  }
}

function App() {
  const [details, setDetails] = useState<CardDetails>({
    name: '',
    phone: '',
    address: '',
  })
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [layout, setLayout] = useState<CardLayout>(loadLayout)
  const [layoutNotice, setLayoutNotice] = useState('')
  const activeDrag = useRef<ActiveDrag | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        localStorage.setItem(layoutStorageKey, JSON.stringify(layout))
        setLayoutNotice('')
      } catch (error) {
        console.error('Could not save the card layout in this browser.', error)
        setLayoutNotice('Could not save layout in this browser.')
      }
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [layout])

  function getCardElement(target: EventTarget | null): CardElement | null {
    if (!(target instanceof HTMLElement)) return null
    const element = target.closest<HTMLElement>('[data-card-item]')?.dataset.cardItem
    return element === 'image' || element === 'organization' || element === 'details' || element === 'photo'
      ? element
      : null
  }

  function moveElement(element: CardElement, left: number, top: number) {
    const maxLeft = 100 - elementSize[element].left
    const maxTop = 100 - elementSize[element].top
    setLayout((current) => ({
      ...current,
      [element]: {
        left: Math.max(0, Math.min(maxLeft, left)),
        top: Math.max(0, Math.min(maxTop, top)),
      },
    }))
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    const element = getCardElement(event.target)
    if (!element) return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    activeDrag.current = {
      element,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      ...layout[element],
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const drag = activeDrag.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const left = drag.left + ((event.clientX - drag.x) / bounds.width) * 100
    const top = drag.top + ((event.clientY - drag.y) / bounds.height) * 100
    moveElement(drag.element, left, top)
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    if (activeDrag.current?.pointerId === event.pointerId) activeDrag.current = null
  }

  function handleElementKeyDown(event: KeyboardEvent<HTMLElement>) {
    const element = getCardElement(event.target)
    if (!element || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return

    event.preventDefault()
    const step = event.shiftKey ? 5 : 1
    const current = layout[element]
    moveElement(
      element,
      current.left + (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0),
      current.top + (event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0),
    )
  }

  function resetLayout() {
    setLayout(defaultLayout)
  }

  function updateField(field: keyof CardDetails, value: string) {
    setDetails((current) => ({ ...current, [field]: value }))
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhoto(reader.result)
        setPhotoName(file.name)
      }
    }
    reader.readAsDataURL(file)
  }

  function createPdf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.print()
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Card studio home">
          <span className="wordmark-mark">V</span>
          <span>visiting card studio</span>
        </a>
        <span className="topbar-note">90 × 50 mm · landscape</span>
      </header>

      <section className="workspace" id="top">
        <div className="editor-column">
          <div className="intro">
            <p className="eyebrow">PERSONAL PRINT</p>
            <h1>Your card,<br />ready to print.</h1>
            <p className="intro-copy">Add your details and photo to prepare a visiting card.</p>
          </div>

          <form className="details-form" onSubmit={createPdf}>
            <label className="field">
              <span className="field-label">Full name</span>
              <input
                autoComplete="name"
                lang="gu"
                maxLength={48}
                placeholder="e.g. Asha Mehta"
                required
                value={details.name}
                onChange={(event) => updateField('name', event.target.value)}
              />
            </label>

            <label className="field">
              <span className="field-label">Contact number</span>
              <input
                autoComplete="tel"
                inputMode="tel"
                maxLength={24}
                placeholder="e.g. +91 98765 43210"
                required
                value={details.phone}
                onChange={(event) => updateField('phone', event.target.value)}
              />
            </label>

            <label className="field">
              <span className="field-label">Address</span>
              <textarea
                autoComplete="street-address"
                lang="gu"
                maxLength={110}
                placeholder="Street, city, postal code"
                required
                rows={3}
                value={details.address}
                onChange={(event) => updateField('address', event.target.value)}
              />
            </label>

            <label className="field photo-field">
              <span className="field-label">Passport photo</span>
              <span className="upload-control">
                <span className="upload-icon" aria-hidden="true">＋</span>
                <span className="upload-copy">
                  <strong>{photoName || 'Choose a photo'}</strong>
                  <span>JPG or PNG · stored only in this browser</span>
                </span>
                <input
                  accept="image/*"
                  aria-label="Upload passport photo"
                  onChange={handlePhoto}
                  required={!photo}
                  type="file"
                />
              </span>
            </label>

            <button className="print-button" type="submit">
              <span aria-hidden="true">↗</span>
              Prepare PDF
            </button>
            <p className="form-footnote">Your details and photo stay on this device.</p>
          </form>
        </div>

        <section className="preview-column" aria-label="Live card preview">
          <div className="preview-heading">
            <div>
              <p className="eyebrow">LIVE PREVIEW</p>
              <h2>Front of card</h2>
            </div>
            <span className="size-tag">90 × 50 mm</span>
          </div>

          <div className="layout-controls">
            <span>Drag items to position them. Use arrow keys for fine adjustments.</span>
            <button type="button" onClick={resetLayout}>Reset layout</button>
          </div>
          {layoutNotice && <p className="layout-notice" role="status">{layoutNotice}</p>}

          <div className="card-stage">
            <article
              className="visiting-card"
              aria-label="Visiting card preview"
              onKeyDown={handleElementKeyDown}
              onPointerCancel={handlePointerUp}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div
                className="static-image-frame draggable-card-item"
                data-card-item="image"
                role="button"
                tabIndex={0}
                aria-label="Move Maa Ashapura image. Use arrow keys to adjust."
                style={{ left: `${layout.image.left}%`, top: `${layout.image.top}%` }}
              >
                <img src={maaAshapuraImage} alt="Maa Ashapura" />
              </div>
              <header
                className="card-organization draggable-card-item"
                data-card-item="organization"
                lang="gu"
                role="button"
                tabIndex={0}
                aria-label="Move organization heading. Use arrow keys to adjust."
                style={{ left: `${layout.organization.left}%`, top: `${layout.organization.top}%` }}
              >
                <strong>શ્રી દેશદેવી માઁ આશપુરા પદયાત્રી સંઘ</strong>
                <span>માર્કેટિંગ યાર્ડ , રાજકોટ - ૩</span>
              </header>
              <div
                className="card-copy draggable-card-item"
                data-card-item="details"
                role="button"
                tabIndex={0}
                aria-label="Move name and contact details. Use arrow keys to adjust."
                style={{ left: `${layout.details.left}%`, top: `${layout.details.top}%` }}
              >
                <h3>{details.name || 'Your name'}</h3>
                <div className="card-contact">
                  <span className="contact-key">PHONE</span>
                  <span className="contact-value">{details.phone || 'Contact number'}</span>
                </div>
                <div className="card-contact address-contact">
                  <span className="contact-key">ADDRESS</span>
                  <span className="contact-value">{details.address || 'Your address'}</span>
                </div>
              </div>
              <div
                className="photo-frame draggable-card-item"
                data-card-item="photo"
                role="button"
                tabIndex={0}
                aria-label="Move uploaded photo. Use arrow keys to adjust."
                style={{ left: `${layout.photo.left}%`, top: `${layout.photo.top}%` }}
              >
                {photo ? (
                  <img src={photo} alt="Uploaded passport photo" />
                ) : (
                  <span>PHOTO</span>
                )}
              </div>
            </article>
          </div>

          <div className="preview-footer">
            <span className="status-dot" />
            <span>Print scale set to actual size</span>
            <span className="preview-rule" />
            <span>PDF via print dialog</span>
          </div>
        </section>
      </section>
    </main>
  )
}

export default App