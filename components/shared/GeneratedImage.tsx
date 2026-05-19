"use client"

import Image from "next/image"
import { CldImage, getCldImageUrl } from "next-cloudinary"
import { dataUrl, debounce, download, getImageSize } from "@/lib/utils"
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props"

const GeneratedImage = ({
  newTransformation,
  type,
  title,
  isTransforming,
  setIsTransforming,
  hasDownload
}:{
  newTransformation: TransformationParams;
  type: ImageActionTypeKey;
  title: string;
  isTransforming: boolean;
  setIsTransforming: (value:boolean) => void;
  hasDownload: boolean;
}) => {
  const downloadHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    download(getCldImageUrl({
      width: newTransformation.transformedImage.width,
      height: newTransformation.transformedImage.height,
      src: newTransformation.publicId
    }), title)
  }

  return (
    <div className="generated-image-wrapper">
      {hasDownload && (
        <div className="generated-image-toolbar">
          <button className="image-action-btn" onClick={downloadHandler} title="Download">
            <Image src="/assets/icons/download.svg" alt="download" width={18} height={18} />
          </button>
        </div>
      )}

      {newTransformation.transformedImage?.imageUrl ? (
        <div className={`generated-image-frame${isTransforming ? " generated-image-frame--generating" : ""}`}>

          {isTransforming && <div className="generated-image-scan" />}

          <CldImage
            width={newTransformation.transformedImage.height}
            height={newTransformation.transformedImage.width}
            src={newTransformation.transformedImage.imageUrl}
            alt={title}
            sizes="(max-width: 665px) 100vw, 600px"
            placeholder={dataUrl as PlaceholderValue}
            className="generated-image-img"
            onLoad={() => {
              setIsTransforming && setIsTransforming(false)
            }}
            onError={() => {
              debounce(() => {
                setIsTransforming && setIsTransforming(false)
              }, 8000)()
            }}
          />

          {isTransforming && (
            <div className="generated-image-loader">
              <Image src="/assets/icons/spinner.svg" alt="transforming" width={40} height={40} />
              <p className="generated-image-loader-text">Please wait...</p>
            </div>
          )}
        </div>
      ) : (
        <div className={`generated-image-placeholder${isTransforming ? " generated-image-frame--generating" : ""}`}>
          {isTransforming && <div className="generated-image-scan" />}
          <span className="generated-image-placeholder-icon">✦</span>
          <span className="generated-image-placeholder-text">
            {isTransforming ? "Generating…" : "Generated image will appear here"}
          </span>
        </div>
      )}
    </div>
  )
}

export default GeneratedImage