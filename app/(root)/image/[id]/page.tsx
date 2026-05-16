import { getImageById } from "@/lib/actions/image.actions"
import { auth } from "@clerk/nextjs/server";
import { redirect } from 'next/navigation';
import ImageView from "@/components/shared/ImageView";

const ImagePage = async({ params }: SearchParamProps) => {
  const { id } = await params;
  const { userId } = await auth();

  if(!userId) redirect('/sign-in')

  const image = await getImageById(id);

  return (
    <section className="image-page">
      <div className="grid-overlay" />
      <ImageView image={image} userId={userId} />
    </section>
    
  )
}

export default ImagePage