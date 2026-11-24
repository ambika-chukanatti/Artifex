"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MediaUploader from "./MediaUploader"
import GeneratedImage from "./GeneratedImage"
import ImageActionFields from "./ImageActionFields"
import ImageActionSubmit from "./ImageActionSubmit"
import Sidebar from "./Sidebar"

import { imageActions, defaultValues, getCreditFee } from "@/constants"
import { addImage } from "@/lib/actions/image.actions"
import { generateImage } from "@/lib/actions/stability.actions"
import { useToast } from "@/hooks/use-toast"

const ImageActionForm = ({
  action,
  data = null,
  userId,
  type,
  creditBalance,
}: ImageActionFormProps) => {
  const imageAction = imageActions[type]
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransforming, setIsTransforming] = useState(false)
  const [credits, setCredits] = useState<number>(creditBalance)
  const { toast } = useToast()

  const fee = getCreditFee(type)

  if (action === "Update") {
    data = {
      title: data.title,
      prompt: data?.prompt,
      selectPrompt: data?.selectPrompt,
      publicId: "",
      originalImage: {
        imageUrl: data.originalImage?.imageUrl,
        width: data.originalImage?.width,
        height: data.originalImage?.height,
      },
      transformedImage: {
        imageUrl: data.transformedImage?.imageUrl,
        width: data.transformedImage?.width,
        height: data.transformedImage?.height,
        aspectRatio: data.transformedImage?.aspectRatio,
      },
    }
  } else {
    data = defaultValues
  }

  const [newTransformation, setNewTransformation] =
    useState<TransformationParams>(data)

  const onTransformHandler = async ({
    fieldName,
    value,
  }: {
    fieldName: string
    value: string
  }) => {
    setNewTransformation((prev: any) => ({ ...prev, [fieldName]: value }))
  }

  function redirectToCredits(message: string) {
    toast({
      title: "Not enough credits",
      description: message,
      duration: 3000,
      className: "toast-error",
    })
    setTimeout(() => router.push("/credits"), 1500)
  }

  async function onSubmitHandler() {
    // Quick check so we don't even call the server when it's obviously too low
    if (credits < fee) {
      redirectToCredits(
        `This action costs ${fee} credits. You have ${credits}. Redirecting to the credits page...`
      )
      return
    }

    setIsTransforming(true)

    try {
      // The server checks credits, deducts, calls Stability, and refunds on failure
      const result = await generateImage({
        type,
        prompt: newTransformation.prompt,
        selectPrompt: newTransformation.selectPrompt,
        originalImage: newTransformation.originalImage,
        aspectRatio: newTransformation.transformedImage.aspectRatio,
      })

      if (typeof result.creditBalance === "number") {
        setCredits(result.creditBalance)
      }

      if (result.ok) {
        setNewTransformation((prev: any) => ({
          ...prev,
          transformedImage: {
            ...prev.transformedImage,
            imageUrl: result.imageUrl,
          },
        }))
      } else if (result.code === "INSUFFICIENT_CREDITS") {
        redirectToCredits(`${result.error} Redirecting to the credits page...`)
      } else {
        toast({
          title: "Generation failed",
          description: result.error,
          duration: 4000,
          className: "toast-error",
        })
      }
    } catch (err) {
      toast({
        title: "Generation failed",
        description: "Something went wrong, please try again",
        duration: 4000,
        className: "toast-error",
      })
    } finally {
      setIsTransforming(false)
    }
  }

  async function onSaveHandler() {
    setIsSubmitting(true)
    try {
      const body = {
        title: newTransformation.title,
        prompt: newTransformation.prompt,
        transformationType: type,
        selectPrompt: newTransformation.selectPrompt,
        originalImage: newTransformation.originalImage,
        transformedImage: newTransformation.transformedImage,
      }

      const savedImage = await addImage({ image: body, userId })

      if (savedImage) {
        router.push("/profile")
      } else {
        toast({
          title: "Save failed",
          description: "Something went wrong, please try again",
          duration: 4000,
          className: "toast-error",
        })
      }
    } catch (err) {
      toast({
        title: "Save failed",
        description: "Something went wrong, please try again",
        duration: 4000,
        className: "toast-error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="image-action-page">
      <div className="grid-overlay" />

      <main className="image-action-main">

        <div className="image-action-hero">
          <span className="image-action-badge">{imageAction.type}</span>
          <h1 className="image-action-title">{imageAction.title}</h1>
          <p className="image-action-subtitle">{imageAction.subTitle}</p>
        </div>

        <div className="mobile-fields">
          <ImageActionFields
            type={type}
            OnTransformChange={onTransformHandler}
            form={newTransformation}
          />
        </div>

        <div className="image-action-workspace">
          {type !== "create" && (
            <div className="workspace-panel">
              <span className="workspace-panel-label">Original Image</span>
              <MediaUploader
                newTransformation={newTransformation}
                setNewTransformation={setNewTransformation}
                publicId={newTransformation.publicId}
              />
            </div>
          )}

          <div className="workspace-panel">
            <span className="workspace-panel-label">Generated Image</span>
            <GeneratedImage
              newTransformation={newTransformation}
              type={type}
              title={newTransformation.title}
              isTransforming={isTransforming}
              setIsTransforming={setIsTransforming}
              hasDownload={false}
            />
          </div>
        </div>

        <div className="mobile-submit">
          <ImageActionSubmit
            isSubmitting={isSubmitting}
            isTransforming={isTransforming}
            handleSubmit={onSubmitHandler}
            handleSave={onSaveHandler}
          />
        </div>
      </main>

      <div className="hidden lg:flex">
        <Sidebar
          type={imageAction.type as ImageActionTypeKey}
          form={newTransformation}
          OnTransformChange={onTransformHandler}
          isSubmitting={isSubmitting}
          isTransforming={isTransforming}
          handleSubmit={onSubmitHandler}
          handleSave={onSaveHandler}
        />
      </div>
    </div>
  )
}

export default ImageActionForm