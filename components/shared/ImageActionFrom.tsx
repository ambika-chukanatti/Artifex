"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import MediaUploader from "./MediaUploader"
import GeneratedImage from "./GeneratedImage"
import ImageActionFields from "./ImageActionFields"
import ImageActionSubmit from "./ImageActionSubmit"
import Sidebar from "./Sidebar"

import { imageActions, defaultValues, urlPath } from "@/constants"
import { AspectRatioKey, debounce, deepMergeObjects, calculateIncrements } from "@/lib/utils"
import { addImage } from "@/lib/actions/image.actions"
import { urlToPng } from "@/lib/async_utils"

const ImageActionForm = ({
  action,
  data = null,
  userId,
  type,
  creditBalance,
}: ImageActionFormProps) => {
  const imageAction = imageActions[type]
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransforming, setIsTransforming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const apikey = "sk-HOvmjrQiLvLr6UnCpPY1BR36tThVuqJk9nLTA5DxxxlCMxgy"

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

  async function createImageSubmit() {
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
      }
    } catch (err) {
      alert(err)
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
      formData.append("image", pngImg)
      formData.append("prompt", newTransformation.prompt)
      formData.append("search_prompt", newTransformation.selectPrompt)
      return formData
    } else if (type === "inpaint") {
      const pngImg = await urlToPng(newTransformation.originalImage.imageUrl)
      const formData = new FormData()
      formData.append("image", pngImg)
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
      formData.append("image", pngImg)
      formData.append("left", dimension.left.toString())
      formData.append("right", dimension.right.toString())
      formData.append("up", dimension.up.toString())
      formData.append("down", dimension.down.toString())
      return formData
    } else if (type === "remove") {
      const pngImg = await urlToPng(newTransformation.originalImage.imageUrl)
      const formData = new FormData()
      formData.append("image", pngImg)
      return formData
    } else if (type === "backgroundRemove") {
      const pngImg = await urlToPng(newTransformation.originalImage.imageUrl)
      const formData = new FormData()
      formData.append("image", pngImg, "image.png")
      return formData
    } else if (type === "backgroundReplace") {
      const pngImg = await urlToPng(newTransformation.originalImage.imageUrl)
      const formData = new FormData()
      formData.append("image", pngImg)
      formData.append("background_prompt", newTransformation.prompt)
      return formData
    }
  }

  async function onSubmitHandler() {
    if (type === "create") {
      createImageSubmit()
    } else {
      const body = await getPayload(type)
      try {
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
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  async function onSaveHandler() {
    try {
      const body = {
        title: newTransformation.title,
        prompt: newTransformation.prompt,
        transformationType: type,
        selectPrompt: newTransformation.selectPrompt,
        originalImage: newTransformation.originalImage,
        transformedImage: newTransformation.transformedImage,
      }
      await addImage({ image: body, userId })
    } catch (err) {
      alert(err)
    }
  }

  return (
    <div className="image-action-page">
      <div className="grid-overlay" />

      {/* Main scrollable area */}
      <main className="image-action-main">

        {/* Hero */}
        <div className="image-action-hero">
          <span className="image-action-badge">{imageAction.type}</span>
          <h1 className="image-action-title">{imageAction.title}</h1>
          <p className="image-action-subtitle">{imageAction.subTitle}</p>
        </div>

        {/* Mobile-only: sidebar fields */}
        <div className="mobile-fields">
          <ImageActionFields
            type={type}
            OnTransformChange={onTransformHandler}
            form={newTransformation}
          />
        </div>

        {/* Image workspace */}
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

        {/* Mobile-only: submit */}
        <div className="mobile-submit">
          <ImageActionSubmit
            isSubmitting={isSubmitting}
            isTransforming={isTransforming}
            handleSubmit={onSubmitHandler}
            handleSave={onSaveHandler}
          />
        </div>
      </main>

      {/* Desktop sidebar */}
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