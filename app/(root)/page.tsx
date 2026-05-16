import Search from '@/components/shared/Search'
import Card from '@/components/shared/Card'
import { getAllImages } from "@/lib/actions/image.actions"
import Link from 'next/link'

const CommunityPage = async({ searchParams }: SearchParamProps) => {
  const searchQuery = (await searchParams)?.query as string || '';
  let images = await getAllImages()

  if(searchQuery){
    images = images.filter(
      (img:any) =>
        img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <main className="community-page">
      <div className="grid-overlay" />

      <div className="content-wrapper">
        <section className="hero-section">
          <div className="hero-badge">Community Showcase</div>

          <h1 className="hero-title">
            Crafted by the <span>Artifex</span> community
          </h1>
          <p className="hero-subtitle">
            Explore imaginative, AI-generated visuals from creators around the world.
          </p>

          <div className="search-wrapper">
            <Search />
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-value">{images?.length ?? 0}</span>
              <span className="stat-label">Images</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">AI</span>
              <span className="stat-label">Powered</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">∞</span>
              <span className="stat-label">Creative</span>
            </div>
          </div>
        </section>

        <div className="section-header">
          <div className="section-line" />
          <span className="section-label">
            {searchQuery ? `Results for "${searchQuery}"` : 'Latest creations'}
          </span>
          <div className="section-line-reverse" />
        </div>

        <div className="images-grid">
          {images && images.length > 0 ? (
            images.map((image: UpdateImageParams) => (
              <Link
                href={`/image/${image._id}`}
                key={image._id}
                className="image-card-link"
              >
                <Card image={image} />
              </Link>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <p className="empty-text">No images found</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default CommunityPage