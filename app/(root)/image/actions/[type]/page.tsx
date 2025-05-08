import { imageActions } from "@/constants"
import { getUserById } from "@/lib/actions/user.actions"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import ImageActionForm from "@/components/shared/ImageActionFrom"

const ImageActionsPage = async({ params }: SearchParamProps) => {
  const { type } = await params; 
  const { userId } = await auth();

  if (!type) redirect("/sign-in");
  if (!userId) redirect("/sign-up");

  const imageAction = imageActions[type];
  const user = await getUserById(userId);

  if (!user) {
    console.error("User not found in DB:", userId);
    redirect("/sign-up"); 
  }

  return (
    <section className='w-full lg:h-screen flex flex-row'>
      <div className="w-full lg:mr-[420px] flex flex-col items-center">
        <ImageActionForm
          action="Add"
          userId={user._id}
          type={imageAction.type as ImageActionTypeKey}
          creditBalance={10}
        />
      </div>
    </section>
  );
};

export default ImageActionsPage