import { useState, type ChangeEvent, type FormEvent } from 'react'

type CardDetails = {
  name: string
  phone: string
  address: string
}

function App() {
  const [details, setDetails] = useState<CardDetails>({
    name: '',
    phone: '',
    address: '',
  })
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoName, setPhotoName] = useState('')

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

          <div className="card-stage">
            <article className="visiting-card" aria-label="Visiting card preview">
              <div className="card-accent" />
              <div className="card-copy">
                <span className="card-kicker">PERSONAL DETAILS</span>
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
              <div className="photo-frame">
                {photo ? (
                  <img src={photo} alt="Uploaded passport photo" />
                ) : (
                  <span>PHOTO</span>
                )}
              </div>
              <div className="card-footer">VISITING CARD <span>•</span> PERSONAL</div>
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