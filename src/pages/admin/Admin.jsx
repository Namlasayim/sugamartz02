import { useEffect, useMemo, useState } from 'react'
import '../../styles/Admin.css'
import { deletePainting, fetchSiteContent, getCurrentSession, savePainting, saveSettings, saveArtistIntro, signIn, signOut, uploadWebsiteIcon } from '../../lib/content'

const emptyPainting = {
  title: '',
  image_url: '',
  price: '',
  medium: '',
  size: '',
  description: '',
  status: 'available',
  display_order: 0,
}
const emptySettings = {
  artist_name: '',
  hero_tagline: '',
  about_text: '',
  profile_photo_url: '',
  website_icon_url: '/website-icon.png',
  instagram_url: '',
  youtube_url: '',
  whatsapp_number: '',
  tiktok_url: '',
  contact_email: '',
}
const emptyArtistIntro = { title: '', description: '', image_url: '' }

const settingGroups = [
  { title: 'Identity', fields: ['artist_name', 'hero_tagline', 'about_text'] },
  { title: 'Images', fields: ['profile_photo_url', 'website_icon_url'] },
  {
    title: 'Social and contact',
    fields: ['instagram_url', 'youtube_url', 'whatsapp_number', 'tiktok_url', 'contact_email'],
  },
]

const settingHelp = {
  artist_name: 'Shown in the navigation, hero, footer, and page titles.',
  hero_tagline: 'A short line for the artist introduction.',
  about_text: 'Used for the home introduction, artist note, and about page.',
  profile_photo_url: 'Paste a public image URL for the about page portrait.',
  website_icon_url: 'Current browser/admin icon. Leave as the default to keep using the existing logo.',
  instagram_url: 'Full Instagram profile URL.',
  youtube_url: 'Full YouTube channel URL.',
  whatsapp_number: 'Phone number with country code, numbers only is best.',
  tiktok_url: 'Full TikTok profile URL.',
  contact_email: 'Displayed as the contact email and mail link.',
}

function fieldLabel(field) {
  return field.replaceAll('_', ' ')
}

function ImagePreview({ src, alt, emptyLabel = 'No image selected' }) {
  return <div className="admin-image-preview">{src ? <img src={src} alt={alt} /> : <span>{emptyLabel}</span>}</div>
}

