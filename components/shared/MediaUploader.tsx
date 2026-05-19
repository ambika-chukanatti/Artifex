"use client"

import { useToast } from "@/hooks/use-toast"
import { dataUrl } from "@/lib/utils"
import { CldImage, CldUploadWidget } from "next-cloudinary"
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props"

type MediaUploaderProps = {
  newTransformation: TransformationParams
  setNewTransformation: React.Dispatch<any>
  publicId: string
}

const MediaUploader = ({ newTransformation, setNewTransformation, publicId }: MediaUploaderProps) => {
  const { toast } = useToast()

  const onUploadSuccessHandler = (result: any) => {
    setNewTransformation((prevState: any) => ({
      ...prevState,
      publicId: result?.info?.public_id,
      originalImage: {
        width: result?.info?.width,
        height: result?.info?.height,
        imageUrl: result?.info?.secure_url,
      },
    }))
  }

  const onUploadErrorHandler = () => {
    toast({ title: "Upload failed", description: "Please try again", duration: 3000, className: "success-toast" })
  }

  return (
    <>
      {/* Shrinks the iframe popup globally */}
      <style>{`
        body > div[style*="z-index"] > div {
          width: 720px !important;
          height: 560px !important;
          max-width: 92vw !important;
          max-height: 85vh !important;
          border-radius: 14px !important;
          overflow: hidden !important;
        }
        body > div[style*="z-index"] {
          background: rgba(0, 0, 0, 0.75) !important;
          backdrop-filter: blur(4px) !important;
        }
      `}</style>

      <CldUploadWidget
        uploadPreset="artify"
        options={{
          multiple: false,
          resourceType: "image",
          sources: ["local", "url", "camera", "google_drive", "instagram", "shutterstock", "istock", "unsplash"],   
          styles: {
            palette: {
              window: "#0f0f11",
              windowBorder: "#2a2a35",
              sourceBg: "#18181f",
              tabIcon: "#a855f7",
              menuIcons: "#a855f7",
              link: "#a855f7",
              action: "#a855f7",
              inProgress: "#a855f7",
              complete: "#22c55e",
              error: "#ef4444",
              inactiveTabIcon: "#555566",
              textDark: "#f1f1f3",
              textLight: "#888899",
            },
            fonts: {
              default: null,
              "'Inter', sans-serif": {
                url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
                active: true,
              },
            },
          },
        }}
        onSuccess={onUploadSuccessHandler}
        onError={onUploadErrorHandler}
      >
        {({ open }) =>
          publicId ? (
            <div className="media-uploader-frame" onClick={() => open()}>
              <CldImage
                width={newTransformation.originalImage.width}
                height={newTransformation.originalImage.height}
                src={publicId}
                alt="uploaded image"
                sizes="(max-width: 480px) 100vw, 420px"
                placeholder={dataUrl as PlaceholderValue}
                className="media-uploader-img"
              />
            </div>
          ) : (
            <div className="media-uploader-frame media-uploader-empty" onClick={() => open()}>
              <div className="media-uploader-icon">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 14V4M11 4L7.5 7.5M11 4L14.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 15v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="media-uploader-text">Click to upload image</p>
              <p className="media-uploader-subtext">PNG, JPG, WEBP</p>
            </div>
          )
        }
      </CldUploadWidget>
    </>
  )
}

export default MediaUploader