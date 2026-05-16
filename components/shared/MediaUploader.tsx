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
    toast({ title: "Upload Successful", description: "1 credit deducted", duration: 3000, className: "success-toast" })
  }

  const onUploadErrorHandler = () => {
    toast({ title: "Upload failed", description: "Please try again", duration: 3000, className: "success-toast" })
  }

  return (
    <CldUploadWidget
      uploadPreset="artify"
      options={{ multiple: false, resourceType: "image" }}
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
            {/* Upload icon */}
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
  )
}

export default MediaUploader