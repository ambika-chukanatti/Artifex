"use client"

import { deleteImage } from "@/lib/actions/image.actions"
import { download } from "@/lib/utils"
import { useRouter } from "next/navigation"

const ImageView = ({ image, userId }: {image: UpdatedImageParams, userId: string}) => {
    const router = useRouter()

    const handleDownload = () => {
        download(image.transformedImage.imageUrl, "image")
    }

    const handleDelete = async() => {
        try {
            await deleteImage(image._id)
        } catch(err) {
            console.log(err)
        }
    }

    const handleEdit = () => {
        router.push(`/image/${image._id}/update`)
    }

    return (
        <div className="image-view">
            {/* Header */}
            <div className="image-view-header">
                <div className="profile-hero-badge">Image View</div>
                <h1 className="profile-hero-title">{image.title}</h1>
            </div>

            {/* Images */}
            <div className="image-view-panels">
                {image.transformationType !== 'create' && (
                    <div className="image-panel">
                        <div className="image-panel-header">
                            <span className="image-panel-label">Original</span>
                        </div>
                        <div className="image-panel-frame">
                            {image.originalImage?.imageUrl ? (
                                <img
                                    src={image.originalImage.imageUrl}
                                    alt={image.title}
                                    className="image-panel-img"
                                />
                            ) : (
                                <div className="image-panel-empty">Image Not Available</div>
                            )}
                        </div>
                    </div>
                )}

                <div className="image-panel">
                    <div className="image-panel-header">
                        <span className="image-panel-label">Transformed</span>
                        <div className="image-panel-actions">
                            {image.author.clerkId === userId && (
                                <>
                                    <button className="image-action-btn" onClick={handleDelete} title="Delete">
                                        <img src="/assets/icons/delete.svg" alt="delete" width={16} height={16} />
                                    </button>
                                    <button className="image-action-btn" onClick={handleEdit} title="Edit">
                                        <img src="/assets/icons/edit.svg" alt="edit" width={16} height={16} />
                                    </button>
                                </>
                            )}
                            <button className="image-action-btn" onClick={handleDownload} title="Download">
                                <img src="/assets/icons/download.svg" alt="download" width={18} height={18} />
                            </button>
                        </div>
                    </div>
                    <div className="image-panel-frame">
                        <img
                            src={image.transformedImage.imageUrl}
                            alt={image.title}
                            className="image-panel-img"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ImageView