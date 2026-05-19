import { imageActions } from "@/constants"
import { getUserById } from "@/lib/actions/user.actions"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import ImageActionForm from "@/components/shared/ImageActionFrom"
import Sidebar from "@/components/shared/Sidebar"
import { getImageById } from "@/lib/actions/image.actions"

const ImageUpdatePage = async({ params }: SearchParamProps) => {
  const { id } = await params;
  const { userId } = await auth()

  const image = await getImageById(id);

  if(!userId) redirect("/sign-up")

  const user = await getUserById(userId)

  console.log(image)

  return (
    <section className='w-full lg:h-screen flex flex-row'>
      <ImageActionForm
        action="Update"
        userId={user._id}
        type={image.transformationType as ImageActionTypeKey}
        data={image}
        creditBalance={10}
      />
    </section>
  )
}

export default ImageUpdatePage