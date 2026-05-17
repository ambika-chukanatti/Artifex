"use client"

import { useState } from 'react'
import ImageActionFields from './ImageActionFields'
import ImageActionSubmit from './ImageActionSubmit'
import { useRouter } from "next/navigation"

type SideBarProps = {
    type: ImageActionTypeKey;
    form: TransformationParams;
    OnTransformChange: ({ fieldName, value }: { fieldName: string; value: string }) => void;
    isSubmitting: boolean;
    isTransforming: boolean;
    handleSubmit: () => void;
    handleSave: () => void;
}

const Sidebar = ({ type, form, OnTransformChange, isSubmitting, isTransforming, handleSubmit, handleSave }: SideBarProps) => {
  const router = useRouter()

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = event.target.value;
    if(selectedType) {
      router.push(`/image/actions/${selectedType}`)
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">

        {/* Action selector */}
        <div className="sidebar-field">
          <label className="sidebar-label">Image Action</label>
          <select
            onChange={handleTypeChange}
            value={type}
            className="sidebar-select"
          >
            <option value="create">Create Image</option>
            <option value="inpaint">In Paint</option>
            <option value="outpaint">Out Paint</option>
            <option value="remove">Object Remove</option>
            <option value="recolor">Object Recolor</option>
            <option value="replace">Object Replace</option>
            <option value="backgroundRemove">Background Removal</option>
            <option value="backgroundReplace">Background Replace</option>
          </select>
        </div>

        {/* Fields + Submit */}
        <div className="sidebar-body">
          <div className="sidebar-fields-group"> 
            <ImageActionFields
              type={type}
              OnTransformChange={OnTransformChange}
              form={form}
            />
          </div>
          <div className="sidebar-fields-group"> 
            <ImageActionSubmit
              isSubmitting={isSubmitting}
              isTransforming={isTransforming}
              handleSubmit={handleSubmit}
              handleSave={handleSave}
            />
          </div>
        </div>

      </div>
    </aside>
  )
}

export default Sidebar