import { defaultValues } from "@/constants"

type ImageActionFieldProps = {
  type: ImageActionTypeKey
  form: TransformationParams
  OnTransformChange: ({ fieldName, value }: { fieldName: string; value: string }) => void
}

const ImageActionFields = ({ type, form, OnTransformChange }: ImageActionFieldProps) => {
  const onInputChange = (e: any) => {
    OnTransformChange({
      fieldName: e.target.name,
      value: e.target.value,
    })
  }

  return (
    <div className="w-full flex flex-col gap-5">

      {/* Image Title */}
      <div className="sidebar-field">
        <label className="sidebar-label">Image Title</label>
        <input
          type="text"
          value={form.title}
          name="title"
          onChange={onInputChange}
          placeholder="e.g. Sunset over the mountains"
          className="sidebar-input"
          required
        />
      </div>

      {/* Prompt */}
      {(type === "create" || type === "inpaint" || type === "backgroundReplace") && (
        <div className="sidebar-field">
          <label className="sidebar-label">Prompt</label>
          <input
            type="text"
            name="prompt"
            value={form.prompt}
            onChange={onInputChange}
            placeholder="Describe what you want…"
            className="sidebar-input"
            required
          />
        </div>
      )}

      {/* Style — create only */}
      {type === "create" && (
        <div className="sidebar-field">
          <label className="sidebar-label">Style</label>
          <select
            name="selectPrompt"
            value={form.selectPrompt}
            onChange={onInputChange}
            className="sidebar-select"
            required
          >
            <option value="">Select style</option>
            <option value="cinematic">Cinematic</option>
            <option value="anime">Anime</option>
            <option value="digital-art">Digital Art</option>
            <option value="fantasy-art">Fantasy Art</option>
            <option value="3d-model">3D Model</option>
            <option value="pixel-art">Pixel Art</option>
          </select>
        </div>
      )}

      {/* Aspect Ratio — outpaint / create */}
      {(type === "outpaint" || type === "create") && (
        <div className="sidebar-field">
          <label className="sidebar-label">Aspect Ratio</label>
          <select
            name="aspectRatio"
            value={form.transformedImage.aspectRatio}
            onChange={onInputChange}
            className="sidebar-select"
            required
          >
            <option value="">Select ratio</option>
            <option value="1024:1024">Square (1:1)</option>
            <option value="768:1024">Standard Portrait (3:4)</option>
            <option value="1024:768">Standard Landscape (4:3)</option>
            <option value="576:1024">Phone Portrait (9:16)</option>
          </select>
        </div>
      )}

      {/* Object to recolor / replace */}
      {(type === "recolor" || type === "replace") && (
        <div className="sidebar-field">
          <label className="sidebar-label">
            Object to {type === "recolor" ? "Recolor" : "Replace"}
          </label>
          <input
            type="text"
            name="selectPrompt"
            value={form.selectPrompt}
            onChange={onInputChange}
            placeholder={type === "recolor" ? "e.g. car, sky, shirt…" : "e.g. tree, person…"}
            className="sidebar-input"
            required
          />
        </div>
      )}

      {/* Color / New Object */}
      {(type === "recolor" || type === "replace") && (
        <div className="sidebar-field">
          <label className="sidebar-label">
            {type === "recolor" ? "Target Color" : "New Object"}
          </label>
          <input
            type="text"
            name="prompt"
            value={form.prompt}
            onChange={onInputChange}
            placeholder={type === "recolor" ? "e.g. red, navy blue…" : "e.g. a dog, a bicycle…"}
            className="sidebar-input"
            required
          />
        </div>
      )}

    </div>
  )
}

export default ImageActionFields