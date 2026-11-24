"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MediaUploader from "./MediaUploader"
import GeneratedImage from "./GeneratedImage"
import ImageActionFields from "./ImageActionFields"
import ImageActionSubmit from "./ImageActionSubmit"
import Sidebar from "./Sidebar"

import { imageActions, defaultValues, urlPath, getCreditFee } from "@/constants"
import { calculateIncrements } from "@/lib/utils"
import { addImage } from "@/lib/actions/image.actions"
import { updateCredits } from "@/lib/actions/user.actions"
import { urlToPng } from "@/lib/async_utils"
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
  const apikey = "sk-ubDlsrKhcm2R6AoDW2iQFihdxk53N9kuqbyhMVaqyhLfmeYc"

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

  // Returns true if the image was generated successfully
  async function createImageSubmit(): Promise<boolean> {
    const body = JSON.stringify({
      text_prompts: [{ text: newTransformation.prompt }],
      width: 1024,
      height: 1024,
      style_preset: newTransformation.selectPrompt,
    })

    try {
      const res = await fetch(
        "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${apikey}`,
          },
          body,
        }
      )
      if (res.status === 200) {
        const imageData = await res.json()
        const imageUrl = `data:image/png;base64,${imageData.artifacts[0].base64}`
        setNewTransformation((prev: any) => ({
          ...prev,
          transformedImage: { ...prev.transformedImage, imageUrl },
        }))
        return true
      } else {
        toast({
          title: "Generation failed",
          description: `Error ${res.status} — please try again`,
          duration: 4000,
          className: "toast-error",
        })
        return false
      }
    } catch (err) {
      toast({
        title: "Generation failed",
        description: "Something went wrong, please try again",
        duration: 4000,
        className: "toast-error",
      })
      return false
    }
  }

  async function getPayload(type: ImageActionTypeKey) {
    
    if (type === "recolor") {
      const pngImg = await urlToPng(newTransformation.originalImage.imageUrl)
      const formData = new FormData()
      formData.append("image", pngImg, "image.png")
      formData.append("prompt", newTransformation.prompt)
      formData.append("select_prompt", newTransformation.selectPrompt)
      return formData
    
    } else if (type === "replace") {
      const pngImg = await urlToPng(newTransformation.originalImage.imageUrl)
      const formData = new FormData()
      formData.append("image", pngImg, "image.png")
      formData.append("prompt", newTransformation.prompt)
      formData.append("search_prompt", newTransformation.selectPrompt)
      return formData
    
    } else if (type === "inpaint") {
      const pngImg = await urlToPng(newTransformation.originalImage.imageUrl)
      const formData = new FormData()
      formData.append("image", pngImg, "image.png")
      formData.append("prompt", newTransformation.prompt)
      return formData
    
    } else if (type === "outpaint") {
      const pngImg = await urlToPng(newTransformation.originalImage.imageUrl)
      const dimension = calculateIncrements({
        currentWidth: newTransformation.originalImage.width,
        currentHeight: newTransformation.originalImage.width,
        targetAspectRatio: newTransformation.transformedImage.aspectRatio,
      })
      const formData = new FormData()
      formData.append("image", pngImg, "image.png")
      formData.append("left", dimension.left.toString())
      formData.append("right", dimension.right.toString())
      formData.append("up", dimension.up.toString())
      formData.append("down", dimension.down.toString())
      formData.append("output_format", "png")
      return formData
    
    } else if (type === "remove") {
      const pngImg = await urlToPng(newTransformation.originalImage.imageUrl)
      const formData = new FormData()
      formData.append("image", pngImg, "image.png")
      formData.append("search_prompt", newTransformation.selectPrompt)
      return formData
    
    } else if (type === "backgroundRemove") {
      const pngImg = await urlToPng(newTransformation.originalImage.imageUrl)
      const formData = new FormData()
      formData.append("image", pngImg, "image.png")
      formData.append("output_format", "png")
      return formData
    
    } else if (type === "backgroundReplace") {
      const pngImg = await urlToPng(newTransformation.originalImage.imageUrl)
      const formData = new FormData()
      formData.append("image", pngImg, "image.png")
      formData.append("prompt", newTransformation.prompt)
      formData.append("output_format", "png")
      return formData
    }
  }

  async function onSubmitHandler() {
    // 1. Not enough credits: send the user to the buy credits page
    if (credits < fee) {
      toast({
        title: "Not enough credits",
        description: `This action costs ${fee} credit${fee > 1 ? "s" : ""}. You have ${credits}. Redirecting to the credits page...`,
        duration: 3000,
        className: "toast-error",
      })
      setTimeout(() => router.push("/credits"), 1500)
      return
    }

    setIsTransforming(true)
    try {
      let success = false

      if (type === "create") {
        success = await createImageSubmit()
      } else {
        const body = await getPayload(type)
        const res = await fetch(
          `https://api.stability.ai/v2beta/stable-image/edit/${urlPath[type]}`,
          {
            method: "POST",
            body,
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${apikey}`,
            },
          }
        )
        if (res.status === 200) {
          const imageData = await res.json()
          const imageUrl = `data:image/png;base64,${imageData.image}`
          setNewTransformation((prev: any) => ({
            ...prev,
            transformedImage: { ...prev.transformedImage, imageUrl },
          }))
          success = true
        } else {
          toast({
            title: "Generation failed",
            description: `Error ${res.status} — please try again`,
            duration: 4000,
            className: "toast-error",
          })
        }
      }

      // 2. Charge credits only when the AI call succeeded
      if (success) {
        const updatedUser = await updateCredits(userId, -fee)
        if (updatedUser) setCredits(updatedUser.creditBalance)
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

      // 3. Redirect to profile only when the save succeeded
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