import '../styles/ArtistIntro.css'

export default function ArtistIntro({ intro, loading }) {
  if (loading) {
    return <section className="artist-intro artist-intro--loading">
      <div className="artist-intro__container">
        <div className="artist-intro__content">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--text" />
          <div className="skeleton skeleton--text" style={{ marginBottom: '32px' }} />
        </div>
        <div className="artist-intro__images">
          <div className="artist-intro__image skeleton" />
        </div>
      </div>
    </section>
  }

  const imageUrl = intro.image_url || intro.image_url_1 || intro.image_url_2 || intro.image_url_3

  return <section className="artist-intro">
    <div className="artist-intro__container">
      <div className="artist-intro__content">
        <p className="artist-intro__label">ABOUT THE ARTIST</p>
        <h2 className="artist-intro__title">{intro.title || 'About the artist'}</h2>
        <p className="artist-intro__description">{intro.description}</p>
      </div>
      {imageUrl && <div className="artist-intro__images">
        <div
          className="artist-intro__image"
          style={{
            backgroundImage: `url(${imageUrl})`,
            animationDelay: '0.15s',
          }}
        />
      </div>}
    </div>
  </section>
}
