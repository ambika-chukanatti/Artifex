import React from 'react'

type cardProps = {
  image: UpdateImageParams
}

const Card = ({ image }: cardProps) => {
  return (
    <div className="image-card-link" style={{ display: 'block', cursor: 'pointer' }}>
      <img
        src={image.transformedImage.imageUrl}
        alt={image.title}
        style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block', borderRadius: '10px' }}
      />
      <div className="card-overlay">
        <span className="card-overlay-type">{image.transformationType ?? 'image'}</span>
        <p className="card-overlay-title">{image.title}</p>
      </div>
    </div>
  )
}

export default Card