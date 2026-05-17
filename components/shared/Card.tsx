import Link from "next/link"

type cardProps = {
  image: UpdateImageParams
}

const Card = ({ image }: cardProps) => {
  return (
    <Link href={`/image/${image._id}`} className="image-card-link" style={{ display: 'block', position: 'relative' }}>
      <img
        src={image.transformedImage.imageUrl}
        alt={image.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <div className="card-overlay">
        <span className="card-overlay-type">{image.transformationType ?? 'image'}</span>
        <p className="card-overlay-title">{image.title}</p>
      </div>
    </Link>
  )
}

export default Card