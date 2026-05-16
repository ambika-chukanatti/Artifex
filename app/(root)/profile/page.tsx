import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import Card from "@/components/shared/Card";
import { getUserImages } from "@/lib/actions/image.actions";
import { getUserById } from "@/lib/actions/user.actions";
import Search from "@/components/shared/Search";

const Profile = async ({ searchParams }: SearchParamProps) => {
  const searchQuery = (await searchParams)?.query as string || '';
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  let images = await getUserImages(user._id);

  if(searchQuery){
    images = images.filter(
      (img:any) =>
        img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <main className="profile-page">
      <div className="grid-overlay" />

      <div className="profile-content">
        {/* Hero */}
        <section className="profile-hero">
          <div className="profile-hero-badge">Your Space</div>
          <h1 className="profile-hero-title">Profile</h1>
          <p className="profile-hero-subtitle">Track your credits and creations</p>
        </section>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <Image src="/assets/icons/coins.svg" alt="credits" width={28} height={28} />
            </div>
            <div className="profile-stat-info">
              <span className="profile-stat-label">Credits Available</span>
              <span className="profile-stat-value">{user.creditBalance}</span>
            </div>
          </div>

          <div className="profile-stat-divider" />

          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <Image src="/assets/icons/photo.svg" alt="images" width={28} height={28} />
            </div>
            <div className="profile-stat-info">
              <span className="profile-stat-label">Images Created</span>
              <span className="profile-stat-value">{images.length}</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="profile-search">
          <Search />
        </div>

        {/* Section header */}
        <div className="section-header">
          <div className="section-line" />
          <span className="section-label">
            {searchQuery ? `Results for "${searchQuery}"` : 'Your creations'}
          </span>
          <div className="section-line-reverse" />
        </div>

        {/* Grid */}
        <div className="profile-images-grid">
          {images && images.length > 0 ? (
            images.map((image: UpdateImageParams) => (
              <Link href={`/image/${image._id}`} key={image._id} className="image-card-link">
                <Card image={image} />
              </Link>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <p className="empty-text">No images yet</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Profile;