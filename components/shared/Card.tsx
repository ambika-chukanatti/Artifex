import Link from "next/link"

type cardProps = {
  image: UpdateImageParams
}

const Card = ({ image }: cardProps) => {
  return (
    <Link href={`/image/${image._id}`} className="image-card-link">
      <img
        src={image.transformedImage.imageUrl}
        alt={image.title}
        className="image-card-img"
      />
      <div className="card-overlay">
        <span className="card-overlay-type">{image.transformationType ?? 'image'}</span>
        <p className="card-overlay-title">{image.title}</p>
      </div>
    </Link>
  )
}