export default function Admin() {
  const [session, setSession] = useState(false)
  const [login, setLogin] = useState({ email: '', password: '' })
  const [settings, setSettings] = useState(emptySettings)
  const [artistIntro, setArtistIntro] = useState(emptyArtistIntro)
  const [paintings, setPaintings] = useState([])
  const [painting, setPainting] = useState(emptyPainting)
  const [editingPainting, setEditingPainting] = useState(null)
  const [editingImageFile, setEditingImageFile] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showWebsiteIconEditor, setShowWebsiteIconEditor] = useState(false)
  const [websiteIconFile, setWebsiteIconFile] = useState(null)

  const imagePreview = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : painting.image_url), [imageFile, painting.image_url])
  const filteredPaintings = useMemo(
    () =>
      paintings.filter((item) => {
        const matchesSearch = `${item.title} ${item.medium || ''}`.toLowerCase().includes(search.toLowerCase())
        return matchesSearch && (statusFilter === 'all' || item.status === statusFilter)
      }),
    [paintings, search, statusFilter],
  )

  useEffect(
    () => () => {
      if (imageFile) URL.revokeObjectURL(imagePreview)
    },
    [imageFile, imagePreview],
  )

  async function load() {
    setLoading(true)
    try {
      const content = await fetchSiteContent()
      const artistIntroData = content.artistIntro || {}
      setSettings({ ...emptySettings, ...(content.settings || {}) })
      setArtistIntro({
        ...emptyArtistIntro,
        ...artistIntroData,
        image_url: artistIntroData.image_url ?? artistIntroData.image_url_1 ?? artistIntroData.image_url_2 ?? artistIntroData.image_url_3 ?? '',
      })
      setPaintings(content.paintings || [])
      setSession(true)
      setMessage('')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setLoading(true)
    try {
      await signIn(login.email, login.password)
      await load()
    } catch (error) {
      setMessage(error.message)
      setLoading(false)
    }
  }

  async function handleSettings(event) {
    event.preventDefault()
    setLoading(true)
    try {
      await saveSettings(settings)
      setMessage('Site settings saved.')
      await load()
    } catch (error) {
      setMessage(error.message)
      setLoading(false)
    }
  }

  async function handleArtistIntro(event) {
    event.preventDefault()
    setLoading(true)
    try {
      await saveArtistIntro(artistIntro)
      setMessage('Artist intro saved.')
      await load()
    } catch (error) {
      setMessage(error.message)
      setLoading(false)
    }
  }

  async function handlePainting(event) {
    event.preventDefault()
    setLoading(true)
    try {
      await savePainting(painting, imageFile, painting.image_url)
      setPainting(emptyPainting)
      setImageFile(null)
      setMessage('Painting saved.')
      await load()
    } catch (error) {
      setMessage(error.message)
      setLoading(false)
    }
  }

  async function handleInlinePainting(event) {
    event.preventDefault()
    setLoading(true)
    try {
      await savePainting(editingPainting, editingImageFile, editingPainting.image_url)
      setEditingPainting(null)
      setEditingImageFile(null)
      setMessage('Painting updated.')
      await load()
    } catch (error) {
      setMessage(error.message)
      setLoading(false)
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete ${item.title}?`)) return
    setLoading(true)
    try {
      await deletePainting(item)
      setMessage('Painting deleted.')
      await load()
    } catch (error) {
      setMessage(error.message)
      setLoading(false)
    }
  }

  function startEditing(item) {
    setEditingPainting({ ...item })
    setEditingImageFile(null)
  }

  function resetPainting() {
    setPainting(emptyPainting)
    setImageFile(null)
  }

  function cancelInlineEditing() {
    setEditingPainting(null)
    setEditingImageFile(null)
  }

  async function handleWebsiteIconSave() {
    if (!websiteIconFile) {
      setMessage('Choose a file first.')
      return
    }

    setLoading(true)
    try {
      const uploadedUrl = await uploadWebsiteIcon(websiteIconFile)
      const nextSettings = { ...settings, website_icon_url: uploadedUrl }
      await saveSettings(nextSettings)
      setSettings(nextSettings)
      setWebsiteIconFile(null)
      setShowWebsiteIconEditor(false)
      setMessage('Website icon updated.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCurrentSession()
      .then((currentSession) => {
        if (currentSession) load()
        else setLoading(false)
      })
      .catch((error) => {
        setMessage(error.message)
        setLoading(false)
      })
  }, [])

  if (!session)
    return (
      <main className="admin-page">
        <form className="admin-login" onSubmit={handleLogin}>
          <p className="admin-eyebrow">PRIVATE STUDIO</p>
          <h1>Admin login</h1>
          <p className="admin-intro">Manage the artwork and public details for your studio.</p>
          <label>
            Email
            <input type="email" value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} autoComplete="email" required />
          </label>
          <label>
            Password
            <input type="password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} autoComplete="current-password" required />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="admin-message" aria-live="polite">
            {message}
          </p>
        </form>
      </main>
    )

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div className="admin-brand">
          <div>
            <h1>The Studio</h1>
            <p className="admin-intro">Keep the public site current from one place.</p>
          </div>
        </div>
        {showWebsiteIconEditor && (
          <div className="admin-brand__editor">
            <label className="admin-brand__upload-wrap">
              Upload website icon
              <input type="file" accept="image/*" onChange={(event) => setWebsiteIconFile(event.target.files?.[0] || null)} />
            </label>
            <div className="admin-brand__editor-actions">
              <button type="button" onClick={handleWebsiteIconSave} disabled={loading || !websiteIconFile}>
                {loading ? 'Saving...' : 'Save icon'}
              </button>
              <button type="button" className="admin-button-secondary" onClick={() => { setShowWebsiteIconEditor(false); setWebsiteIconFile(null) }}>
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="admin-header-actions">
          <button type="button" className="admin-button-secondary" onClick={load} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh content'}
          </button>
          <button
            type="button"
            onClick={async () => {
              await signOut()
              setSession(false)
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      <p className="admin-message admin-message-banner" aria-live="polite">
        {message}
      </p>
      <section className="admin-stats" aria-label="Studio overview">
        <div>
          <strong>{paintings.length}</strong>
          <span>Total works</span>
        </div>
        <div>
          <strong>{paintings.filter((item) => item.status === 'available').length}</strong>
          <span>Available</span>
        </div>
        <div>
          <strong>{paintings.filter((item) => item.status === 'featured').length}</strong>
          <span>Featured</span>
        </div>
        <div>
          <strong>{paintings.filter((item) => item.status === 'sold').length}</strong>
          <span>Sold</span>
        </div>
        <div>
          <strong>{paintings.filter((item) => item.status === 'murals').length}</strong>
          <span>Murals</span>
        </div>
      </section>
      <section className="admin-grid">
        <form className="admin-panel admin-settings-panel" onSubmit={handleSettings}>
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">PUBLIC SITE</p>
              <h2>Site settings</h2>
            </div>
            <span className="admin-save-hint">Changes go live after saving</span>
          </div>
          {settingGroups.map((group) => (
            <fieldset key={group.title}>
              <legend>{group.title}</legend>
              {group.fields.map((field) => (
                <label key={field}>
                  {fieldLabel(field)}
                  <span className="admin-field-help">{settingHelp[field]}</span>
                  {field === 'about_text' ? (
                    <textarea
                      value={settings[field] || ''}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          [field]: event.target.value,
                        })
                      }
                      rows="6"
                    />
                  ) : (
                    <input
                      type={field === 'contact_email' ? 'email' : 'text'}
                      value={settings[field] || ''}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          [field]: event.target.value,
                        })
                      }
                    />
                  )}
                  {field === 'profile_photo_url' && settings[field] && <ImagePreview src={settings[field]} alt={`${fieldLabel(field)} preview`} />}
                </label>
              ))}
            </fieldset>
          ))}
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save site settings'}
          </button>
        </form>
        <form className="admin-panel admin-intro-panel" onSubmit={handleArtistIntro}>
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">ARTIST INTRO</p>
              <h2>About you</h2>
            </div>
            <span className="admin-save-hint">Shown on the home page</span>
          </div>
          <fieldset>
            <legend>Introduction</legend>
            <label>
              Title
              <input value={artistIntro.title || ''} onChange={(event) => setArtistIntro({ ...artistIntro, title: event.target.value })} />
            </label>
            <label>
              Description
              <textarea
                value={artistIntro.description || ''}
                onChange={(event) =>
                  setArtistIntro({
                    ...artistIntro,
                    description: event.target.value,
                  })
                }
                rows="5"
              />
            </label>
          </fieldset>
          <fieldset>
            <legend>Artist image</legend>
            <label>
              Image URL
              <input
                type="url"
                value={artistIntro.image_url || ''}
                onChange={(event) =>
                  setArtistIntro({
                    ...artistIntro,
                    image_url: event.target.value,
                  })
                }
              />
              {artistIntro.image_url && <ImagePreview src={artistIntro.image_url} alt="Artist intro image" />}
            </label>
          </fieldset>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save artist intro'}
          </button>
        </form>
        <form className="admin-panel admin-painting-panel" onSubmit={handlePainting}>
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">COLLECTION</p>
              <h2>{painting.id ? 'Edit painting' : 'Add painting'}</h2>
            </div>
            {painting.id && (
              <button type="button" className="admin-button-secondary" onClick={resetPainting}>
                New painting
              </button>
            )}
          </div>
          <div className="painting-editor">
            <div>
              <label>
                Title
                <input value={painting.title || ''} onChange={(event) => setPainting({ ...painting, title: event.target.value })} required />
              </label>
              <div className="admin-form-row">
                <label>
                  Medium
                  <input value={painting.medium || ''} onChange={(event) => setPainting({ ...painting, medium: event.target.value })} />
                </label>
                <label>
                  Size
                  <input value={painting.size || ''} onChange={(event) => setPainting({ ...painting, size: event.target.value })} />
                </label>
              </div>
              <div className="admin-form-row">
                <label>
                  Price
                  <input type="number" min="0" step="0.01" value={painting.price ?? ''} onChange={(event) => setPainting({ ...painting, price: event.target.value })} />
                </label>
                <label>
                  Order
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={painting.display_order ?? 0}
                    onChange={(event) =>
                      setPainting({
                        ...painting,
                        display_order: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <label>
                Description
                <textarea
                  value={painting.description || ''}
                  onChange={(event) =>
                    setPainting({
                      ...painting,
                      description: event.target.value,
                    })
                  }
                  rows="5"
                />
              </label>
              <label>
                Status
                <select value={painting.status || 'available'} onChange={(event) => setPainting({ ...painting, status: event.target.value })}>
                  <option value="available">Available</option>
                  <option value="featured">Featured</option>
                  <option value="sold">Sold</option>
                  <option value="murals">Murals</option>
                </select>
              </label>
              <label>
                Image URL <span className="admin-field-help">Optional when uploading a file below.</span>
                <input type="url" value={painting.image_url || ''} onChange={(event) => setPainting({ ...painting, image_url: event.target.value })} />
              </label>
              <label>
                Upload image
                <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files[0] || null)} />
              </label>
            </div>
            <ImagePreview src={imagePreview} alt={painting.title || 'Painting preview'} emptyLabel="Painting preview" />
          </div>
          <div className="admin-form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : painting.id ? 'Save changes' : 'Add painting'}
            </button>
            {painting.id && (
              <button type="button" className="admin-button-secondary" onClick={resetPainting}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
      <section className="painting-list">
        <div className="admin-list-heading">
          <div>
            <p className="admin-eyebrow">WORK LIBRARY</p>
            <h2>Paintings</h2>
          </div>
          <button type="button" className="admin-button-secondary" onClick={resetPainting}>
            + New painting
          </button>
        </div>
        <div className="admin-list-tools">
          <input type="search" placeholder="Search title or medium" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search paintings" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter paintings by status">
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="featured">Featured</option>
            <option value="sold">Sold</option>
            <option value="murals">Murals</option>
          </select>
        </div>
        {filteredPaintings.length === 0 ? (
          <p className="admin-empty-state">No paintings match this filter.</p>
        ) : (
          <div className="painting-table">
            {filteredPaintings.map((item) =>
              editingPainting?.id === item.id ? (
                <article className="painting-row painting-row--editing" key={item.id}>
                  <form className="painting-inline-editor" onSubmit={handleInlinePainting}>
                    <div className="painting-inline-heading">
                      <div>
                        <p className="admin-eyebrow">EDITING WORK</p>
                        <h3>{item.title}</h3>
                      </div>
                      <ImagePreview src={editingPainting.image_url} alt={editingPainting.title} />
                    </div>
                    <div className="admin-form-row">
                      <label>
                        Title
                        <input
                          value={editingPainting.title || ''}
                          onChange={(event) =>
                            setEditingPainting({
                              ...editingPainting,
                              title: event.target.value,
                            })
                          }
                          required
                        />
                      </label>
                      <label>
                        Medium
                        <input
                          value={editingPainting.medium || ''}
                          onChange={(event) =>
                            setEditingPainting({
                              ...editingPainting,
                              medium: event.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                    <div className="admin-form-row">
                      <label>
                        Size
                        <input
                          value={editingPainting.size || ''}
                          onChange={(event) =>
                            setEditingPainting({
                              ...editingPainting,
                              size: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Price
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingPainting.price ?? ''}
                          onChange={(event) =>
                            setEditingPainting({
                              ...editingPainting,
                              price: event.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                    <div className="admin-form-row">
                      <label>
                        Order
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={editingPainting.display_order ?? 0}
                          onChange={(event) =>
                            setEditingPainting({
                              ...editingPainting,
                              display_order: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Status
                        <select
                          value={editingPainting.status || 'available'}
                          onChange={(event) =>
                            setEditingPainting({
                              ...editingPainting,
                              status: event.target.value,
                            })
                          }
                        >
                          <option value="available">Available</option>
                          <option value="featured">Featured</option>
                          <option value="sold">Sold</option>
                          <option value="murals">Murals</option>
                        </select>
                      </label>
                    </div>
                    <label>
                      Description
                      <textarea
                        value={editingPainting.description || ''}
                        onChange={(event) =>
                          setEditingPainting({
                            ...editingPainting,
                            description: event.target.value,
                          })
                        }
                        rows="4"
                      />
                    </label>
                    <label>
                      Image URL
                      <input
                        type="url"
                        value={editingPainting.image_url || ''}
                        onChange={(event) =>
                          setEditingPainting({
                            ...editingPainting,
                            image_url: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      Replace image
                      <input type="file" accept="image/*" onChange={(event) => setEditingImageFile(event.target.files[0] || null)} />
                    </label>
                    <div className="painting-row-actions">
                      <button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save changes'}
                      </button>
                      <button type="button" className="admin-button-secondary" onClick={cancelInlineEditing}>
                        Cancel
                      </button>
                      <button type="button" className="admin-danger-button" onClick={() => handleDelete(item)}>
                        Delete
                      </button>
                    </div>
                  </form>
                </article>
              ) : (
                <article className="painting-row" key={item.id}>
                  <ImagePreview src={item.image_url} alt="" emptyLabel="No image" />
                  <div className="painting-row-info">
                    <strong>{item.title}</strong>
                    <span>
                      {item.medium || 'Medium not set'}
                      {item.size ? ` · ${item.size}` : ''}
                    </span>
                  </div>
                  <span className={`painting-status status-${item.status}`}>{item.status}</span>
                  <span className="painting-row-order">#{item.display_order}</span>
                  <div className="painting-row-actions">
                    <button type="button" className="admin-button-secondary" onClick={() => startEditing(item)}>
                      Edit
                    </button>
                    <button type="button" className="admin-danger-button" onClick={() => handleDelete(item)}>
                      Delete
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </main>
  )
}
