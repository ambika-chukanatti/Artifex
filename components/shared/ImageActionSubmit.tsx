"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

const ImageActionSubmit = ({
  handleSubmit,
  isTransforming,
  isSubmitting,
  handleSave,
}: {
  handleSubmit: () => void
  isTransforming: boolean
  isSubmitting: boolean
  handleSave: () => void
}) => {
  const router = useRouter()
  const wasSaving = useRef(false)

  useEffect(() => {
    if (wasSaving.current && !isSubmitting) {
      router.push("/")
    }
    wasSaving.current = isSubmitting
  }, [isSubmitting, router])

  return (
    <div className="image-action-submit">

      {/* Generate */}
      <button
        type="button"
        className={`submit-btn submit-btn--primary${isTransforming ? " submit-btn--loading" : ""}`}
        onClick={handleSubmit}
        disabled={isTransforming}
      >
        {isTransforming ? (
          <>
            <span className="submit-btn-spinner" />
            Generating…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v3M7 10v3M1 7h3M10 7h3M3.22 3.22l2.12 2.12M8.66 8.66l2.12 2.12M3.22 10.78l2.12-2.12M8.66 5.34l2.12-2.12"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Generate
          </>
        )}
      </button>

      {/* Save */}
      <button
        type="button"
        className={`submit-btn submit-btn--secondary${isSubmitting ? " submit-btn--loading" : ""}`}
        disabled={isSubmitting || isTransforming}
        onClick={handleSave}
      >
        {isSubmitting ? (
          <>
            <span className="submit-btn-spinner submit-btn-spinner--muted" />
            Saving…
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path d="M10.5 11.5H2.5a1 1 0 01-1-1v-9a1 1 0 011-1H9l2.5 2.5v8a1 1 0 01-1 1z"
                stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M4 11.5V7.5h5v4M4 1.5v3h4"
                stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Save Image
          </>
        )}
      </button>

    </div>
  )
}

export default ImageActionSubmit